import { create } from "zustand";
import API from "../api/axios";

const useUploadStore = create((set) => ({
  uploading: false,
  uploadedImg: null,
  error: null,

  //---------------uploader-------------------
  uploadedImg: async (file) => {
    set({ uploading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("image", file);

      const { data } = await API.post("/upload/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      set({
        uploadedImage: data.data,
        uploading: false,
      });
      return data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Upload failed",
        uploading: false,
      });
      throw error;
    }
  },

  //--------------deleter----------------------
  deleteImage: async (cloudinaryId) => {
    try {
      await API.delete("/upload/delete", {
        data: { cloudinaryId },
      });
      set({ uploadedImage: null });
    } catch (error) {
      set({ error: error.response?.data?.message || "Delete failed" });
      throw error;
    }
  },
  //
  clearImage: () => set({ uploadedImage: null, error: null }),
}));

export default useUploadStore;
