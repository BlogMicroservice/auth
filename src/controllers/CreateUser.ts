import { Request, Response } from 'express';
import { errorHandler } from '../utils/ErrorHandler';
import prisma from '../config/prismaClient';

export const CreateUser = errorHandler(async (req: Request, res: Response) => {
  const { signUpOption, userSessionData } = req.body;

  if (signUpOption === 'Google') {
    const { email, providerId } = userSessionData;
    console.log(email, providerId);
    let existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      const newUser = await prisma.user.create({
        data: {
          email,
          provider: signUpOption,
          providerId,
        },
      });

      return res.json({
        status: true,
        userId: newUser.id,
        message: 'User Created Sucessfully',
      });
    } else {
      return res.json({ status: false, message: 'User Already Exist' });
    }
  } else if (signUpOption === 'Email') {
    const { email, password } = userSessionData;
    let existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (!existingUser) {
      const newUser = await prisma.user.create({
        data: {
          email,
          provider: signUpOption,
          providerId: email,
          passwordHash: password,
        },
      });

      return res.json({
        status: true,
        userId: newUser.id,
        message: 'User Created Sucessfully',
      });
    } else {
      return res.json({ status: false, message: 'User Already Exist' });
    }
  } else {
    return res
      .status(400)
      .json({ status: false, message: 'Signup option not recognized' });
  }
});
