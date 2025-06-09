import { Request, Response } from 'express';
import { errorHandler } from '../utils/ErrorHandler';
import redisClient from '../config/redis';
import { EmailSignupInfo } from '../types/signup';

export const VerifyOTP = errorHandler(async (req: Request, res: Response) => {
  const { otp, email } = req.body;

  if (!otp || !email) {
    return res.json({ status: false, message: 'OTP or email is missing.' });
  }

  const existingSessionEmail = await redisClient.get(`EmailSignup:${email}`);

  if (!existingSessionEmail) {
    return res.json({
      status: false,
      message: 'User does not exist or session has expired.',
    });
  }

  let JsonEmailSession: EmailSignupInfo = JSON.parse(existingSessionEmail);

  if (JsonEmailSession.otp !== otp) {
    JsonEmailSession.otpRetryLeft -= 1;

    if (JsonEmailSession.otpRetryLeft <= 0) {
      await redisClient.del(`EmailSignup:${email}`);
      return res.json({
        status: false,
        message:
          'You have reached the maximum number of OTP attempts. Please try signing up again later.',
      });
    }

    // Update retry count in Redis
    const ttlInSeconds = await redisClient.ttl(`EmailSignup:${email}`);
    await redisClient.setex(
      `EmailSignup:${email}`,
      ttlInSeconds,
      JSON.stringify(JsonEmailSession),
    );

    return res.json({ status: false, message: 'OTP does not match.' });
  }

  JsonEmailSession.verified = true;
  const ttlInSeconds = await redisClient.ttl(`EmailSignup:${email}`);
  await redisClient.setex(
    `EmailSignup:${email}`,
    ttlInSeconds,
    JSON.stringify(JsonEmailSession),
  );

  return res.json({ status: true, message: 'OTP verified successfully.' });
});

export default VerifyOTP;
