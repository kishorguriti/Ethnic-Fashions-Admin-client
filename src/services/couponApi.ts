import axiosInstance from "./axiosInstance";

export type CouponType = "percentage" | "flat";

export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  maxDiscountCap?: number | null;
  minOrderValue: number;
  usageLimit?: number | null;
  usageLimitPerUser?: number | null;
  usedCount: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponPayload {
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  maxDiscountCap?: number | null;
  minOrderValue?: number;
  usageLimit?: number | null;
  usageLimitPerUser?: number | null;
  startsAt: string;
  endsAt: string;
  isActive?: boolean;
}

export type UpdateCouponPayload = Partial<Omit<CreateCouponPayload, "code">>;

interface CouponResponse {
  success: boolean;
  message: string;
  data: { coupon: Coupon };
}

interface CouponListResponse {
  success: boolean;
  data: {
    coupons: Coupon[];
    total: number;
    page: number;
    pages: number;
  };
}

export const getCoupons = (params?: { page?: number; limit?: number; status?: string }) =>
  axiosInstance.get<CouponListResponse>("/coupons", { params });

export const getCouponById = (id: string) =>
  axiosInstance.get<CouponResponse>(`/coupons/${id}`);

export const createCoupon = (data: CreateCouponPayload) =>
  axiosInstance.post<CouponResponse>("/coupons", data);

export const updateCoupon = (id: string, data: UpdateCouponPayload) =>
  axiosInstance.patch<CouponResponse>(`/coupons/${id}`, data);

export const toggleCouponStatus = (id: string) =>
  axiosInstance.patch<CouponResponse>(`/coupons/${id}/status`);

export const deleteCoupon = (id: string) =>
  axiosInstance.delete<{ success: boolean; message: string }>(`/coupons/${id}`);
