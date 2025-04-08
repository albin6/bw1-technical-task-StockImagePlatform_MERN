import { UserDocument } from "../types/index";
import { model, Schema } from "mongoose";

export const userSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
  },
});

export const UserModel = model<UserDocument>("User", userSchema);
