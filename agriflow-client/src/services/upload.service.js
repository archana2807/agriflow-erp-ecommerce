import { API_BASE } from "@/constants/api";

export const uploadService = {
  uploadImage: async (formData) => {
    const res = await fetch(`${API_BASE}/upload/image`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || `Upload failed (${res.status})`);
    }
    return { url: data.url, filename: data.filename };
  },
};
