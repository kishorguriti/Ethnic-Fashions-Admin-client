import axiosInstance from "./axiosInstance";
import type { Asset } from "./assetApi";
import type { FilterableAttribute } from "./categoryApi";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface ProductCategory {
  _id: string;
  name: string;
  slug: string;
  filterableAttributes?: FilterableAttribute[];
}

export interface ProductUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  category: ProductCategory;
  brand?: string;
  tags: string[];
  attributes: Record<string, string | string[]>;
  returnPeriodDays?: number;
  maxQtyPerOrder?: number;
  approvalStatus: ApprovalStatus;
  isActive: boolean;
  rejectionReason?: string | null;
  pendingChanges?: Record<string, any> | null;
  createdBy?: ProductUser;
  approvedBy?: ProductUser | null;
  thumbnail?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductWithVariants extends Product {
  variants: ProductVariant[];
}

export interface ProductVariant {
  _id: string;
  product: string;
  color: string;
  size?: string | null;
  sku: string;
  mrp: number;
  sellingPrice: number;
  discount: number;
  stock: number;
  reserved: number;
  available: number;
  media: Asset[];
  isActive: boolean;
}

export interface InventoryVariant {
  _id: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    category: { _id: string; name: string };
  };
  color: string;
  size?: string | null;
  sku: string;
  mrp: number;
  sellingPrice: number;
  discount: number;
  stock: number;
  reserved: number;
  available: number;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  category: string;
  brand?: string;
  tags?: string[];
  attributes?: Record<string, string | string[]>;
  returnPeriodDays?: number;
  maxQtyPerOrder?: number;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  brand?: string;
  tags?: string[];
  attributes?: Record<string, string | string[]>;
  returnPeriodDays?: number;
  maxQtyPerOrder?: number;
}

export interface CreateVariantPayload {
  color: string;
  size?: string;
  mrp: number;
  sellingPrice: number;
  stock?: number;
  media?: string[];
}

export interface UpdateVariantPayload {
  color?: string;
  size?: string;
  mrp?: number;
  sellingPrice?: number;
  media?: string[];
}

interface ProductResponse {
  success: boolean;
  message: string;
  data: { product: Product };
}

interface ProductWithVariantsResponse {
  success: boolean;
  data: { product: ProductWithVariants };
}

interface ProductListResponse {
  success: boolean;
  data: { products: Product[]; total: number; page: number; pages: number };
}

interface VariantResponse {
  success: boolean;
  message: string;
  data: { variant: ProductVariant };
}

interface InventoryListResponse {
  success: boolean;
  data: {
    variants: InventoryVariant[];
    total: number;
    page: number;
    pages: number;
  };
}

export const getAdminProducts = (params?: {
  page?: number;
  limit?: number;
  status?: ApprovalStatus;
  category?: string;
}) =>
  axiosInstance.get<ProductListResponse>("/products/admin/all", { params });

export const getPendingProducts = (params?: { page?: number; limit?: number }) =>
  axiosInstance.get<ProductListResponse>("/products/admin/pending", { params });

export const getAdminProductById = (id: string) =>
  axiosInstance.get<ProductWithVariantsResponse>(`/products/admin/${id}`);

export const getAdminProductBySlug = (slug: string) =>
  axiosInstance.get<ProductWithVariantsResponse>(`/products/admin/by-slug/${slug}`);

export const createProduct = (data: CreateProductPayload) =>
  axiosInstance.post<ProductResponse>("/products", data);

export const updateProduct = (id: string, data: UpdateProductPayload) =>
  axiosInstance.patch<ProductResponse>(`/products/${id}`, data);

export const deleteProduct = (id: string) =>
  axiosInstance.delete<{ success: boolean; message: string }>(
    `/products/${id}`,
  );

export const toggleProductStatus = (id: string) =>
  axiosInstance.patch<ProductResponse>(`/products/${id}/status`);

export const approveProduct = (id: string) =>
  axiosInstance.patch<ProductResponse>(`/products/${id}/approve`);

export const rejectProduct = (id: string, rejectionReason: string) =>
  axiosInstance.patch<ProductResponse>(`/products/${id}/reject`, {
    rejectionReason,
  });

export const addVariant = (productId: string, data: CreateVariantPayload) =>
  axiosInstance.post<VariantResponse>(`/products/${productId}/variants`, data);

export const updateVariant = (
  productId: string,
  variantId: string,
  data: UpdateVariantPayload,
) =>
  axiosInstance.patch<VariantResponse>(
    `/products/${productId}/variants/${variantId}`,
    data,
  );

export const updateVariantStock = (
  productId: string,
  variantId: string,
  stock: number,
) =>
  axiosInstance.patch<VariantResponse>(
    `/products/${productId}/variants/${variantId}/stock`,
    { stock },
  );

export const deleteVariant = (productId: string, variantId: string) =>
  axiosInstance.delete<{ success: boolean; message: string }>(
    `/products/${productId}/variants/${variantId}`,
  );

export const getAdminVariants = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "in" | "low" | "out";
}) =>
  axiosInstance.get<InventoryListResponse>("/products/admin/variants", {
    params,
  });
