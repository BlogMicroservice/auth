import { Request, Response } from 'express';
import axios from 'axios';
import redisClient from '../config/redis';
import { errorHandler } from '../utils/ErrorHandler';
import { json } from 'stream/consumers';

const CreateAccountWithGooge = async (
  res: Response,
  email: string,
  username: string,
) => {
  const userSessionRaw = await redisClient.getex(`googleSignup:${email}`);

  //   console.log("userSessionRaw",userSessionRaw)

  if (!userSessionRaw) {
    return res
      .status(410)
      .json({ status: false, message: 'Session has expired' });
  }

  const userSessionData = JSON.parse(userSessionRaw);
  console.log('userSession', userSessionData);

  const { data: usernameCheck } = await axios.get(
    `http://localhost:3002/user/username/check?user_name=${username}`,
  );
  console.log('usernameCheck', usernameCheck);
  if (!usernameCheck.status) {
    return res.status(409).json(usernameCheck); // username already taken
  }

  const { data: userCreate } = await axios.post(
    'http://localhost:3002/auth/signup/create-user',
    { signUpOption: 'Google', userSessionData },
  );

  if (!userCreate.status) {
    return res.status(500).json(userCreate); // delegate message from Auth
  }

  const userId = userCreate.userId as string;

  const { data: profileCreate } = await axios.post(
    'http://localhost:3002/user/create-profile',
    {
      profileId: userId,
      email,
      username,
      profileImage: userSessionData.profileImage,
    },
  );

  if (!profileCreate.status) {
    await axios.delete('http://localhost:3002/auth/signup/delete-user', {
      data: { id: userId },
    });
    return res
      .status(500)
      .json({ status: false, message: 'Error while creating account' });
  }

  return res.status(201).json({
    status: true,
    message: 'Account created successfully',
    userId,
  });
};
let CreateAccountWithEmail = async (
  res: Response,
  email: string,
  username: string,
) => {
  const userSessionRaw = await redisClient.getex(`EmailSignup:${email}`);

  if (!userSessionRaw) {
    return res
      .status(410)
      .json({ status: false, message: 'Session has expired' });
  }
  const userSessionData = JSON.parse(userSessionRaw);
  console.log('userSession', userSessionData);

  const { data: usernameCheck } = await axios.get(
    `http://localhost:3002/user/username/check?user_name=${username}`,
  );
  console.log('usernameCheck', usernameCheck);
  if (!usernameCheck.status) {
    return res.status(409).json(usernameCheck); // username already taken
  }

  const { data: userCreate } = await axios.post(
    'http://localhost:3002/auth/signup/create-user',
    { signUpOption: 'Email', userSessionData },
  );

  if (!userCreate.status) {
    return res.status(500).json(userCreate); // delegate message from Auth
  }

  const userId = userCreate.userId as string;

  const { data: profileCreate } = await axios.post(
    'http://localhost:3002/user/create-profile',
    {
      profileId: userId,
      email,
      username,
      profileImage: "",
    },
  );

  if (!profileCreate.status) {
    await axios.delete('http://localhost:3002/auth/signup/delete-user', {
      data: { id: userId },
    });
    return res
      .status(500)
      .json({ status: false, message: 'Error while creating account' });
  }

  return res.status(201).json({
    status: true,
    message: 'Account created successfully',
    userId,
  });
};
export const CreatAccount = errorHandler(
  async (req: Request, res: Response) => {
    const { signUpOption, email, username } = req.body;
    if (!signUpOption || !email || !username) {
      res.json({ status: false, message: 'Not in session' });
    }
    if (signUpOption == 'Google')
      await CreateAccountWithGooge(res, email, username);
    else await CreateAccountWithEmail(res, email, username);
  },
);
