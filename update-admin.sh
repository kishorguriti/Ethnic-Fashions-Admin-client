#!/usr/bin/env bash
# Razorpay/Returns UPDATE installer — ADMIN update
# Run FROM THE PROJECT ROOT:  bash update-admin.sh
# Idempotent; does not touch .env or node_modules.
set -euo pipefail
echo "Applying changes in: $(pwd)"; echo
mkdir -p 'src/services'
cat > 'src/services/returnApi.ts' <<'__RZP_EOF_7f3a__'
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
__RZP_EOF_7f3a__
echo "  ✓ src/services/returnApi.ts"
d=src/services
mkdir -p 'src/services'
cat > 'src/services/orderApi.ts' <<'__RZP_EOF_7f3a__'
import axiosInstance from "./axiosInstance";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "return_requested"
  | "return_approved"
  | "return_received"
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

export const updatePaymentStatus = (
  id: string,
  status: "paid" | "pending",
) =>
  axiosInstance.patch<AdminOrderDetailResponse>(
    `/orders/admin/${id}/payment-status`,
    { status },
  );
__RZP_EOF_7f3a__
echo "  ✓ src/services/orderApi.ts"
d=src/services
mkdir -p 'src/services'
cat > 'src/services/productApi.ts' <<'__RZP_EOF_7f3a__'
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
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  brand?: string;
  tags?: string[];
  attributes?: Record<string, string | string[]>;
  returnPeriodDays?: number;
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
__RZP_EOF_7f3a__
echo "  ✓ src/services/productApi.ts"
d=src/services
mkdir -p 'src/pages/Returns&Refunds'
cat > 'src/pages/Returns&Refunds/ReturnsRefundsSummary.tsx' <<'__RZP_EOF_7f3a__'
import React, { useCallback, useEffect, useState } from "react";
import { Table, Input, Tag, Button, message, Modal, Descriptions, Divider, InputNumber, Form } from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  getAdminReturns,
  getReturnStats,
  approveReturn,
  rejectReturn,
  refundReturn,
  markReceived,
  type AdminReturn,
  type ReturnStats,
  type ReturnStatus,
} from "../../services/returnApi";

// Display row shape mapped from the backend AdminReturn.
interface ReturnRecord {
  key: string;
  id: string;
  returnId: string;
  orderId: string;
  customer: string;
  product: string;
  date: string;
  reason: string;
  status: ReturnStatus;
  amount: number;
  raw: AdminReturn;
}

interface ReturnMetricCard {
  id: number;
  title: string;
  value: string | number;
  subText: string;
  themeClass: "accent-orange" | "accent-blue" | "accent-green" | "accent-black";
}

