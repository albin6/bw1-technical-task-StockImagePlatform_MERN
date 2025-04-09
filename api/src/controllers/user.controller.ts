import { Messages } from "constants/messages";
import { StatusCode } from "constants/status-codes";
import { Request, Response } from "express";
import { CustomRequest } from "middlewares/auth.middleware";
import { UserModel } from "models/user.model";
import { AppError } from "utils/app-error";

export const userDetails = async (req: Request, res: Response) => {
  const userId = (req as CustomRequest).user.id;

  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError(Messages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
  }

  res.status(StatusCode.OK).json({ success: true, user });
};
