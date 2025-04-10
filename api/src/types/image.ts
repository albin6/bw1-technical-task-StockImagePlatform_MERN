import { Document, ObjectId } from "mongoose";

export interface IImage {
  title: string;
  imageURL: string;
  userId: ObjectId;
  order: number;
  createdAt: Date;
}

export interface ImageDocument extends Document, IImage {}
