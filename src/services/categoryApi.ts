import axiosInstance from "./axiosInstance";

export interface CategoryImage {
  url: string;
  publicId: string;
}

export interface FilterableAttribute {
  key: string;
  label: string;
  type: "select" | "color" | "range";
  options: string[];
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  parent: string | null;
  image: CategoryImage | null;
  displayOrder: number;
  isActive: boolean;
  isDeleted: boolean;
  subcategories: Category[];
  filterableAttributes?: FilterableAttribute[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  parent?: string;
  displayOrder?: number;
}

export interface UpdateCategoryPayload {
  name?: string;
  displayOrder?: number;
}

interface CategoryResponse {
  success: boolean;
  message: string;
  data: { category: Category };
}

export const getAdminCategories = () =>
  axiosInstance.get<{ success: boolean; data: { categories: Category[] } }>(
    "/categories/admin/all",
  );

export const createCategory = (data: CreateCategoryPayload) =>
  axiosInstance.post<CategoryResponse>("/categories", data);

export const updateCategory = (id: string, data: UpdateCategoryPayload) =>
  axiosInstance.patch<CategoryResponse>(`/categories/${id}`, data);

export const toggleCategoryStatus = (id: string) =>
  axiosInstance.patch<CategoryResponse>(`/categories/${id}/status`);

export const reorderCategory = (id: string, displayOrder: number) =>
  axiosInstance.patch<CategoryResponse>(`/categories/${id}/reorder`, {
    displayOrder,
  });

export const deleteCategory = (id: string) =>
  axiosInstance.delete<{ success: boolean; message: string }>(
    `/categories/${id}`,
  );
