export type GoogleSignupInfo ={
  username?: string;
  email: string;
  providerId:string;
  profileImage?:string
}
export type EmailSignupInfo ={
  username?: string;
  email: string;
  verified:boolean;
  password:string;
  otp:string;
  otpRetryLeft:number
}