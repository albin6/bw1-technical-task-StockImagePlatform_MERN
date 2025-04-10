import fs from "fs";
import { Request, Response } from "express";

import { ImageDocument } from "../types/index";
import { Messages } from "../constants/messages";
import { StatusCode } from "../constants/status-codes";
import { CustomRequest } from "../middlewares/auth.middleware";
import { ImageModel } from "../models/image.model";
import { AppError } from "../utils/app-error";

export const uploadImages = async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const { titles } = req.body;

  const userId = (req as CustomRequest).user.id;

  console.log("user id", userId);

  if (!files || !titles || !userId) {
    throw new AppError(Messages.REQUIRED_DATA, StatusCode.BAD_REQUEST);
  }

  // const titleArray: string[] = Array.isArray(titles) ? titles : [titles];
  const titleArray: string[] = titles;

  const imagesToInsert: Partial<ImageDocument>[] = files.map((file, index) => ({
    title: titleArray[index],
    imageURL: `/uploads/${file.filename}`, // or use cloud URL
    userId,
    order: index,
  }));

  const savedImages = await ImageModel.insertMany(imagesToInsert);

  console.log("saved images => ", savedImages);

  res
    .status(StatusCode.CREATED)
    .json({ success: true, message: Messages.IMAGE_UPLOAD_SUCCESS });
};

export const getImages = async (req: Request, res: Response) => {
  const userId = (req as CustomRequest).user.id;

  console.log("user id", userId);

  if (!userId) {
    throw new AppError(Messages.USER_ID_NOT_PROVIDED, StatusCode.BAD_REQUEST);
  }

  const images = await ImageModel.find({ userId });

  res.status(StatusCode.CREATED).json({ success: true, images });
};

export const updateImage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title } = req.body;
  const update: Partial<ImageDocument> = {};

  if (title) update.title = title;
  if (req.file) {
    update.imageURL = `/uploads/${req.file.filename}`;
  }

  const updatedImage = await ImageModel.findByIdAndUpdate(id, update, {
    new: true,
  });
  if (!updatedImage) {
    throw new AppError(Messages.IMAGE_NOT_FOUND, StatusCode.NOT_FOUND);
  }

  res.json({
    success: true,
    message: Messages.IMAGE_UPLOAD_SUCCESS,
    updatedImage,
  });
};

export const deleteImage = async (req: Request, res: Response) => {
  const { id } = req.params;

  const image = await ImageModel.findById(id);
  if (!image) {
    throw new AppError(Messages.IMAGE_NOT_FOUND, StatusCode.NOT_FOUND);
  }

  // Optionally delete file from disk
  const filePath = `./public${image.imageURL}`;
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await ImageModel.findByIdAndDelete(id);
  res.json({ success: true, message: Messages.IMAGE_DELETED });
};

export const rearrangeImages = async (req: Request, res: Response) => {
  const { imageOrder } = req.body as { imageOrder: string[] };

  if (!Array.isArray(imageOrder)) {
    throw new AppError(Messages.IMAGE_ORDER_WRONG, StatusCode.BAD_REQUEST);
  }

  await Promise.all(
    imageOrder.map((imageId, index) =>
      ImageModel.findByIdAndUpdate(imageId, { order: index })
    )
  );

  res.json({ success: true, message: Messages.IMAGE_ORDER_UPDATED });
};
