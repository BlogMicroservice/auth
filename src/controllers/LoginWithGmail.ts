import { Request, Response } from 'express';
import { errorHandler } from '../utils/ErrorHandler';
import { oAuthCLient } from '../config/oAuthClient';
import prisma from '../config/prismaClient';
import axios from 'axios';
import { generateTokens } from '../utils/generateTokens';

export const LoginWithGoogle = errorHandler(async (req: Request, res: Response) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ status: false, message: 'Missing OAuth “code”' });
  }

  try {
    const { tokens } = await oAuthCLient.getToken(code);
    if (!tokens.id_token) {
      return res.status(400).json({ status: false, message: 'Invalid OAuth code' });
    }

    oAuthCLient.setCredentials(tokens);

    const ticket = await oAuthCLient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(401).json({ status: false, message: 'Unable to verify user' });
    }

    const email = payload.email;

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        email,
        provider: 'Google',
      },
    });

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Save refreshToken
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Set access token as cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    // Fetch profile
    const profileRes = await axios.get(`http://localhost:3002/user/profile/id${user.id}`);
    const profile = profileRes.data?.data;

    return res.status(200).json({
      status: true,
      message: 'Login successful',
      userName: profile?.userName,
      profileImage: profile?.profileImage,
    });

  } catch (err: any) {
    console.error('Google Login Error:', err?.response?.data || err);
    return res.status(500).json({ status: false, message: 'Google login failed' });
  }
});
