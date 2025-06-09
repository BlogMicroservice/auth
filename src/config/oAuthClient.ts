import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';
dotenv.config();
export const oAuthCLient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'postmessage' // redirect_uri for "auth-code" flow from frontend
);