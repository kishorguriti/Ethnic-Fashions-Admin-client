import axiosInstance from "./axiosInstance";

export interface Asset {
  _id: string;
  url: string;
  publicId: string;
  folder: string;
  resourceType: "image" | "video" | "raw";
  format?: string;
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
}

interface AssetResponse {
  success: boolean;
  message: string;
  data: { asset: Asset };
}

export const uploadImageAsset = (file: File, folder = "banners") => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("folder", folder);
  return axiosInstance.post<AssetResponse>("/assets/upload", formData);
};

export const uploadVideoAsset = (file: File, folder = "banners") => {
  const formData = new FormData();
  formData.append("video", file);
  formData.append("folder", folder);
  return axiosInstance.post<AssetResponse>("/assets/upload/video", formData);
};

export const deleteAsset = (id: string) =>
  axiosInstance.delete<{ success: boolean; message: string }>(
    `/assets/${id}`,
  );
