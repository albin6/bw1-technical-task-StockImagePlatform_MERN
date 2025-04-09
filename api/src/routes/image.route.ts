import asyncHandler from "express-async-handler";
import {
  deleteImage,
  rearrangeImages,
  updateImage,
  uploadImages,
} from "controllers/image.controller";
import { Router } from "express";
import { upload } from "utils/multer";
import { verifyAuth } from "middlewares/auth.middleware";

const router = Router();

router.post(
  "/upload",
  verifyAuth,
  upload.array("images"),
  asyncHandler(uploadImages)
);
router.put(
  "/edit/:id",
  verifyAuth,
  upload.single("image"),
  asyncHandler(updateImage)
);
router.delete("/:id", verifyAuth, asyncHandler(deleteImage));
router.put("/rearrange", verifyAuth, asyncHandler(rearrangeImages));

export default router;
