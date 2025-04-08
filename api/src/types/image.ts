import { Document } from "mongoose";

export interface IImage {
  title: string;
  imageURL: string;
  userId: string;
  order: number;
  createdAt: Date;
}

export interface ImageDocument extends Document, IImage {}
