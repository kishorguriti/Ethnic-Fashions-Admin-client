import axiosInstance from "./axiosInstance";

export type BannerPlacement = "hero" | "promotional" | "sub_banner";
export type BannerMediaType = "image" | "video";

export interface BannerMedia {
  _id: string;
  url: string;
  width?: number;
  height?: number;
  format?: string;
}

export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  placement: BannerPlacement;
  mediaType: BannerMediaType;
  desktopImage?: BannerMedia | null;
  mobileImage?: BannerMedia | null;
  desktopVideo?: BannerMedia | null;
  mobileVideo?: BannerMedia | null;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  textColor?: string;
  overlayOpacity?: number;
  campaign?: string;
  startsAt?: string | null;
  endsAt?: string | null;
  displayOrder: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BannerPayload {
  title: string;
  subtitle?: string;
  badge?: string;
  placement: BannerPlacement;
  mediaType?: BannerMediaType;
  desktopImage?: string | null;
  mobileImage?: string | null;
  desktopVideo?: string | null;
  mobileVideo?: string | null;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  textColor?: string;
  overlayOpacity?: number;
  campaign?: string;
  startsAt?: string | null;
  endsAt?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

interface BannerResponse {
  success: boolean;
  message: string;
  data: { banner: Banner };
}

interface AdminBannerListResponse {
  success: boolean;
  data: {
    banners: Banner[];
    total: number;
    page: number;
    pages: number;
  };
}

export const getAdminBanners = (params?: {
  page?: number;
  limit?: number;
  placement?: string;
  campaign?: string;
  status?: string;
}) =>
  axiosInstance.get<AdminBannerListResponse>("/banners/admin/all", {
    params,
  });

export const getBannerById = (id: string) =>
  axiosInstance.get<BannerResponse>(`/banners/admin/${id}`);

export const createBanner = (data: BannerPayload) =>
  axiosInstance.post<BannerResponse>("/banners", data);

export const updateBanner = (id: string, data: Partial<BannerPayload>) =>
  axiosInstance.patch<BannerResponse>(`/banners/${id}`, data);

export const reorderBanner = (id: string, displayOrder: number) =>
  axiosInstance.patch<BannerResponse>(`/banners/${id}/reorder`, {
    displayOrder,
  });

export const toggleBannerStatus = (id: string) =>
  axiosInstance.patch<BannerResponse>(`/banners/${id}/status`);

export const deleteBanner = (id: string) =>
  axiosInstance.delete<{ success: boolean; message: string }>(
    `/banners/${id}`,
  );
