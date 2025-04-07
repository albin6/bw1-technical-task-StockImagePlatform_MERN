import { Messages } from "constants/messages";
import { StatusCode } from "constants/status-codes";
import { Request, Response } from "express";
import { AppError } from "utils/app-error";

export const login = async (req: Request, res: Response) => {
  throw new AppError(Messages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
};
