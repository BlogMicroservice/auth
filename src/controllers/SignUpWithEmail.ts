import { Request, Response } from 'express';
import { errorHandler } from '../utils/ErrorHandler';
import prisma from '../config/prismaClient';
import redisClient from '../config/redis';
import bcrypt from 'bcrypt';
import otpGenerator from 'otp-generator';
import { EmailSignupInfo } from '../types/signup';
import { json } from 'stream/consumers';
import { publishMessage } from '../config/rabitmq';
export const signUpWithEmail = errorHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if(!email||!password){
     res.json({
      status: false,
      message:
        'Email and Password is Required',
    });
    return;
  }
  const findUser = await prisma.user.findFirst({
    where: {
      email,
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

  const existingSession = await redisClient.get(`googleSignup:${email}`);
  if (existingSession) {
    res.json({
      status: false,
      message:
        'User already exists or is in session. Try another Google account to create a new account.',
    });
    return;
  }

  const existingSessionEmail = await redisClient.get(`EmailSignup:${email}`);
  if (existingSessionEmail) {
    res.json({
      status: false,
      message:
        'User already exists or is in session. Try another Google account to create a new account.',
    });
    return;
  }
  const saltRound = 10;
  const salt = await bcrypt.genSalt(saltRound);
  const hashPassword = await bcrypt.hash(password, salt);

  const otp = otpGenerator.generate(5, {
    upperCaseAlphabets: true,
    lowerCaseAlphabets: true,
    specialChars: true,
  });

  const EmailPayload: EmailSignupInfo = {
    email,
    password: hashPassword,
    verified: false,
    otp,
    otpRetryLeft:3
  };

  publishMessage("emailOtp",JSON.stringify(EmailPayload))

  await redisClient.setex(
    `EmailSignup:${email}`,
    300,
    JSON.stringify(EmailPayload),
  );

  // Send response
  res.json({
    status: true,
    message: 'Notification sent successfully',
  });
});
