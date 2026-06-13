import axiosInstance from "./axiosInstance";

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
}

export interface PartnerProfile {
  businessName: string;
  businessAddress: string;
  gstNumber: string;
  alternatePhone?: string;
  bankDetails: BankDetails;
}

export interface Partner {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "partner";
  isActive: boolean;
  partnerProfile: PartnerProfile;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartnerPayload {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessAddress: string;
  gstNumber: string;
  alternatePhone?: string;
  bankDetails: BankDetails;
}

export type UpdatePartnerPayload = Partial<CreatePartnerPayload>;

interface PartnerListResponse {
  success: boolean;
  data: {
    partners: Partner[];
    total: number;
    page: number;
    pages: number;
  };
}

interface PartnerResponse {
  success: boolean;
  message: string;
  data: { partner: Partner };
}

interface CreatePartnerResponse {
  success: boolean;
  message: string;
  data: Partner;
}

export const getPartners = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}) => axiosInstance.get<PartnerListResponse>("/admin/partners", { params });

export const getPartnerById = (id: string) =>
  axiosInstance.get<PartnerResponse>(`/admin/partners/${id}`);

export const createPartner = (data: CreatePartnerPayload) =>
  axiosInstance.post<CreatePartnerResponse>("/admin/partners", data);

export const updatePartner = (id: string, data: UpdatePartnerPayload) =>
  axiosInstance.patch<PartnerResponse>(`/admin/partners/${id}`, data);

export const togglePartnerStatus = (id: string) =>
  axiosInstance.patch<PartnerResponse>(`/admin/partners/${id}/status`);
