import axiosInstance from "./axiosInstance";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type PaymentStatus =
  | "created"
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

export interface OrderItem {
  name: string;
  sku: string;
  color?: string;
  size?: string;
  image?: string;
  unitPrice: number;
  mrp: number;
  quantity: number;
  lineTotal: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface OrderRefund {
  razorpayRefundId?: string;
  amount: number;
  status: string;
  reason?: string;
  createdAt: string;
}

export interface OrderPayment {
  method: "razorpay" | "cod";
  status: PaymentStatus;
  channel?: string;
  razorpayPaymentId?: string;
  amountPaid: number;
  amountRefunded: number;
  refunds: OrderRefund[];
}

export interface OrderTimelineEntry {
  status: OrderStatus;
  note?: string;
  at: string;
}

export interface AdminOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  tax: number;
  total: number;
  currency: string;
  deliveryMethod?: string;
  estimatedDelivery?: string;
  status: OrderStatus;
  payment: OrderPayment;
  timeline: OrderTimelineEntry[];
  createdAt: string;
}

export interface OrderStats {
  totalOrders: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  returned: number;
  totalRevenue: number;
}

interface AdminOrderListResponse {
  success: boolean;
  data: {
    orders: AdminOrder[];
    total: number;
    page: number;
    pages: number;
  };
}

interface OrderStatsResponse {
  success: boolean;
  data: OrderStats;
}

interface AdminOrderDetailResponse {
  success: boolean;
  data: { order: AdminOrder };
}

export const getAdminOrders = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  search?: string;
}) =>
  axiosInstance.get<AdminOrderListResponse>("/orders/admin", { params });

export const getAdminOrderStats = () =>
  axiosInstance.get<OrderStatsResponse>("/orders/admin/stats");

export const getAdminOrder = (id: string) =>
  axiosInstance.get<AdminOrderDetailResponse>(`/orders/admin/${id}`);

export const updateOrderStatus = (
  id: string,
  body: { status: OrderStatus; note?: string },
) =>
  axiosInstance.patch<AdminOrderDetailResponse>(
    `/orders/admin/${id}/status`,
    body,
  );

export const refundOrder = (
  id: string,
  body: { amount?: number; reason?: string; notes?: string },
) =>
  axiosInstance.post<AdminOrderDetailResponse>(
    `/orders/admin/${id}/refund`,
    body,
  );