// Maps a backend return status (plus refund sub-state) to its display label and
// the closest existing status-pill-* class.
const statusDisplay = (r: AdminReturn): { label: string; cls: string } => {
  switch (r.status) {
    case "pending":
      return { label: "Pending", cls: "status-pill-pending" };
    case "approved":
      return { label: "Approved", cls: "status-pill-approved" };
    case "received":
      return { label: "Received", cls: "status-pill-approved" };
    case "processing":
      return { label: "Refund in progress", cls: "status-pill-processing" };
    case "rejected":
      return { label: "Rejected", cls: "status-pill-rejected" };
    case "refunded":
      return r.refund?.status === "processed"
        ? { label: "Refund credited", cls: "status-pill-refunded" }
        : { label: "Refund in progress", cls: "status-pill-processing" };
    default:
      return { label: r.status, cls: "status-pill-pending" };
  }
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const money = (n: number) => `₹${(n ?? 0).toLocaleString("en-IN")}`;

const toRecord = (r: AdminReturn): ReturnRecord => ({
  key: r._id,
  id: r._id,
  returnId: r.returnNumber,
  orderId: r.orderNumber,
  customer: r.customerName,
  product:
    (r.items?.[0]?.name || "—") +
    (r.items && r.items.length > 1 ? ` +${r.items.length - 1} more` : ""),
  date: fmtDate(r.createdAt),
  reason: r.reason,
  status: r.status,
  amount: r.amount,
  raw: r,
});

const ReturnsRefundsSummary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [returnsData, setReturnsData] = useState<ReturnRecord[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [stats, setStats] = useState<ReturnStats | null>(null);
  const [actioningKey, setActioningKey] = useState<string | null>(null);

  // Detail modal
  const [detail, setDetail] = useState<AdminReturn | null>(null);

  // Refund modal
  const [refundTarget, setRefundTarget] = useState<AdminReturn | null>(null);
  const [refundLoading, setRefundLoading] = useState<boolean>(false);
  const [refundForm] = Form.useForm();

  const metrics: ReturnMetricCard[] = [
    { id: 1, title: "Pending Returns", value: stats?.pendingReturns ?? 0, subText: "Awaiting review", themeClass: "accent-orange" },
    { id: 2, title: "Approved", value: stats?.approved ?? 0, subText: "Ready to refund", themeClass: "accent-blue" },
    { id: 3, title: "Refunded", value: stats?.refundedThisMonth ?? 0, subText: "This month", themeClass: "accent-green" },
    { id: 4, title: "Total Refund Amount", value: money(stats?.totalRefundAmount ?? 0), subText: "This month", themeClass: "accent-black" },
  ];

  const loadStats = useCallback(() => {
    getReturnStats()
      .then((res) => setStats(res.data.data))
      .catch(() => {});
  }, []);

  const loadReturns = useCallback(() => {
    setLoading(true);
    getAdminReturns({ page: currentPage, limit: 10, search: searchQuery || undefined })
      .then((res) => {
        setReturnsData(res.data.data.returns.map(toRecord));
        setTotal(res.data.data.total);
      })
      .catch((err: any) => message.error(err?.response?.data?.message || "Failed to load returns"))
      .finally(() => setLoading(false));
  }, [currentPage, searchQuery]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadReturns(); }, [loadReturns]);

  const refreshAll = () => { loadReturns(); loadStats(); };

  const handleApprove = (id: string, returnId: string) => {
    Modal.confirm({
      title: "Approve this return request?",
      icon: <CheckCircleOutlined className="text-success" />,
      content: `Return ${returnId} will be marked as approved and the customer notified to ship the product back.`,
      okText: "Approve",
      cancelText: "Cancel",
      async onOk() {
        setActioningKey(id);
        try {
          await approveReturn(id);
          message.success(`Request ${returnId} has been approved.`);
          refreshAll();
        } catch (err: any) {
          message.error(err?.response?.data?.message || "Failed to approve return.");
        } finally { setActioningKey(null); }
      },
    });
  };

  const handleMarkReceived = async (id: string, returnId: string) => {
    setActioningKey(id);
    try {
      await markReceived(id);
      message.success(`Return ${returnId} marked as product received.`);
      refreshAll();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to mark product received.");
    } finally { setActioningKey(null); }
  };

  const promptProcessRefund = (record: ReturnRecord) => {
    Modal.confirm({
      title: "Trigger automatic Razorpay refund?",
      content:
        "This initiates an instant Razorpay refund of the return amount to the customer's original payment method. You can review or adjust the amount before confirming.",
      okText: "Continue",
      cancelText: "Cancel",
      onOk() {
        setRefundTarget(record.raw);
        refundForm.setFieldsValue({ amount: record.amount });
      },
    });
  };

  const handleReject = (id: string, returnId: string) => {
    Modal.confirm({
      title: `Reject Return Request ${returnId}?`,
      icon: <CloseCircleOutlined className="text-danger" />,
      content: "Are you sure you want to decline this customer refund claim submission?",
      okText: "Reject Request",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        try {
          await rejectReturn(id);
          message.warning(`Request ${returnId} has been rejected.`);
          refreshAll();
        } catch (err: any) {
          message.error(err?.response?.data?.message || "Failed to reject return.");
        }
      },
    });
  };

  const handleProcessRefund = async () => {
    if (!refundTarget) return;
    try {
      const values = await refundForm.validateFields();
      setRefundLoading(true);
      await refundReturn(refundTarget._id, {
        amount: values.amount != null ? Number(values.amount) : undefined,
        note: values.note || undefined,
      });
      message.success(`Refund processed successfully for ${refundTarget.returnNumber}.`);
      setRefundTarget(null);
      refundForm.resetFields();
      refreshAll();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.response?.data?.message || "Failed to process refund.");
    } finally { setRefundLoading(false); }
  };

  const columns: ColumnsType<ReturnRecord> = [
    { title: "Return ID", dataIndex: "returnId", key: "returnId", render: (id) => <span className="return-id-highlight fw-bold">{id}</span> },
    { title: "Order ID", dataIndex: "orderId", key: "orderId", render: (id) => <span className="order-id-txt text-secondary">{id}</span> },
    { title: "Customer", dataIndex: "customer", key: "customer", render: (text) => <span className="customer-txt text-dark fw-medium">{text}</span> },
    { title: "Product", dataIndex: "product", key: "product", render: (text) => <span className="product-txt text-secondary">{text}</span> },
    { title: "Date", dataIndex: "date", key: "date", render: (text) => <span className="date-txt text-muted">{text}</span> },
    { title: "Reason", dataIndex: "reason", key: "reason", render: (text) => <span className="reason-txt text-secondary">{text}</span> },
    {
      title: "Status", dataIndex: "status", key: "status",
      render: (_: ReturnRecord["status"], record) => {
        const { label, cls } = statusDisplay(record.raw);
        return <Tag className={`return-status-pill ${cls}`}>{label}</Tag>;
      },
    },
    { title: "Amount", dataIndex: "amount", key: "amount", render: (amt) => <strong className="amount-txt text-dark">{money(amt)}</strong> },
    {
      title: "Actions", key: "actions", align: "right",
      render: (_, record) => (
        <div className="table-actions-strip d-inline-flex align-items-center gap-2">
          {record.status === "pending" && (
            <>
              <Button
                icon={<CheckCircleOutlined />}
                loading={actioningKey === record.id}
                className="btn-action-approve d-inline-flex align-items-center gap-1"
                onClick={() => handleApprove(record.id, record.returnId)}
              >
                Approve
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                className="btn-action-reject d-inline-flex align-items-center gap-1"
                onClick={() => handleReject(record.id, record.returnId)}
              >
                Reject
              </Button>
            </>
          )}

          {record.status === "approved" && (
            <Button
              loading={actioningKey === record.id}
              className="btn-action-mark-received"
              onClick={() => handleMarkReceived(record.id, record.returnId)}
            >
              Mark Product Received
            </Button>
          )}

          {record.status === "received" && (
            <Button
              className="btn-action-process-refund"
              onClick={() => promptProcessRefund(record)}
            >
              Process Refund
            </Button>
          )}

          <Button
            icon={<EyeOutlined />}
            type="text"
            className="btn-action-view d-inline-flex align-items-center justify-content-center"
            onClick={() => setDetail(record.raw)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="returns-refunds-summary container-fluid p-4">
      <div className="section-header-block mb-4">
        <h1 className="main-section-title mb-1">Returns & Refunds</h1>
        <p className="sub-section-desc text-muted mb-0">Manage product returns and refund requests</p>
      </div>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-4">
        {metrics.map((card) => (
          <div className="col" key={card.id}>
            <div className="kpi-surface-card p-4 d-flex flex-column justify-content-between h-100">
              <div className="card-top-content">
                <span className="kpi-card-title text-muted d-block mb-2">{card.title}</span>
                <h2 className={`kpi-card-numeric mb-2 ${card.themeClass}`}>{card.value}</h2>
              </div>
              <div className="card-bottom-content">
                <span className="kpi-card-subtext text-muted d-block">{card.subText}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="returns-refunds-table-panel pb-4 w-100 mt-4">
        <div className="filter-toolbar p-3 mb-4 bg-white rounded-3 border">
          <Input
            placeholder="Search by return ID or order ID..."
            prefix={<SearchOutlined className="search-icon-dimmed" />}
            className="search-input-field"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <div className="table-card-surface bg-white border rounded-3 overflow-hidden pb-3">
          <Table
            columns={columns}
            dataSource={returnsData}
            loading={loading}
            scroll={{ x: "max-content" }}
            pagination={{
              current: currentPage,
              total,
              pageSize: 10,
              onChange: (page) => setCurrentPage(page),
              position: ["bottomRight"],
              showSizeChanger: false,
              itemRender: (_, type, originalElement) => {
                if (type === "prev") return <Button size="small" className="pag-btn">Previous</Button>;
                if (type === "next") return <Button size="small" className="pag-btn">Next</Button>;
                return originalElement;
              },
            }}
            className="custom-returns-data-grid"
            footer={() => (
              <span className="footer-counter-text text-muted">
                Showing {returnsData.length} of {total} returns
              </span>
            )}
          />
        </div>
      </div>

      {/* Detail modal */}
      <Modal
        open={!!detail}
        title={detail ? `Return ${detail.returnNumber}` : "Return details"}
        footer={null}
        onCancel={() => setDetail(null)}
        width={640}
        destroyOnClose
      >
        {detail && (
          <>
            <Descriptions size="small" column={2} bordered items={[
              { key: "order", label: "Order", children: detail.orderNumber },
              { key: "customer", label: "Customer", children: detail.customerName },
              { key: "reason", label: "Reason", children: detail.reason },
              { key: "type", label: "Type", children: detail.type },
              { key: "status", label: "Status", children: <Tag>{statusDisplay(detail).label}</Tag> },
              { key: "amount", label: "Amount", children: money(detail.amount) },
              ...(detail.reasonText ? [{ key: "note", label: "Customer note", span: 2, children: detail.reasonText }] : []),
              ...(detail.refund?.at ? [{ key: "refund", label: "Refund", span: 2, children: `${money(detail.refund.amount || 0)} via ${detail.refund.method}${detail.refund.razorpayRefundId ? ` (${detail.refund.razorpayRefundId})` : ""}` }] : []),
            ]} />
            <Divider>Items</Divider>
            {detail.items.map((it, idx) => (
              <div key={idx} className="d-flex justify-content-between align-items-center mb-2">
                <span>{it.name} — {[it.color, it.size].filter(Boolean).join(" / ")} × {it.quantity}</span>
                <strong>{money(it.lineTotal)}</strong>
              </div>
            ))}
          </>
        )}
      </Modal>

      {/* Refund modal */}
      <Modal
        open={!!refundTarget}
        title={refundTarget ? `Process Refund — ${refundTarget.returnNumber}` : "Process Refund"}
        okText="Refund"
        okButtonProps={{ danger: true, loading: refundLoading }}
        onCancel={() => { setRefundTarget(null); refundForm.resetFields(); }}
        onOk={handleProcessRefund}
        destroyOnClose
      >
        <Form form={refundForm} layout="vertical">
          <Form.Item name="amount" label="Amount (₹)">
            <InputNumber min={1} style={{ width: "100%" }} placeholder="Refund amount" />
          </Form.Item>
          <Form.Item name="note" label="Internal note">
            <Input.TextArea rows={2} placeholder="Optional note" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReturnsRefundsSummary;
__RZP_EOF_7f3a__
echo "  ✓ src/pages/Returns&Refunds/ReturnsRefundsSummary.tsx"
d='src/pages/Returns&Refunds'
mkdir -p 'src/pages/Orders'
cat > 'src/pages/Orders/OrderDetailModal.tsx' <<'__RZP_EOF_7f3a__'
import React, { useEffect, useState } from "react";
import {
  Modal,
  Descriptions,
  Table,
  Tag,
  Select,
  Input,
  Button,
  Skeleton,
  Divider,
  InputNumber,
  Form,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  getAdminOrder,
  updateOrderStatus,
  refundOrder,
  updatePaymentStatus,
  type AdminOrder,
  type OrderItem,
  type OrderStatus,
} from "../../services/orderApi";

interface OrderDetailModalProps {
  open: boolean;
  orderId: string | null;
  onClose: () => void;
  onUpdated?: () => void;
}

// Human-readable label for an order status, including the new return-lifecycle
// statuses. Falls back to a simple capitalize for anything unmapped.
const formatOrderStatus = (status: string): string => {
  switch (status) {
    case "return_requested":
      return "Return Requested";
    case "return_approved":
      return "Return Request Approved";
    case "return_received":
      return "Return Product Received";
    case "returned":
      return "Returned";
    default:
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : status;
  }
};

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "return_requested", label: "Return Requested" },
  { value: "return_approved", label: "Return Request Approved" },
  { value: "return_received", label: "Return Product Received" },
  { value: "returned", label: "Returned" },
];

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  open,
  orderId,
  onClose,
  onUpdated,
}) => {
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const [statusValue, setStatusValue] = useState<OrderStatus>("pending");
  const [statusNote, setStatusNote] = useState<string>("");

  const [paymentStatusValue, setPaymentStatusValue] = useState<"paid" | "pending">("pending");
  const [paymentSaving, setPaymentSaving] = useState<boolean>(false);

  const [refundOpen, setRefundOpen] = useState<boolean>(false);
  const [refundLoading, setRefundLoading] = useState<boolean>(false);
  const [refundForm] = Form.useForm();

  const fetchOrder = async (id: string) => {
    setLoading(true);
    try {
      const res = await getAdminOrder(id);
      const o = res.data.data.order;
      setOrder(o);
      setStatusValue(o.status);
      setStatusNote("");
      setPaymentStatusValue(o.payment?.status === "paid" ? "paid" : "pending");
    } catch {
      message.error("Failed to load order details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && orderId) {
      fetchOrder(orderId);
    } else if (!open) {
      setOrder(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, orderId]);

  const handleUpdateStatus = async () => {
    if (!order) return;
    setSaving(true);
    try {
      await updateOrderStatus(order._id, {
        status: statusValue,
        note: statusNote || undefined,
      });
      message.success("Order status updated.");
      await fetchOrder(order._id);
      onUpdated?.();
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || "Failed to update order status.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePayment = async () => {
    if (!order) return;
    setPaymentSaving(true);
    try {
      await updatePaymentStatus(order._id, paymentStatusValue);
      message.success("Payment status updated.");
      await fetchOrder(order._id);
      onUpdated?.();
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || "Failed to update payment status.",
      );
    } finally {
      setPaymentSaving(false);
    }
  };

  const handleRefund = async () => {
    if (!order) return;
    try {
      const values = await refundForm.validateFields();
      setRefundLoading(true);
      await refundOrder(order._id, {
        amount:
          values.amount !== undefined && values.amount !== null
            ? Number(values.amount)
            : undefined,
        reason: values.reason || undefined,
        notes: values.notes || undefined,
      });
      message.success("Refund initiated successfully.");
      setRefundOpen(false);
      refundForm.resetFields();
      await fetchOrder(order._id);
      onUpdated?.();
    } catch (err: any) {
      if (err?.errorFields) return; // form validation error
      message.error(err?.response?.data?.message || "Failed to process refund.");
    } finally {
      setRefundLoading(false);
    }
  };

  const money = (n: number) => `₹${(n ?? 0).toLocaleString("en-IN")}`;

  const itemColumns: ColumnsType<OrderItem> = [
    { title: "Item", dataIndex: "name", key: "name" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    {
      title: "Variant",
      key: "variant",
      render: (_, r) =>
        [r.color, r.size].filter(Boolean).join(" / ") || "—",
    },
    { title: "Qty", dataIndex: "quantity", key: "quantity", align: "center" },
    {
      title: "Unit",
      dataIndex: "unitPrice",
      key: "unitPrice",
      align: "right",
      render: (v: number) => money(v),
    },
    {
      title: "Total",
      dataIndex: "lineTotal",
      key: "lineTotal",
      align: "right",
      render: (v: number) => money(v),
    },
  ];

  const canRefund =
    !!order &&
    order.payment?.method === "razorpay" &&
    (order.payment?.status === "paid" ||
      order.payment?.status === "partially_refunded");

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={820}
        title={order ? `Order ${order.orderNumber}` : "Order Details"}
        destroyOnClose
      >
        {loading || !order ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <div className="order-detail-modal-body">
            <Descriptions
              size="small"
              column={2}
              bordered
              className="mb-3"
              items={[
                { key: "customer", label: "Customer", children: order.customerName },
                { key: "email", label: "Email", children: order.customerEmail },
                { key: "phone", label: "Phone", children: order.customerPhone },
                {
                  key: "placed",
                  label: "Placed On",
                  children: new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }),
                },
                {
                  key: "status",
                  label: "Status",
                  children: <Tag>{formatOrderStatus(order.status)}</Tag>,
                },
                {
                  key: "payment",
                  label: "Payment",
                  children: (
                    <>
                      <Tag>{order.payment?.method}</Tag>
                      <Tag>{order.payment?.status}</Tag>
                    </>
                  ),
                },
                {
                  key: "ship",
                  label: "Ship To",
                  span: 2,
                  children: `${order.shippingAddress?.fullName}, ${
                    order.shippingAddress?.addressLine1
                  }${
                    order.shippingAddress?.addressLine2
                      ? `, ${order.shippingAddress.addressLine2}`
                      : ""
                  }, ${order.shippingAddress?.city}, ${
                    order.shippingAddress?.state
                  } - ${order.shippingAddress?.pincode}`,
                },
              ]}
            />

            <Table
              size="small"
              rowKey={(r) => r.sku + r.name}
              columns={itemColumns}
              dataSource={order.items}
              pagination={false}
              scroll={{ x: "max-content" }}
            />

            <div className="d-flex flex-column align-items-end mt-3 gap-1">
              <span>Subtotal: {money(order.subtotal)}</span>
              {order.discount > 0 && (
                <span>Discount: -{money(order.discount)}</span>
              )}
              <span>Shipping: {money(order.shippingFee)}</span>
              <span>Tax: {money(order.tax)}</span>
              <strong>Total: {money(order.total)}</strong>
              {order.payment?.amountRefunded > 0 && (
                <span>Refunded: -{money(order.payment.amountRefunded)}</span>
              )}
            </div>

            <Divider />

            {/* Status update control */}
            <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-end gap-2">
              <div style={{ minWidth: 180 }}>
                <label className="text-muted d-block mb-1">Update Status</label>
                <Select
                  value={statusValue}
                  onChange={(v) => setStatusValue(v)}
                  options={STATUS_OPTIONS}
                  style={{ width: "100%" }}
                />
              </div>
              <Input
                placeholder="Note (optional)"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="flex-grow-1"
              />
              <Button
                type="primary"
                loading={saving}
                onClick={handleUpdateStatus}
              >
                Update Status
              </Button>
              {canRefund && (
                <Button danger onClick={() => setRefundOpen(true)}>
                  Process Refund
                </Button>
              )}
            </div>

            {/* COD payment collection control */}
            {order.payment?.method === "cod" && (
              <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-end gap-2 mt-3">
                <div style={{ minWidth: 180 }}>
                  <label className="text-muted d-block mb-1">Payment Status (COD)</label>
                  <Select
                    value={paymentStatusValue}
                    onChange={(v) => setPaymentStatusValue(v)}
                    options={[
                      { value: "pending", label: "Pending" },
                      { value: "paid", label: "Paid" },
                    ]}
                    style={{ width: "100%" }}
                  />
                </div>
                <Button
                  type="primary"
                  loading={paymentSaving}
                  onClick={handleUpdatePayment}
                >
                  Update Payment
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Refund sub-modal */}
      <Modal
        open={refundOpen}
        title="Process Refund"
        okText="Refund"
        okButtonProps={{ danger: true, loading: refundLoading }}
        onCancel={() => {
          setRefundOpen(false);
          refundForm.resetFields();
        }}
        onOk={handleRefund}
        destroyOnClose
      >
        <Form form={refundForm} layout="vertical">
          <Form.Item
            name="amount"
            label="Amount (₹) — leave blank for full refund"
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder="Full refund if empty"
            />
          </Form.Item>
          <Form.Item name="reason" label="Reason">
            <Input placeholder="e.g. Customer request, defective item" />
          </Form.Item>
          <Form.Item name="notes" label="Internal Notes">
            <Input.TextArea rows={2} placeholder="Optional internal notes" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default OrderDetailModal;
__RZP_EOF_7f3a__
echo "  ✓ src/pages/Orders/OrderDetailModal.tsx"
d=src/pages/Orders
mkdir -p 'src/pages/Orders'
cat > 'src/pages/Orders/OrdersTable.tsx' <<'__RZP_EOF_7f3a__'
import React, { useCallback, useEffect, useState } from 'react';
import { Table, Tag, Button, message } from 'antd';
import { EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getAdminOrders, type AdminOrder } from '../../services/orderApi';
import OrderDetailModal from './OrderDetailModal';

// TypeScript schema defining structure matching data items in the image
interface OrderRecord {
  key: string;
  id: string; // raw DB _id, used for detail/actions
  orderId: string;
  customerName: string;
  customerEmail: string;
  date: string;
  itemsCount: number;
  paymentStatus: 'Paid' | 'Pending';
  orderStatus: AdminOrder['status'];
  amount: number;
}

interface OrdersTableProps {
  search?: string;
  statusFilter?: string; // lowercase API status enum, or undefined for all
}

// Human-readable label for a raw order status enum, including the new
// return-lifecycle statuses (so they render as readable text, not snake_case).
const formatOrderStatus = (status: AdminOrder['status']): string => {
  switch (status) {
    case 'confirmed':
      return 'Processing'; // UI has no Confirmed tag — treat as Processing
    case 'return_requested':
      return 'Return Requested';
    case 'return_approved':
      return 'Return Request Approved';
    case 'return_received':
      return 'Return Product Received';
    case 'returned':
      return 'Returned';
    default:
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : status;
  }
};

// Map a raw order status to the closest existing state-* pill class.
const orderStatusClass = (status: AdminOrder['status']): string => {
  switch (status) {
    case 'delivered':
      return 'state-delivered';
    case 'shipped':
      return 'state-shipped';
    case 'cancelled':
      return 'state-cancelled';
    case 'returned':
    case 'return_requested':
    case 'return_approved':
    case 'return_received':
      return 'state-returned';
    case 'confirmed':
    case 'processing':
      return 'state-processing';
    case 'pending':
    default:
      return 'state-pending';
  }
};

const OrdersTable: React.FC<OrdersTableProps> = ({ search, statusFilter }) => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminOrders({
        page: 1,
        limit: 50,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      const mapped: OrderRecord[] = res.data.data.orders.map((o) => ({
        key: o._id,
        id: o._id,
        orderId: o.orderNumber,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        date: new Date(o.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        itemsCount: o.items.length,
        paymentStatus: o.payment?.status === 'paid' ? 'Paid' : 'Pending',
        orderStatus: o.status,
        amount: o.total,
      }));
      setOrders(mapped);
    } catch {
      message.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleViewOrder = (id: string) => {
    setActiveOrderId(id);
    setModalOpen(true);
  };

  const handleDownloadInvoice = (orderId: string) => {
    message.success(`Invoice PDF requested for ${orderId}`);
  };

  // Ant Design dynamic columns layout configuration matrix
  const columns: ColumnsType<OrderRecord> = [
    {
      title: 'ORDER ID',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 120,
      render: (id: string) => {
        // Hyphen break splitting matching the strict cell stack look in the image
        const part1 = id.substring(0, 5);
        const part2 = id.substring(5);
        return (
          <div className="order-id-cell-wrap fw-bold">
            {part1}<br />{part2}
          </div>
        );
      }
    },
    {
      title: 'CUSTOMER',
      key: 'customer',
      render: (_, record) => (
        <div className="customer-meta-cell">
          <div className="customer-name fw-bold mb-0 text-dark">{record.customerName}</div>
          <small className="customer-email text-muted d-block">{record.customerEmail}</small>
        </div>
      )
    },
    {
      title: 'DATE',
      dataIndex: 'date',
      key: 'date',
      width: 110,
      render: (dateStr: string) => {
        // Breaks dates down across separate lines matching the precise container layout
        const dateParts = dateStr.split(' ');
        return (
          <div className="date-cell text-muted">
            {dateParts[0]} {dateParts[1]}<br />{dateParts[2]}
          </div>
        );
      }
    },
    {
      title: 'ITEMS',
      dataIndex: 'itemsCount',
      key: 'items',
      render: (count: number) => (
        <span className="items-count-text text-secondary">
          {count} {count === 1 ? 'item' : 'items'}
        </span>
      )
    },
    {
      title: 'PAYMENT',
      dataIndex: 'paymentStatus',
      key: 'payment',
      render: (status: OrderRecord['paymentStatus']) => (
        <Tag className={`payment-pill-tag tag-${status.toLowerCase()}`}>
          {status}
        </Tag>
      )
    },
    {
      title: 'STATUS',
      dataIndex: 'orderStatus',
      key: 'status',
      render: (status: OrderRecord['orderStatus']) => (
        <Tag className={`status-pill-tag ${orderStatusClass(status)}`}>
          {formatOrderStatus(status)}
        </Tag>
      )
    },
    {
      title: 'AMOUNT',
      dataIndex: 'amount',
      key: 'amount',
      render: (amt: number) => (
        <strong className="amount-label-text text-dark fs-6">
          ₹{amt.toLocaleString('en-IN')}
        </strong>
      )
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <div className="actions-wrapper-strip d-inline-flex align-items-center gap-2">
          <Button
            icon={<EyeOutlined />}
            className="btn-action-view d-inline-flex align-items-center justify-content-center"
            onClick={() => handleViewOrder(record.id)}
          >
            View
          </Button>
          <Button
            icon={<DownloadOutlined />}
            className="btn-action-download d-inline-flex align-items-center justify-content-center"
            type="text"
            onClick={() => handleDownloadInvoice(record.orderId)}
          />
        </div>
      )
    }
  ];

  return (
    <div className="orders-table-wrapper bg-white shadow-sm rounded-3 mt-4">
      <Table
        columns={columns}
        dataSource={orders}
        loading={loading}
        pagination={false}
        scroll={{ x: "max-content" }}
        className="custom-orders-data-grid"
        // responsive={true}
      />
      <OrderDetailModal
        open={modalOpen}
        orderId={activeOrderId}
        onClose={() => setModalOpen(false)}
        onUpdated={fetchOrders}
      />
    </div>
  );
};

export default OrdersTable;
__RZP_EOF_7f3a__
echo "  ✓ src/pages/Orders/OrdersTable.tsx"
d=src/pages/Orders
mkdir -p 'src/pages/Product'
cat > 'src/pages/Product/AddNewProduct.tsx' <<'__RZP_EOF_7f3a__'
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "../../hooks";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Tabs,
  Tag,
  Table,
  Modal,
  Image,
  Alert,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  TagOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  getAdminProductBySlug,
  createProduct,
  updateProduct,
  toggleProductStatus,
  approveProduct,
  rejectProduct,
  deleteVariant,
  type ProductWithVariants,
  type ProductVariant,
} from "../../services/productApi";
import {
  getAdminCategories,
  type FilterableAttribute,
} from "../../services/categoryApi";
import AddVariantModal from "./AddVariantModal";

interface CategoryOption {
  value: string;
  label: string;
  filterableAttributes: FilterableAttribute[];
}

interface ProductFormValues {
  name: string;
  description?: string;
  category: string;
  brand?: string;
  tags?: string[];
  attributes?: Record<string, string | string[]>;
  returnPeriodDays?: number;
}

// Mirrors the customer-facing product gallery: a large main image with a
// clickable thumbnail strip, so admins can review images exactly as
// customers will see them before approving a product.
const VariantImageGallery: React.FC<{ variant: ProductVariant }> = ({ variant }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const media = variant.media || [];

  if (media.length === 0) {
    return <p className="text-muted small mb-0">No images uploaded for this variant.</p>;
  }

  return (
    <div className="d-flex flex-column gap-2" style={{ maxWidth: 260 }}>
      <Image
        src={media[Math.min(activeIndex, media.length - 1)]?.url}
        alt={`${variant.color} ${variant.size || ""}`}
        width={240}
        height={240}
        style={{ objectFit: "cover", borderRadius: 8 }}
        preview={{ mask: "Zoom" }}
      />
      {media.length > 1 && (
        <div className="d-flex gap-2 flex-wrap">
          {media.map((m, i) => (
            <img
              key={m._id}
              src={m.url}
              alt={`${variant.color} view ${i + 1}`}
              onClick={() => setActiveIndex(i)}
              style={{
                width: 48,
                height: 48,
                objectFit: "cover",
                borderRadius: 4,
                cursor: "pointer",
                border: i === activeIndex ? "2px solid #1677ff" : "1px solid #d9d9d9",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const statusColors: Record<string, string> = {
  pending: "gold",
  approved: "green",
  rejected: "red",
};

const AddNewProduct: React.FC = () => {
  const [form] = Form.useForm<ProductFormValues>();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const isEdit = !!slug;

  const role = useAppSelector((state) => state.auth.user?.role);
  const canApprove = role === "super_admin" || role === "admin";

  const [tab, setTab] = useState("1");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [product, setProduct] = useState<ProductWithVariants | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getAdminCategories();
        const flattened: CategoryOption[] = [];
        res.data.data.categories.forEach((parent) => {
          (parent.subcategories || []).forEach((sub) => {
            flattened.push({
              value: sub._id,
              label: `${parent.name} > ${sub.name}`,
              filterableAttributes: sub.filterableAttributes || [],
            });
          });
        });
        setCategoryOptions(flattened);
      } catch (err: any) {
        message.error(err?.response?.data?.message || "Failed to load categories");
      }
    };

    const loadProduct = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await getAdminProductBySlug(slug);
        const p = res.data.data.product;
        setProduct(p);
        setVariants(p.variants || []);
        setSelectedCategoryId(p.category._id);
        const attributes = { ...(p.attributes || {}) };
        if (attributes.occasion !== undefined && !Array.isArray(attributes.occasion)) {
          attributes.occasion = attributes.occasion ? [attributes.occasion] : [];
        }
        form.setFieldsValue({
          name: p.name,
          description: p.description,
          category: p.category._id,
          brand: p.brand,
          tags: p.tags || [],
          attributes,
          returnPeriodDays: p.returnPeriodDays ?? 14,
        });
      } catch (err: any) {
        message.error(err?.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
    loadProduct();
  }, [slug, form]);

  const selectedCategory = categoryOptions.find((c) => c.value === selectedCategoryId);

  const handleFinish = async (values: ProductFormValues) => {
    setSubmitting(true);
    try {
      if (isEdit && product) {
        const payload = {
          name: values.name,
          description: values.description,
          brand: values.brand,
          tags: values.tags,
          attributes: values.attributes || {},
          returnPeriodDays: values.returnPeriodDays ?? 14,
        };
        const res = await updateProduct(product._id, payload);
        message.success(res.data.message);
        setProduct((prev) => (prev ? { ...prev, ...res.data.data.product } : prev));
      } else {
        const payload = {
          name: values.name,
          description: values.description,
          category: values.category,
          brand: values.brand,
          tags: values.tags,
          attributes: values.attributes || {},
          returnPeriodDays: values.returnPeriodDays ?? 14,
        };
        const res = await createProduct(payload);
        message.success(res.data.message);
        navigate(`/products/edit/${res.data.data.product.slug}`);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (checked: boolean) => {
    if (!product) return;
    try {
      const res = await toggleProductStatus(product._id);
      setProduct({ ...product, isActive: res.data.data.product.isActive });
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to update status");
    }
  };

  const handleApprove = async () => {
    if (!product) return;
    try {
      const res = await approveProduct(product._id);
      message.success(res.data.message);
      setProduct({ ...product, ...res.data.data.product });
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to approve product");
    }
  };

  const handleReject = async () => {
    if (!product) return;
    if (rejectReason.trim().length < 5) {
      message.error("Please provide a reason of at least 5 characters");
      return;
    }
    setRejecting(true);
    try {
      const res = await rejectProduct(product._id, rejectReason.trim());
      message.success(res.data.message);
      setProduct({ ...product, ...res.data.data.product });
      setRejectModalOpen(false);
      setRejectReason("");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to reject product");
    } finally {
      setRejecting(false);
    }
  };

  const handleVariantSuccess = (variant: ProductVariant) => {
    setVariants((prev) => {
      const exists = prev.find((v) => v._id === variant._id);
      if (exists) return prev.map((v) => (v._id === variant._id ? variant : v));
      return [...prev, variant];
    });
  };

  const handleDeleteVariant = (variant: ProductVariant) => {
    if (!product) return;
    Modal.confirm({
      title: "Delete Variant",
      content: `Are you sure you want to delete the ${variant.color}${variant.size ? ` / ${variant.size}` : ""} variant?`,
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteVariant(product._id, variant._id);
          setVariants((prev) => prev.filter((v) => v._id !== variant._id));
          message.success("Variant deleted successfully");
        } catch (err: any) {
          message.error(err?.response?.data?.message || "Failed to delete variant");
        }
      },
    });
  };

  const variantColumns: ColumnsType<ProductVariant> = [
    {
      title: "Color",
      dataIndex: "color",
      key: "color",
      width: 120,
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      width: 100,
      render: (size) => size || "Free Size",
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      width: 140,
    },
    {
      title: "MRP",
      dataIndex: "mrp",
      key: "mrp",
      width: 110,
      align: "right",
      render: (mrp) => `₹${mrp.toLocaleString("en-IN")}`,
    },
    {
      title: "Selling Price",
      dataIndex: "sellingPrice",
      key: "sellingPrice",
      width: 130,
      align: "right",
      render: (price) => `₹${price.toLocaleString("en-IN")}`,
    },
    {
      title: "Discount",
      dataIndex: "discount",
      key: "discount",
      width: 100,
      align: "right",
      render: (discount) => `${discount}%`,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      width: 90,
      align: "right",
    },
    {
      title: "Media",
      dataIndex: "media",
      key: "media",
      width: 130,
      render: (media: ProductVariant["media"]) => (
        <div className="d-flex gap-1">
          {(media || []).slice(0, 3).map((m) => (
            <Image
              key={m._id}
              src={m.url}
              alt="variant"
              className="variant-media-thumb"
              width={40}
              height={40}
              style={{ objectFit: "cover" }}
              preview={{ mask: "Zoom" }}
            />
          ))}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      align: "right",
      render: (_, record) => (
        <div className="d-inline-flex gap-2">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingVariant(record);
              setVariantModalOpen(true);
            }}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteVariant(record)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="add-product-container container-fluid p-4 min-vh-100">
      <div className="header-navigation-row mb-4">
        <button
          className="back-btn d-inline-flex align-items-center gap-2 p-0 border-0 bg-transparent mb-2"
          onClick={() => navigate("/products")}
          type="button"
        >
          <ArrowLeftOutlined /> Back
        </button>
        <h1 className="main-title mb-1">{isEdit ? "Edit Product" : "Add New Product"}</h1>
        <p className="subtitle-text text-muted mb-0">
          {isEdit ? "Update product details and manage variants" : "Create a new product"}
        </p>
      </div>

      {isEdit && product?.pendingChanges && (
        <Alert
          className="mb-4"
          type="info"
          showIcon
          message={canApprove ? "Edit pending review" : "Your changes are pending review"}
          description={
            canApprove
              ? "This product is live. The partner has submitted edits below — the live listing shown to customers will not change until you approve or reject these changes."
              : "You've submitted changes to this live product. Customers continue to see the current approved details until admin/super_admin approves your edits."
          }
        />
      )}

      {isEdit && !canApprove && product?.approvalStatus === "approved" && !product?.pendingChanges && product?.rejectionReason && (
        <Alert
          className="mb-4"
          type="warning"
          showIcon
          message="Your last submitted edit was rejected"
          description={`Reason: ${product.rejectionReason}. Your live listing is unaffected — you can edit and resubmit.`}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
        disabled={loading}
        initialValues={{ returnPeriodDays: 14 }}
      >
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="form-card-surface card-info-box p-4">
              <Tabs
                activeKey={tab}
                className="custom-form-tabs mb-4"
                items={[
                  { key: "1", label: "Basic Information" },
                  { key: "2", label: "Attributes" },
                ]}
                onChange={setTab}
              />
              {tab === "1" && (
                <>
                  <Form.Item
                    label="Product Name"
                    name="name"
                    rules={[{ required: true, message: "Please enter the product name" }]}
                  >
                    <Input placeholder="Enter product name" className="custom-form-input" size="large" />
                  </Form.Item>

                  <div className="row">
                    <div className="col-12 col-md-6">
                      <Form.Item
                        label="Category"
                        name="category"
                        rules={[{ required: true, message: "Please select a category" }]}
                      >
                        <Select
                          placeholder="Select category"
                          className="custom-form-select"
                          size="large"
                          disabled={isEdit}
                          options={categoryOptions}
                          onChange={(val) => setSelectedCategoryId(val)}
                        />
                      </Form.Item>
                    </div>
                    <div className="col-12 col-md-6">
                      <Form.Item label="Brand" name="brand">
                        <Input placeholder="Enter brand name" className="custom-form-input" size="large" />
                      </Form.Item>
                    </div>
                  </div>

                  <Form.Item label="Tags" name="tags">
                    <Select
                      mode="tags"
                      placeholder="Add tags and press enter"
                      className="custom-form-select"
                      size="large"
                      open={false}
                    />
                  </Form.Item>

                  <div className="row">
                    <div className="col-12 col-md-6">
                      <Form.Item
                        label="Return Period (days)"
                        name="returnPeriodDays"
                        extra="Days after delivery a customer can request a return"
                      >
                        <InputNumber
                          min={0}
                          placeholder="14"
                          className="custom-form-input w-100"
                          size="large"
                        />
                      </Form.Item>
                    </div>
                  </div>

                  <Form.Item label="Product Description" name="description">
                    <Input.TextArea
                      placeholder="Enter product description"
                      rows={4}
                      className="custom-form-input custom-textarea"
                    />
                  </Form.Item>
                </>
              )}
              {tab === "2" && (
                <div>
                  {selectedCategory && selectedCategory.filterableAttributes.length > 0 ? (
                    <div className="row">
                      {selectedCategory.filterableAttributes.map((attr) => (
                        <div className="col-12 col-md-6" key={attr.key}>
                          <Form.Item label={attr.label} name={["attributes", attr.key]}>
                            {attr.key === "occasion" ? (
                              <Select
                                mode="multiple"
                                placeholder={`Select ${attr.label}`}
                                className="custom-form-select"
                                size="large"
                                options={attr.options.map((opt) => ({ value: opt, label: opt }))}
                                allowClear
                              />
                            ) : attr.type === "select" || attr.type === "color" ? (
                              <Select
                                placeholder={`Select ${attr.label}`}
                                className="custom-form-select"
                                size="large"
                                options={attr.options.map((opt) => ({ value: opt, label: opt }))}
                                allowClear
                              />
                            ) : (
                              <Input
                                placeholder={`Enter ${attr.label}`}
                                className="custom-form-input"
                                size="large"
                              />
                            )}
                          </Form.Item>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state-dashed-box d-flex flex-column align-items-center justify-content-center text-center p-5">
                      <div className="icon-badge-circle d-flex align-items-center justify-content-center mb-4">
                        <TagOutlined className="badge-tag-icon" />
                      </div>
                      <h3 className="empty-state-main-msg mb-2">
                        Select a category to view attributes
                      </h3>
                      <p className="empty-state-sub-instruction mb-0 text-muted mx-auto">
                        Go to Basic Information tab and choose a category
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="d-flex flex-column gap-4">
              {isEdit && product && (
                <div className="form-card-surface p-4">
                  <h3 className="card-inner-heading mb-4">Status</h3>

                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="toggle-label-text">Approval Status</span>
                    <Tag color={statusColors[product.approvalStatus]}>
                      {product.approvalStatus.toUpperCase()}
                    </Tag>
                  </div>

                  {canApprove && product.createdBy && (
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <span className="toggle-label-text">Product Owner</span>
                      <span className="text-end">
                        {product.createdBy.name || product.createdBy.email}
                      </span>
                    </div>
                  )}

                  {product.approvalStatus === "rejected" && product.rejectionReason && (
                    <p className="text-muted small mb-3">
                      Reason: {product.rejectionReason}
                    </p>
                  )}

                  {canApprove && product.pendingChanges && (
                    <div className="mb-3">
                      <span className="toggle-label-text d-block mb-2">Proposed Changes</span>
                      <div className="p-2 rounded" style={{ background: "#f5f5f5", fontSize: 12 }}>
                        {Object.entries(product.pendingChanges).map(([key, value]) => (
                          <div key={key} className="mb-1">
                            <strong>{key}:</strong>{" "}
                            {Array.isArray(value) ? value.join(", ") : String(value ?? "—")}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="toggle-label-text">Active</span>
                    <Switch
                      checked={product.isActive}
                      disabled={product.approvalStatus !== "approved"}
                      onChange={handleToggleActive}
                      className="custom-form-switch"
                    />
                  </div>

                  {canApprove && (product.approvalStatus === "pending" || product.pendingChanges) && (
                    <div className="d-flex gap-2 mt-3">
                      <Button type="primary" className="flex-grow-1" onClick={handleApprove}>
                        Approve
                      </Button>
                      <Button danger className="flex-grow-1" onClick={() => setRejectModalOpen(true)}>
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="action-button-stack d-flex flex-column gap-2 mt-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  className="brand-submit-btn w-100 btn-lg"
                  size="large"
                >
                  {isEdit ? "Save Changes" : "Create Product"}
                </Button>
                <Button
                  className="brand-cancel-btn w-100 btn-lg"
                  size="large"
                  onClick={() => navigate("/products")}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>

        {isEdit && (
          <div className="row g-4 mt-4">
            <div className="col-12">
              <div className="form-card-surface card-info-box p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="card-inner-heading mb-0">Variants</h3>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingVariant(null);
                      setVariantModalOpen(true);
                    }}
                  >
                    Add Variant
                  </Button>
                </div>
                <Table
                  className="variants-table"
                  columns={variantColumns}
                  dataSource={variants}
                  rowKey="_id"
                  pagination={false}
                  scroll={{ x: "max-content" }}
                />
              </div>
            </div>
          </div>
        )}

        {isEdit && canApprove && variants.length > 0 && (
          <div className="row g-4 mt-4">
            <div className="col-12">
              <div className="form-card-surface card-info-box p-4">
                <h3 className="card-inner-heading mb-4">Product Images (Customer Preview)</h3>
                <div className="row g-4">
                  {variants.map((variant) => (
                    <div className="col-12 col-md-6 col-lg-4" key={variant._id}>
                      <div className="d-flex flex-column gap-2">
                        <span className="fw-semibold">
                          {variant.color}{variant.size ? ` / ${variant.size}` : ""}
                        </span>
                        <VariantImageGallery variant={variant} />
                        <div className="d-flex align-items-center gap-2">
                          <span className="price-current">
                            ₹{variant.sellingPrice.toLocaleString("en-IN")}
                          </span>
                          {variant.mrp > variant.sellingPrice && (
                            <>
                              <span className="text-muted text-decoration-line-through">
                                ₹{variant.mrp.toLocaleString("en-IN")}
                              </span>
                              <Tag color="volcano">{variant.discount}% OFF</Tag>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Form>

      {isEdit && product && (
        <AddVariantModal
          open={variantModalOpen}
          onClose={() => setVariantModalOpen(false)}
          onSuccess={handleVariantSuccess}
          productId={product._id}
          editingVariant={editingVariant}
        />
      )}

      <Modal
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        onOk={handleReject}
        okText="Reject Product"
        okButtonProps={{ danger: true, loading: rejecting }}
        title="Reject Product"
        centered
      >
        <p className="text-muted mb-2">Please provide a reason for rejection (min. 5 characters):</p>
        <Input.TextArea
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="e.g., Price is too high compared to market rate"
        />
      </Modal>
    </div>
  );
};

export default AddNewProduct;
__RZP_EOF_7f3a__
echo "  ✓ src/pages/Product/AddNewProduct.tsx"
echo; echo "Done — update applied."
