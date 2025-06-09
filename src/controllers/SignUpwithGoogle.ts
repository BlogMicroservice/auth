import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { errorHandler } from '../utils/ErrorHandler';
import { oAuthCLient } from '../config/oAuthClient';
import redisClient from '../config/redis';
import { GoogleSignupInfo } from '../types/signup';
import prisma from '../config/prismaClient';

dotenv.config();

export const signUpWithGoogle = errorHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { code } = req.body as { code?: string };

    if (!code) {
      res.status(400).json({ status: false, message: 'Missing OAuth “code”' });
      return;
    }
    // console.log('Code', code);
    const { tokens } = await oAuthCLient.getToken(code);
    oAuthCLient.setCredentials(tokens);
    // console.log('token', tokens);
    const ticket = await oAuthCLient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    // console.log('ticket', ticket);
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      res.status(401).json({ status: false, message: 'Unable to verify user' });
      return;
    }
    // console.log(payload);
    const user: GoogleSignupInfo = {
      email: payload.email,
      username: payload.name ?? undefined,
      providerId: payload.sub,
      profileImage: payload.picture ?? undefined,
    };

    const findUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: payload.email },
          { providerId: payload.sub, provider: 'Google' },
        ],
      },
    });

    if (findUser) {
      res.json({
        status: false,
        message:
          'User already exists or is in session. Try another Google account to create a new account.',
      });
      return;
    }

    const existingSession = await redisClient.get(
      `googleSignup:${payload.email}`,
    );
    if (existingSession) {
      res.json({
        status: false,
        message:
          'User already exists or is in session. Try another Google account to create a new account.',
      });
      return;
    }
    const existingSessionEmail = await redisClient.get(
      `EmailSignup:${payload.email}`,
    );
    if (existingSessionEmail) {
      res.json({
        status: false,
        message:
          'User already exists or is in session. Try another Google account to create a new account.',
      });
      return;
    }
    await redisClient.setex(
      `googleSignup:${user.email}`,
      300, //600 - 10 minutes
      JSON.stringify(user),
    );

    res.json({
      status: true,
      payload: user,
      message: 'Session Created Sucessfully',
    });
  },
);
