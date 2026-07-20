import axiosInstance from "./axiosInstance";

export interface RevenueChartPoint {
  label: string;
  value: number;
}

export interface OrdersChartPoint {
  label: string;
  count: number;
}

export interface RevenueSummary {
  totalRevenue: number;
  thisMonthRevenue: number;
  thisMonthOrders: number;
  pendingPayments: number;
  pendingPaymentsOrders: number;
  refundsMonth: number;
  refundsCount: number;
  monthlyRevenue: RevenueChartPoint[];
  monthlyOrders: OrdersChartPoint[];
}

export interface TransactionRecord {
  _id: string;
  txId: string;
  orderId: string;
  customer: string;
  date: string;
  method: string;
  status: "Success" | "Pending";
  amount: number;
}

export interface RefundRecord {
  refundId: string;
  orderId: string;
  customer: string;
  date: string;
  status: "Processed" | "Processing";
  amount: number;
  reason?: string;
}

interface RevenueSummaryResponse {
  success: boolean;
  data: RevenueSummary;
}

interface TransactionsResponse {
  success: boolean;
  data: {
    transactions: TransactionRecord[];
    total: number;
    page: number;
    pages: number;
  };
}

interface RefundsResponse {
  success: boolean;
  data: {
    refunds: RefundRecord[];
    total: number;
    page: number;
    pages: number;
  };
}

export const getRevenueSummary = () =>
  axiosInstance.get<RevenueSummaryResponse>("/orders/admin/revenue/summary");

export const getTransactions = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  method?: string;
  status?: string;
  from?: string;
  to?: string;
}) =>
  axiosInstance.get<TransactionsResponse>(
    "/orders/admin/revenue/transactions",
    { params },
  );

export const getRefunds = (params?: { page?: number; limit?: number }) =>
  axiosInstance.get<RefundsResponse>("/orders/admin/revenue/refunds", {
    params,
  });
