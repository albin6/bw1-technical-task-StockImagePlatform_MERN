import { axiosInstance } from "./axios.instance";

export interface ImageData {
  _id: string;
  title: string;
  url: string;
  order: number;
}

export const imageService = {
  // Get all images for the current user
  getImages: async (): Promise<ImageData[]> => {
    const response = await axiosInstance.get("/images");
    return response.data;
  },

  // Upload multiple images with titles
  uploadImages: async (
    files: File[],
    titles: Record<string, string>
  ): Promise<ImageData[]> => {
    const formData = new FormData();

    // Add each file to the form data
    files.forEach((file, index) => {
      formData.append("images", file);
    });

    // Add titles as JSON
    formData.append("titles", JSON.stringify(titles));

    const response = await axiosInstance.post("/img/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // Update image title
  updateImage: async (id: string, title: string): Promise<ImageData> => {
    const response = await axiosInstance.put(`/img/${id}`, { title });
    return response.data;
  },

  // Delete an image
  deleteImage: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/img/${id}`);
  },

  // Update image order
  updateImageOrder: async (
    images: { _id: string; order: number }[]
  ): Promise<void> => {
    await axiosInstance.put("/img/rearrange", { images });
  },
};
