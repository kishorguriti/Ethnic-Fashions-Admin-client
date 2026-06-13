import axiosInstance from "./axiosInstance";

export interface AdminCustomer {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  isPhoneVerified: boolean;
  isSuspended: boolean;
  addressCount: number;
  createdAt: string;
}

export interface CustomerStats {
  totalCustomers: number;
  newThisMonth: number;
  verifiedCustomers: number;
  withSavedAddress: number;
}

export interface CustomerAddress {
  _id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface AdminCustomerDetail {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  isPhoneVerified: boolean;
  isSuspended: boolean;
  addresses: CustomerAddress[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCustomerPayload {
  name?: string;
  email?: string;
  phone?: string;
  isPhoneVerified?: boolean;
}

interface AdminCustomerListResponse {
  success: boolean;
  data: {
    customers: AdminCustomer[];
    total: number;
  };
}

interface CustomerStatsResponse {
  success: boolean;
  data: CustomerStats;
}

interface AdminCustomerDetailResponse {
  success: boolean;
  data: AdminCustomerDetail;
}

export const getAdminCustomers = (params?: {
  search?: string;
  page?: number;
  limit?: number;
}) =>
  axiosInstance.get<AdminCustomerListResponse>("/customer/admin/all", {
    params,
  });

export const getCustomerStats = () =>
  axiosInstance.get<CustomerStatsResponse>("/customer/admin/stats");

export const getAdminCustomerById = (id: string) =>
  axiosInstance.get<AdminCustomerDetailResponse>(`/customer/admin/${id}`);

export const updateAdminCustomer = (id: string, data: UpdateCustomerPayload) =>
  axiosInstance.patch<AdminCustomerDetailResponse & { message: string }>(
    `/customer/admin/${id}`,
    data,
  );

export const setCustomerSuspension = (id: string, isSuspended: boolean) =>
  axiosInstance.patch<AdminCustomerDetailResponse & { message: string }>(
    `/customer/admin/${id}/suspend`,
    { isSuspended },
  );
