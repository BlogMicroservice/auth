import { Request, Response } from 'express';
import { errorHandler } from '../utils/ErrorHandler';
import bcrypt from 'bcrypt';
import prisma from '../config/prismaClient';
import axios from 'axios';
import { generateTokens } from '../utils/generateTokens';
import { URL_BASE_PUBLIC } from '../config/constants';

export const LoginWithEmail = errorHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        email,
        provider: 'Email',
      },
    });

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    if (!user.passwordHash) {
      return res
        .status(400)
        .json({ status: false, message: 'Password not set for this account' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res
        .status(401)
        .json({ status: false, message: 'Invalid password' });
    }

    try {
      const data = await axios.get(
        `${URL_BASE_PUBLIC}/user/profile/${user.id}`
      );

      if (data.data.status) {
        const { accessToken, refreshToken } = generateTokens({ id: user.id });

        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            refreshToken: refreshToken,
          },
        });

        res.cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 24*60 * 60 * 1000, // 15 minutes
        });

        return res.status(200).json({
          status: true,
          message: 'Login successful',
          userName: data.data.data.userName,
          profileImage: data.data.data.profileImage,
        });
      } else {
        return res
          .status(500)
          .json({ status: false, message: 'Profile service error' });
      }
    } catch (err) {
      return res
        .status(500)
        .json({ status: false, message: 'Failed to fetch user profile' });
    }
  }
);
