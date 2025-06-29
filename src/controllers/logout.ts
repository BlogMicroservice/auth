import { Request, Response } from "express";
import { errorHandler } from "../utils/ErrorHandler";

export const logout = errorHandler(async (req: Request, res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });

  return res.status(200).json({ message: "Logged out successfully." });
});
