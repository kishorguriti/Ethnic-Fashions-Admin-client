import axiosInstance from "./axiosInstance";

export type ReturnStatus =
  | "pending"
  | "approved"
  | "received"
  | "rejected"
  | "processing"
  | "refunded";

export interface ReturnItem {
  name: string;
  sku?: string;
  color?: string;
  size?: string;
  image?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface ReturnRefundInfo {
  method?: "razorpay" | "manual" | "";
  razorpayRefundId?: string;
  amount?: number;
  status?: "pending" | "processed";
  at?: string | null;
}

export interface AdminReturn {
  _id: string;
  returnNumber: string;
  orderNumber: string;
  customerName: string;
  items: ReturnItem[];
  reason: string;
  reasonText?: string;
  /** Photos the customer attached as evidence (Cloudinary URLs). */
  customerImages?: string[];
  type: "return" | "exchange";
  amount: number;
  status: ReturnStatus;
  refund?: ReturnRefundInfo;
  adminNote?: string;
  timeline?: { status: string; note?: string; at: string }[];
  createdAt: string;
}

export interface ReturnStats {
  pendingReturns: number;
  approved: number;
  processing: number;
  rejected: number;
  refundedThisMonth: number;
  totalRefundAmount: number;
}

interface ReturnListResponse {
  success: boolean;
  data: { returns: AdminReturn[]; total: number; page: number; pages: number };
}

interface ReturnStatsResponse {
  success: boolean;
  data: ReturnStats;
}

interface ReturnDetailResponse {
  success: boolean;
  data: { return: AdminReturn };
}

export const getAdminReturns = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) => axiosInstance.get<ReturnListResponse>("/returns/admin", { params });

export const getReturnStats = () =>
  axiosInstance.get<ReturnStatsResponse>("/returns/admin/stats");

export const getAdminReturn = (id: string) =>
  axiosInstance.get<ReturnDetailResponse>(`/returns/admin/${id}`);

export const approveReturn = (id: string, note?: string) =>
  axiosInstance.patch<ReturnDetailResponse>(`/returns/admin/${id}/approve`, { note });

export const rejectReturn = (id: string, note?: string) =>
  axiosInstance.patch<ReturnDetailResponse>(`/returns/admin/${id}/reject`, { note });

export const markReceived = (id: string, note?: string) =>
  axiosInstance.patch<ReturnDetailResponse>(`/returns/admin/${id}/received`, { note });

export const refundReturn = (
  id: string,
  body: { amount?: number; note?: string },
) => axiosInstance.post<ReturnDetailResponse>(`/returns/admin/${id}/refund`, body);
