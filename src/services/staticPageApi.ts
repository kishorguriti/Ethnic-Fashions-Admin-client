import axiosInstance from "./axiosInstance";

export type PageStatus = "draft" | "published";

export interface StaticPage {
  _id: string;
  title: string;
  slug: string;
  content: string;
  status: PageStatus;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaticPagePayload {
  title?: string;
  content?: string;
  status?: PageStatus;
  metaTitle?: string;
  metaDescription?: string;
}

interface AdminPageListResponse {
  success: boolean;
  data: { pages: StaticPage[] };
}

interface PageResponse {
  success: boolean;
  message?: string;
  data: { page: StaticPage };
}

export const getAdminStaticPages = () =>
  axiosInstance.get<AdminPageListResponse>("/pages/admin/all");

export const getStaticPageById = (id: string) =>
  axiosInstance.get<PageResponse>(`/pages/admin/${id}`);

export const updateStaticPage = (id: string, data: StaticPagePayload) =>
  axiosInstance.patch<PageResponse>(`/pages/admin/${id}`, data);
