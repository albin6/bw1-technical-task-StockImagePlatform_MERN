import { ImageDocument } from "../types/index";
import { model, Schema } from "mongoose";

export const imageSchema = new Schema<ImageDocument>({
  title: { type: String, required: true },
  imageURL: { type: String, required: true },
  userId: { type: String, required: true },
  order: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const ImageModel = model<ImageDocument>("Image", imageSchema);
