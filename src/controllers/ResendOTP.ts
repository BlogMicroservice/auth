import { Request, Response } from 'express';
import { errorHandler } from '../utils/ErrorHandler';
import { start } from 'repl';
import { json } from 'stream/consumers';
import redisClient from '../config/redis';
import { EmailSignupInfo } from '../types/signup';
import otpGenerator from 'otp-generator';
import { publishMessage } from '../config/rabitmq';
export const resendOTP = errorHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.json({ status: false, message: 'Email is required' });
  }
  const getEmailPayload = await redisClient.get(`EmailSignup:${email}`);
  if (!getEmailPayload) {
    res.json({ status: false, message: 'not in Session' });
    return;
  }
  let EmailPayload: EmailSignupInfo = JSON.parse(getEmailPayload);
  const otp = otpGenerator.generate(5, {
    upperCaseAlphabets: true,
    lowerCaseAlphabets: true,
    specialChars: true,
  });
  const ttlInSeconds = await redisClient.ttl(`EmailSignup:${email}`);
  EmailPayload.otp = otp;
  await redisClient.setex(
    `EmailSignup:${email}`,
    ttlInSeconds,
    JSON.stringify(EmailPayload),
  );
  publishMessage('emailOtp', JSON.stringify(EmailPayload));
  res.json({ status: true, message: 'OTP Send Sucessfully' });
});
