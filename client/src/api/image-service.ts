import { axiosInstance } from "./axios.instance";

export interface ImageData {
  _id: string;
  title: string; // Looks like it might be a JSON string of an array
  imageURL: string;
  userId: string;
  order: number;
  createdAt: string;
  __v: number; // Mongoose version key
}

export const imageService = {
  // Get all images for the current user
  getImages: async (): Promise<ImageData[]> => {
    const response = await axiosInstance.get("/img");
    return response.data.images;
  },

  // Upload multiple images with titles
  uploadImages: async (
    files: File[],
    titles: Record<string, string>
  ): Promise<ImageData[]> => {
    const formData = new FormData();

    console.log(files);

    const titlesArray = Array.from({ length: files.length }, (_, index) => {
      return titles[index.toString()] || `Untitled Image ${index + 1}`;
    });

    console.log("Titles array:", titlesArray);

    // Add each file to the form data with a specific key for each file
    files.forEach((file, index) => {
      formData.append(`images`, file); // This should match your backend field name
    });

    // Add titles as JSON
    formData.append("titles", JSON.stringify(titlesArray));

    const response = await axiosInstance.post("/img/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  updateImageWithFile: async (
    id: string,
    formData: FormData
  ): Promise<ImageData> => {
    const response = await axiosInstance.put(`/img/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.image;
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
    await axiosInstance.put("/img/rearrange", { imageOrder: images });
  },
};
