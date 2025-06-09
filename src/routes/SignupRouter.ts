import express from "express"
import { signUpWithGoogle } from "../controllers/SignUpwithGoogle"
import { CreatAccount } from "../controllers/CreateAccount"
import { CreateUser } from "../controllers/CreateUser"
import { DeleteUser } from "../controllers/DeleteUser"
import { signUpWithEmail } from "../controllers/SignUpWithEmail"
import { resendOTP } from "../controllers/ResendOTP"
import { LoginWithEmail } from "../controllers/LoginWithEmail"
import { LoginWithGoogle } from "../controllers/LoginWithGmail"
export const router= express.Router()
router.post("/signup-google",signUpWithGoogle)
router.post("/create-account",CreatAccount)
router.post("/create-user",CreateUser)
router.delete("/delete-user",DeleteUser)
router.post("/signup-email",signUpWithEmail)
router.post("/resend-otp",resendOTP)
router.post("/verify-otp",resendOTP)
router.post("/login",LoginWithEmail)
router.post("/login-google",LoginWithGoogle)