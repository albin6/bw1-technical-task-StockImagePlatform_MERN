import { Request, Response } from "express";
import bcrypt from "bcrypt";

import { Messages } from "constants/messages";
import { StatusCode } from "constants/status-codes";
import { UserModel } from "models/user.model";
import { AppError } from "utils/app-error";
import {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "utils/jwt";
import { CustomJwtPayload } from "../types/auth";
import { setCookies } from "utils/set-cookie";
import { CustomRequest } from "middlewares/auth.middleware";

// user registration
export const register = async (req: Request, res: Response) => {
  const { email, phone, password } = req.body;

  const isEmailExists = await UserModel.findOne({ email });

  if (isEmailExists) {
    throw new AppError(Messages.EMAIL_EXISTS, StatusCode.CONFLICT);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await UserModel.create({
    email,
    phone,
    password: hashedPassword,
  });

  const payload: CustomJwtPayload = {
    id: user._id as string,
    email: user.email,
  };

  const accessToken = createAccessToken(payload);
  const refreshToken = createRefreshToken(payload);

  setCookies(res, accessToken, refreshToken);

  user.refreshToken = refreshToken;

  await user.save();

  res.status(StatusCode.CREATED).json({
    success: true,
    message: Messages.USER_CREATED,
    user: {
      id: user._id,
      email: user.email,
    },
  });
};

// user login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const isEmailExists = await UserModel.findOne({ email });

  if (!isEmailExists) {
    throw new AppError(Messages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
  }

  const isPasswordMatch = await bcrypt.compare(
    password,
    isEmailExists.password
  );

  if (!isPasswordMatch) {
    throw new AppError(Messages.INVALID_CREDENTIALS, StatusCode.BAD_REQUEST);
  }

  const payload: CustomJwtPayload = {
    id: isEmailExists._id as string,
    email: isEmailExists.email,
  };

  const accessToken = createAccessToken(payload);
  const refreshToken = createRefreshToken(payload);

  setCookies(res, accessToken, refreshToken);

  isEmailExists.refreshToken = refreshToken;

  await isEmailExists.save();

  res.status(StatusCode.OK).json({
    success: true,
    user: {
      id: isEmailExists._id,
      email: isEmailExists.email,
    },
  });
};

// refresh token
export const refreshToken = async (req: Request, res: Response) => {
  const accessToken = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    throw new AppError(Messages.TOKEN_MISSING, StatusCode.UNAUTHORIZED);
  }

  let shouldRefresh = false;

  try {
    verifyAccessToken(accessToken);
    res.status(StatusCode.OK).json({
      success: true,
      message: Messages.TOKEN_VALID,
    });
    return;
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      shouldRefresh = true;
    } else {
      throw new AppError(Messages.TOKEN_INVALID, StatusCode.UNAUTHORIZED);
    }
  }

  if (shouldRefresh) {
    try {
      const decoded: any = verifyRefreshToken(refreshToken);
      const user = await UserModel.findById(decoded.id);

      if (!user || user.refreshToken !== refreshToken) {
        throw new AppError(
          Messages.TOKEN_INVALID_REUSED,
          StatusCode.UNAUTHORIZED
        );
      }

      // Step 3: Issue new tokens
      const payload: CustomJwtPayload = {
        id: user._id as string,
        email: user.email,
      };

      const newAccessToken = createAccessToken(payload);

      const newRefreshToken = createRefreshToken(payload);

      user.refreshToken = newRefreshToken;

      await user.save();

      // Set new cookies
      setCookies(res, newAccessToken, newRefreshToken);

      res.status(StatusCode.OK).json({
        success: true,
      });
    } catch (err) {
      throw new AppError(
        Messages.REFRESH_TOKEN_INVALID,
        StatusCode.UNAUTHORIZED
      );
    }
  }
};

// current password check
export const verifyCurrentPassword = async (req: Request, res: Response) => {
  const { password } = req.body;

  const userId = (req as CustomRequest).user.id;

  if (!userId) {
    throw new AppError(Messages.USER_ID_NOT_PROVIDED, StatusCode.BAD_REQUEST);
  }

  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError(Messages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new AppError(Messages.WRONG_PASSWORD, StatusCode.BAD_REQUEST);
  }

  res.status(StatusCode.OK).json({
    success: true,
  });
};

// set new password
export const resetPassword = async (req: Request, res: Response) => {
  const { newPassword } = req.body;

  const userId = (req as CustomRequest).user.id;

  if (!userId) {
    throw new AppError(Messages.USER_ID_NOT_PROVIDED, StatusCode.BAD_REQUEST);
  }

  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError(Messages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
  }

  const isPasswordMatch = await bcrypt.compare(newPassword, user.password);

  if (!isPasswordMatch) {
    throw new AppError(Messages.SET_DIFF_PASSWORD, StatusCode.BAD_REQUEST);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;

  await user.save();

  res.status(StatusCode.OK).json({
    success: true,
    message: Messages.PASSWORD_UPDATE_SUCCESS,
  });
};
