import { Request, Response } from "express";
import { errorHandler } from "../utils/ErrorHandler";
import prisma from "../config/prismaClient";

export const DeleteUser = errorHandler(async (req: Request, res: Response) => {
  const { id } = req.body;

  // Optional: validate id
  if (!id) {
    return res.status(400).json({ status: false, message: "User ID is required" });
  }

  // Delete the user
  const deletedUser = await prisma.user.delete({
    where: {
    //   id,
    email:"narotta2003@gmail.com"
    },
  });

  return res.status(200).json({
    status: true,
    message: "User deleted successfully",
    user: deletedUser, // optional: return the deleted user info
  });
});
