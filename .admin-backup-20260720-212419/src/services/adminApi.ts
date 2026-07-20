import axiosInstance from "./axiosInstance";

export interface DashboardOverview {
  totalCustomers: number;
  totalProducts: number;
  totalCategories: number;
  lowStockCount: number;
  totalWishlisted: number;
}

export interface ActivityLogEntry {
  _id: string;
  adminName: string;
  action: string;
  targetType: string;
  targetName: string;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline?: string;
  contactEmail?: string;
  contactPhone?: string;
  storeAddress?: string;
  logoUrl?: string;
}

export const getDashboardOverview = () =>
  axiosInstance.get<{ success: boolean; data: DashboardOverview }>(
    "/admin/dashboard-overview",
  );

export const getRecentActivity = (limit = 10) =>
  axiosInstance.get<{ success: boolean; data: ActivityLogEntry[] }>(
    "/admin/activity-log",
    { params: { limit } },
  );

export const getStoreSettings = () =>
  axiosInstance.get<{ success: boolean; data: StoreSettings }>(
    "/admin/settings",
  );

export const updateStoreSettings = (data: Partial<StoreSettings>) =>
  axiosInstance.patch<{ success: boolean; message: string; data: StoreSettings }>(
    "/admin/settings",
    data,
  );
