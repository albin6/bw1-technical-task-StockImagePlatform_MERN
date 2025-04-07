import { Document } from "mongoose";

export interface IUser {
  email: string;
  phone: string;
  password: string;
}

export interface UserDocument extends Document {}
