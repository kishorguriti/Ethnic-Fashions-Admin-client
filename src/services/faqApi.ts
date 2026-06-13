import axiosInstance from "./axiosInstance";

export type FaqCategory = "General" | "Orders" | "Shipping" | "Returns" | "Payments";
export type FaqStatus = "draft" | "published";

export interface Faq {
  _id: string;
  question: string;
  answer: string;
  category: FaqCategory;
  status: FaqStatus;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FaqPayload {
  question?: string;
  answer?: string;
  category?: FaqCategory;
  status?: FaqStatus;
  displayOrder?: number;
}

interface AdminFaqListResponse {
  success: boolean;
  data: { faqs: Faq[] };
}

interface FaqResponse {
  success: boolean;
  message?: string;
  data: { faq: Faq };
}

export const getAdminFaqs = () =>
  axiosInstance.get<AdminFaqListResponse>("/faqs/admin/all");

export const createFaq = (data: FaqPayload) =>
  axiosInstance.post<FaqResponse>("/faqs", data);

export const updateFaq = (id: string, data: FaqPayload) =>
  axiosInstance.patch<FaqResponse>(`/faqs/${id}`, data);

export const deleteFaq = (id: string) =>
  axiosInstance.delete<{ success: boolean; message?: string }>(`/faqs/${id}`);
