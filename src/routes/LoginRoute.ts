import express from "express"
import { LoginWithEmail } from "../controllers/LoginWithEmail"
import { LoginWithGoogle } from "../controllers/LoginWithGmail"
import { logout } from "../controllers/logout"
export const loginRouter= express.Router()
loginRouter.post("/login-email",LoginWithEmail)
loginRouter.post("/login-google",LoginWithGoogle)
