import axiosInstance from "./axiosInstance";

export interface DashboardSummary {
  totalWishlisted: number;
  totalCarted: number;
  topWishlisted: { name: string; slug: string; count: number } | null;
  topCarted: { name: string; slug: string; count: number } | null;
}

export interface WishlistInsight {
  productId: string;
  name: string;
  slug: string;
  brand?: string;
  category: { name: string; slug: string } | null;
  wishlistCount: number;
  uniqueCustomers: number;
  cartCount: number;
  opportunity: number;
}

export interface CartInsight {
  productId: string;
  name: string;
  slug: string;
  brand?: string;
  category: { name: string; slug: string } | null;
  cartCount: number;
  totalQuantity: number;
  uniqueCustomers: number;
  wishlistCount: number;
}

export interface GrowthPoint {
  label: string;
  count: number;
}

export interface WishlistCategoryShare {
  name: string;
  count: number;
  percentage: number;
}

export const getAnalyticsSummary = () =>
  axiosInstance.get<{ success: boolean; data: DashboardSummary }>(
    "/analytics/summary",
  );

export const getWishlistInsights = (limit = 20) =>
  axiosInstance.get<{ success: boolean; data: WishlistInsight[] }>(
    "/analytics/wishlist-insights",
    { params: { limit } },
  );

export const getCartInsights = (limit = 20) =>
  axiosInstance.get<{ success: boolean; data: CartInsight[] }>(
    "/analytics/cart-insights",
    { params: { limit } },
  );

export const getCustomerGrowth = () =>
  axiosInstance.get<{ success: boolean; data: GrowthPoint[] }>(
    "/analytics/customer-growth",
  );

export const getNewCustomersDaily = () =>
  axiosInstance.get<{ success: boolean; data: GrowthPoint[] }>(
    "/analytics/new-customers-daily",
  );

export const getWishlistByCategory = (limit = 5) =>
  axiosInstance.get<{ success: boolean; data: WishlistCategoryShare[] }>(
    "/analytics/wishlist-by-category",
    { params: { limit } },
  );
