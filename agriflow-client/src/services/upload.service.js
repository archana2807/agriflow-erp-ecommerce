import { API_BASE } from "@/constants/api";

export const uploadService = {
  uploadImage: async (formData) => {
    const res = await fetch(`${API_BASE}/upload/image`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    if (!res.ok) {
      const err = new Error("Upload failed");
      err.status = res.status;
      throw err;
    }
    return res.json();
  },
};
