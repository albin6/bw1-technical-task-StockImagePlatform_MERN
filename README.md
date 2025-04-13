# 📸 Snap Stack - Image Manager Application

A full-stack web application that allows users to register, log in, upload and manage images with titles, rearrange them via drag-and-drop, and perform edit/delete operations — all built with **TypeScript**.

---

## 🚀 Features and Functionalities

### 1. 🧑‍💻 User Authentication

- Register with Email ID, Phone number, and Password.
- Login with secure password handling.
- Password reset functionality.
- Authentication built with **Express.js + TypeScript** and **MongoDB**.

### 2. 🖼️ Image Upload with Title

- Supports **bulk upload** of images.
- Each image can have a specific title.
- Users can view, edit, and delete their uploaded images.
- Built using **Express.js + TypeScript**, storing metadata in **MongoDB** and files on disk/cloud.

### 3. 🔀 Rearranging Uploaded Images

- Select and rearrange uploaded images via **drag-and-drop**.
- Save and persist rearranged order.
- Implemented with **React + TypeScript** and a drag-and-drop library.

### 4. ✏️ Edit & ❌ Delete Uploaded Images

- Edit image file and title after upload.
- Delete any uploaded image with a single click.

---

## 🛠️ Tech Stack

### Frontend

- ⚛️ React.js + TypeScript
- TailwindCSS (optional)
- Drag-and-drop: `dnd-kit/core`

### Backend

- 🚀 Express.js + TypeScript
- MongoDB with Mongoose
- File upload via Multer

---
