#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Razorpay integration installer — ADMIN CLIENT
# Run this FROM THE ROOT of the project folder:  bash apply-3-admin.sh
# Safe to re-run (idempotent). Does NOT touch .env or node_modules.
# ─────────────────────────────────────────────────────────────
set -euo pipefail
echo "Applying changes in: $(pwd)"
echo
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

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
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
                  children: <Tag>{order.status}</Tag>,
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
mkdir -p 'src/pages/Orders'
cat > 'src/pages/Orders/OrdersManagement.tsx' <<'__RZP_EOF_7f3a__'
import React, { useEffect, useState } from "react";
import { Button, Input, Select, message } from "antd";
import {
  DownloadOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import OrdersTable from "./OrdersTable";
import { getAdminOrderStats, type OrderStats } from "../../services/orderApi";

// TypeScript schema interfaces defining mock metrics
interface OrderMetricCard {
  id: number;
  title: string;
  count: number;
  subText: string;
  accentClass: string; // Dynamic mapping for specific font colors from image
}

// Map the toolbar status labels to the backend status enum.
const STATUS_PARAM_MAP: Record<string, string | undefined> = {
  "All Orders": undefined,
  Pending: "pending",
  Processing: "processing",
  Delivered: "delivered",
};

const OrdersManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [orderStatusFilter, setOrderStatusFilter] =
    useState<string>("All Orders");
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<OrderStats | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAdminOrderStats();
        setStats(res.data.data);
      } catch {
        message.error("Failed to load order stats.");
      }
    })();
  }, []);

  // KPI metadata; counts are populated from live stats when available.
  const summaryMetrics: OrderMetricCard[] = [
    {
      id: 1,
      title: "Total Orders",
      count: stats?.totalOrders ?? 0,
      subText: "+12% from last month",
      accentClass: "accent-black",
    },
    {
      id: 2,
      title: "Pending",
      count: stats?.pending ?? 0,
      subText: "Requires attention",
      accentClass: "accent-orange",
    },
    {
      id: 3,
      title: "Processing",
      count: stats?.processing ?? 0,
      subText: "Being prepared",
      accentClass: "accent-blue",
    },
    {
      id: 4,
      title: "Delivered",
      count: stats?.delivered ?? 0,
      subText: "Successfully completed",
      accentClass: "accent-green",
    },
  ];

  // Action download simulation trigger
  const handleExportOrders = async () => {
    setExportLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      message.success("Orders dataset exported successfully as CSV!");
    } catch {
      message.error("Export routine failed. Try again.");
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="orders-management-dashboard container-fluid p-4">
      {/* Pinned Top Heading Strip */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <h1 className="main-section-title mb-1">Orders</h1>
          <p className="sub-section-desc text-muted mb-0">
            Manage and track customer orders
          </p>
        </div>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          loading={exportLoading}
          onClick={handleExportOrders}
          className="export-orders-brand-btn d-inline-flex align-items-center justify-content-center"
        >
          Export Orders
        </Button>
      </div>

      {/* Row Block: Upper Metrics Flex Summary Layout Grid */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-4 mb-4">
        {summaryMetrics.map((card) => (
          <div className="col" key={card.id}>
            <div className="order-kpi-surface-card p-4 d-flex flex-column justify-content-between h-100">
              <span className="kpi-card-title text-muted d-block mb-2">
                {card.title}
              </span>
              <h2 className={`kpi-card-numeric mb-2 ${card.accentClass}`}>
                {card.count}
              </h2>
              {/* Check if first card to apply custom trend green highlight matching design */}
              <span
                className={`kpi-card-subtext ${card.id === 1 ? "trend-green-txt" : ""}`}
              >
                {card.subText}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Control Filter Options Dynamic Toolbar Container Strip */}
      <div className="filter-controls-card p-3 d-flex flex-column flex-md-row justify-content-between gap-3 align-items-stretch align-items-md-center">
        <Input
          size="large"
          placeholder="Search by order ID or customer name..."
          prefix={<SearchOutlined className="search-icon-dimmed" />}
          className="search-input-field flex-grow-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="d-flex align-items-center gap-2 flex-wrap flex-sm-nowrap">
          <Select
            size="large"
            value={orderStatusFilter}
            onChange={(val) => setOrderStatusFilter(val)}
            className="toolbar-select-dropdown"
            options={[
              { value: "All Orders", label: "All Orders" },
              { value: "Pending", label: "Pending" },
              { value: "Processing", label: "Processing" },
              { value: "Delivered", label: "Delivered" },
            ]}
          />
          <Button size="large" icon={<FilterOutlined />} className="more-filters-action-btn">
            More Filters
          </Button>
        </div>
      </div>
      <OrdersTable
        search={searchQuery}
        statusFilter={STATUS_PARAM_MAP[orderStatusFilter]}
      />
    </div>
  );
};

export default OrdersManagement;
__RZP_EOF_7f3a__
echo "  ✓ src/pages/Orders/OrdersManagement.tsx"
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
  orderStatus: 'Delivered' | 'Processing' | 'Shipped' | 'Pending' | 'Cancelled' | 'Returned';
  amount: number;
}

interface OrdersTableProps {
  search?: string;
  statusFilter?: string; // lowercase API status enum, or undefined for all
}

// Map raw order status enum to the existing display label set.
const mapOrderStatus = (status: AdminOrder['status']): OrderRecord['orderStatus'] => {
  switch (status) {
    case 'confirmed':
      return 'Processing'; // UI has no Confirmed tag — treat as Processing
    case 'processing':
      return 'Processing';
    case 'shipped':
      return 'Shipped';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    case 'returned':
      return 'Returned';
    case 'pending':
    default:
      return 'Pending';
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
        orderStatus: mapOrderStatus(o.status),
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
        <Tag className={`status-pill-tag state-${status.toLowerCase()}`}>
          {status}
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
  type AdminReturn,
  type ReturnStats,
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
  status: "Pending" | "Approved" | "Refunded" | "Rejected" | "Processing";
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

const cap = (s: string) =>
  (s ? s.charAt(0).toUpperCase() + s.slice(1) : s) as ReturnRecord["status"];

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
  status: cap(r.status),
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

  const handleApprove = async (id: string, returnId: string) => {
    setActioningKey(id);
    try {
      await approveReturn(id);
      message.success(`Request ${returnId} has been approved.`);
      refreshAll();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to approve return.");
    } finally { setActioningKey(null); }
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
      render: (status: ReturnRecord["status"]) => {
        const styleMap = {
          Pending: "status-pill-pending",
          Approved: "status-pill-approved",
          Refunded: "status-pill-refunded",
          Rejected: "status-pill-rejected",
          Processing: "status-pill-processing",
        };
        return <Tag className={`return-status-pill ${styleMap[status]}`}>{status}</Tag>;
      },
    },
    { title: "Amount", dataIndex: "amount", key: "amount", render: (amt) => <strong className="amount-txt text-dark">{money(amt)}</strong> },
    {
      title: "Actions", key: "actions", align: "right",
      render: (_, record) => (
        <div className="table-actions-strip d-inline-flex align-items-center gap-2">
          {record.status === "Pending" && (
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

          {record.status === "Approved" && (
            <Button
              className="btn-action-process-refund"
              onClick={() => { setRefundTarget(record.raw); refundForm.setFieldsValue({ amount: record.amount }); }}
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
              { key: "status", label: "Status", children: <Tag>{cap(detail.status)}</Tag> },
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
mkdir -p 'src/pages/Revenue&Payments'
cat > 'src/pages/Revenue&Payments/RecentTransactionsAndRefunds.tsx' <<'__RZP_EOF_7f3a__'
import React, { useEffect, useState } from "react";
import { Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { getTransactions, getRefunds } from "../../services/revenueApi";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// TypeScript schema interface defining transaction record entries
interface TransactionRecord {
  key: string;
  txId: string;
  orderId: string;
  customer: string;
  date: string;
  method: string;
  status: "Success" | "Pending";
  amount: number;
}

// TypeScript schema interface defining refund record entries
interface RefundRecord {
  key: string;
  refundId: string;
  orderId: string;
  customer: string;
  date: string;
  status: "Processed" | "Processing";
  amount: number;
}

const FinancialLedgers: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [refunds, setRefunds] = useState<RefundRecord[]>([]);
  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [refundLoading, setRefundLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setTxLoading(true);
      try {
        const res = await getTransactions({ page: 1, limit: 10 });
        setTransactions(
          res.data.data.transactions.map((t) => ({
            key: t._id,
            txId: t.txId,
            orderId: t.orderId,
            customer: t.customer,
            date: formatDate(t.date),
            method: t.method,
            status: t.status,
            amount: t.amount,
          })),
        );
      } catch {
        message.error("Failed to load transactions.");
      } finally {
        setTxLoading(false);
      }
    })();

    (async () => {
      setRefundLoading(true);
      try {
        const res = await getRefunds({ page: 1, limit: 10 });
        setRefunds(
          res.data.data.refunds.map((r) => ({
            key: r.refundId,
            refundId: r.refundId,
            orderId: r.orderId,
            customer: r.customer,
            date: formatDate(r.date),
            status: r.status,
            amount: r.amount,
          })),
        );
      } catch {
        message.error("Failed to load refunds.");
      } finally {
        setRefundLoading(false);
      }
    })();
  }, []);

  // Shared routine layout helper splitting text identifiers across multiple rows
  const renderSplitOrderId = (id: string) => {
    const splitPoint = id.length > 5 ? 5 : 4;
    const line1 = id.substring(0, splitPoint);
    const line2 = id.substring(splitPoint);
    return (
      <span
        className="order-id-link fw-bold"
        onClick={() =>
          message.info(`Navigating to details track for order: ${id}`)
        }
      >
        {line1}
        <br />
        {line2}
      </span>
    );
  };

  // 3. Transactions Column Definitions Matrix
  const transactionColumns: ColumnsType<TransactionRecord> = [
    {
      title: "Transaction ID",
      dataIndex: "txId",
      key: "txId",
      render: (id) => <span className="ledger-id-txt text-muted">{id}</span>,
    },
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      render: renderSplitOrderId,
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      render: (text) => (
        <span className="ledger-user-txt text-dark fw-medium">{text}</span>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text) => (
        <span className="ledger-date-txt text-muted">{text}</span>
      ),
    },
    {
      title: "Payment Method",
      dataIndex: "method",
      key: "method",
      render: (text) => (
        <span className="ledger-method-txt text-secondary">{text}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: TransactionRecord["status"]) => {
        const styleClass =
          status === "Success" ? "pill-success" : "pill-pending";
        return <Tag className={`ledger-pill ${styleClass}`}>{status}</Tag>;
      },
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (val) => (
        <strong className="ledger-amount text-dark">
          ₹{val.toLocaleString("en-IN")}
        </strong>
      ),
    },
  ];

  // 4. Refunds Column Definitions Matrix
  const refundColumns: ColumnsType<RefundRecord> = [
    {
      title: "Refund ID",
      dataIndex: "refundId",
      key: "refundId",
      render: (id) => <span className="ledger-id-txt text-muted">{id}</span>,
    },
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      render: renderSplitOrderId,
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      render: (text) => (
        <span className="ledger-user-txt text-dark fw-medium">{text}</span>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text) => (
        <span className="ledger-date-txt text-muted">{text}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: RefundRecord["status"]) => {
        const styleClass =
          status === "Processed" ? "pill-processed" : "pill-processing";
        return <Tag className={`ledger-pill ${styleClass}`}>{status}</Tag>;
      },
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (val) => (
        <strong className="ledger-amount refund-negative">
          -₹{val.toLocaleString("en-IN")}
        </strong>
      ),
    },
  ];

  return (
    <div className="financial-ledgers-wrapper container-fluid p-0 d-flex flex-column gap-4 mt-4">
      {/* LEDGER BOARD A: Recent Transactions Data Card Grid Component */}
      <div className="ledger-surface-card bg-white border p-4 rounded-3">
        <h3 className="ledger-card-heading mb-4">Recent Transactions</h3>
        <Table
          columns={transactionColumns}
          dataSource={transactions}
          loading={txLoading}
          pagination={false}
          scroll={{ x: "max-content" }}
          className="custom-financial-table"
          //   responsive={true}
        />
      </div>

      {/* LEDGER BOARD B: Recent Refunds Data Card Grid Component */}
      <div className="ledger-surface-card bg-white border p-4 rounded-3">
        <h3 className="ledger-card-heading mb-4">Recent Refunds</h3>
        <Table
          columns={refundColumns}
          dataSource={refunds}
          loading={refundLoading}
          pagination={false}
          scroll={{ x: "max-content" }}
          className="custom-financial-table"
          //   responsive={true}
        />
      </div>
    </div>
  );
};

export default FinancialLedgers;
__RZP_EOF_7f3a__
echo "  ✓ src/pages/Revenue&Payments/RecentTransactionsAndRefunds.tsx"
mkdir -p 'src/pages/Revenue&Payments'
cat > 'src/pages/Revenue&Payments/RevenuePaymentsDashboard.tsx' <<'__RZP_EOF_7f3a__'
import React, { useEffect, useState } from "react";
import { Button, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import {
  getRevenueSummary,
  type RevenueSummary,
} from "../../services/revenueApi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import FinancialLedgers from "./RecentTransactionsAndRefunds";

// Register ChartJS elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

// TypeScript Interface schemas
interface MetricCard {
  id: number;
  title: string;
  value: string;
  subText: string;
  iconText: string;
  typeClass: "green" | "blue" | "orange" | "red";
}

const RevenuePaymentsDashboard: React.FC = () => {
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<RevenueSummary | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getRevenueSummary();
        setSummary(res.data.data);
      } catch {
        message.error("Failed to load revenue summary.");
      }
    })();
  }, []);

  const rupees = (n: number) => `₹${(n ?? 0).toLocaleString("en-IN")}`;

  // Telemetry metric summary cards populated from live revenue summary
  const metrics: MetricCard[] = [
    {
      id: 1,
      title: "Total Revenue",
      value: rupees(summary?.totalRevenue ?? 0),
      subText: "+12.5% from last month",
      iconText: "＄",
      typeClass: "green",
    },
    {
      id: 2,
      title: "This Month",
      value: rupees(summary?.thisMonthRevenue ?? 0),
      subText: `${summary?.thisMonthOrders ?? 0} orders`,
      iconText: "📈",
      typeClass: "blue",
    },
    {
      id: 3,
      title: "Pending Payments",
      value: rupees(summary?.pendingPayments ?? 0),
      subText: `${summary?.pendingPaymentsOrders ?? 0} orders`,
      iconText: "💳",
      typeClass: "orange",
    },
    {
      id: 4,
      title: "Refunds (Month)",
      value: rupees(summary?.refundsMonth ?? 0),
      subText: `${summary?.refundsCount ?? 0} refunds`,
      iconText: "🔄",
      typeClass: "red",
    },
  ];

  // Simulated export routine pipeline
  const handleExportReport = async () => {
    setExportLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      message.success(
        "Financial revenue summary report generated and ready for download!",
      );
    } catch {
      message.error("Export routine error, please verify session.");
    } finally {
      setExportLoading(false);
    }
  };

  // Derive labels + values from the live summary (fallback to empty)
  const revenueLabels = summary?.monthlyRevenue.map((p) => p.label) ?? [];
  const revenueValues = summary?.monthlyRevenue.map((p) => p.value) ?? [];
  const ordersLabels = summary?.monthlyOrders.map((p) => p.label) ?? [];
  const ordersValues = summary?.monthlyOrders.map((p) => p.count) ?? [];

  // Compute a clean y-axis max/step so live data isn't clipped
  const axisFor = (values: number[]) => {
    const raw = values.length ? Math.max(...values) : 0;
    const max = raw <= 0 ? 100 : Math.ceil(raw * 1.15);
    return { max, step: Math.max(1, Math.ceil(max / 4)) };
  };
  const revenueAxis = axisFor(revenueValues);
  const ordersAxis = axisFor(ordersValues);

  // 1. Monthly Revenue Trend Chart Config (Line Chart)
  const lineChartData = {
    labels: revenueLabels,
    datasets: [
      {
        label: "Revenue",
        data: revenueValues,
        borderColor: "#9333ea", // Purple line matching image line plot curve accent
        backgroundColor: "#9333ea",
        pointBorderColor: "#9333ea",
        pointBackgroundColor: "#ffffff",
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        tension: 0.35, // Smooth curve configuration
      },
    ],
  };

  // 2. Orders Trend Chart Config (Bar Chart)
  const barChartData = {
    labels: ordersLabels,
    datasets: [
      {
        label: "Orders Count",
        data: ordersValues,
        backgroundColor: "#e54394", // Pink theme tone from the image vertical column blocks
        borderRadius: 2,
        barThickness: 34,
      },
    ],
  };

  const chartOptions = (maxTicks: number, stepSize: number) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        min: 0,
        max: maxTicks,
        ticks: { stepSize, color: "#9ca3af", font: { size: 12 } },
        grid: { color: "#f3f4f6", drawTicks: false },
      },
      x: {
        ticks: { color: "#4b5563", font: { size: 13, weight: 500 } },
        grid: { display: false },
      },
    },
  });

  return (
    <div className="revenue-payments-panel container-fluid p-4">
      {/* SECTION A: Dashboard Heading Header Row Block */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <h1 className="main-panel-title mb-1">Revenue & Payments</h1>
          <p className="sub-panel-desc text-muted mb-0">
            Track revenue, payments and refunds
          </p>
        </div>
        <Button
          icon={<DownloadOutlined />}
          loading={exportLoading}
          onClick={handleExportReport}
          className="export-report-btn d-inline-flex align-items-center justify-content-center fw-semibold"
        >
          Export Report
        </Button>
      </div>

      {/* SECTION B: Core Metric Telemetry Counters Flex Row Grid */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-4 mb-4">
        {metrics.map((card) => (
          <div className="col" key={card.id}>
            <div className="telemetry-surface-card p-4 d-flex align-items-start gap-3 h-100">
              <div
                className={`icon-avatar-shell shell-${card.typeClass} d-flex align-items-center justify-content-center flex-shrink-0 fw-bold`}
              >
                {card.iconText}
              </div>
              <div className="data-stack flex-grow-1">
                <span className="card-lbl text-muted d-block mb-1">
                  {card.title}
                </span>
                <h2 className="card-numeric-value mb-1">{card.value}</h2>
                <span
                  className={`card-trend-footnote ${card.typeClass === "green" ? "trend-up-green" : ""}`}
                >
                  {card.subText}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION C: Graphical Analytics Trend Canvas Row Blocks */}
      <div className="row g-4">
        {/* Monthly Revenue Trend Line Wrapper Card */}
        <div className="col-12 col-xl-6">
          <div className="chart-analytics-card p-4 bg-white">
            <h3 className="chart-inner-title mb-4">Monthly Revenue Trend</h3>
            <div className="chart-canvas-box">
              <Line
                data={lineChartData}
                options={chartOptions(revenueAxis.max, revenueAxis.step)}
              />
            </div>
          </div>
        </div>

        {/* Orders Trend Column Bar Wrapper Card */}
        <div className="col-12 col-xl-6">
          <div className="chart-analytics-card p-4 bg-white">
            <h3 className="chart-inner-title mb-4">Orders Trend</h3>
            <div className="chart-canvas-box">
              <Bar
                data={barChartData}
                options={chartOptions(ordersAxis.max, ordersAxis.step)}
              />
            </div>
          </div>
        </div>
      </div>
      <FinancialLedgers />
    </div>
  );
};

export default RevenuePaymentsDashboard;
__RZP_EOF_7f3a__
echo "  ✓ src/pages/Revenue&Payments/RevenuePaymentsDashboard.tsx"
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
__RZP_EOF_7f3a__
echo "  ✓ src/services/orderApi.ts"
mkdir -p 'src/services'
cat > 'src/services/returnApi.ts' <<'__RZP_EOF_7f3a__'
import axiosInstance from "./axiosInstance";

export type ReturnStatus =
  | "pending"
  | "approved"
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

export const refundReturn = (
  id: string,
  body: { amount?: number; note?: string },
) => axiosInstance.post<ReturnDetailResponse>(`/returns/admin/${id}/refund`, body);
__RZP_EOF_7f3a__
echo "  ✓ src/services/returnApi.ts"
mkdir -p 'src/services'
cat > 'src/services/revenueApi.ts' <<'__RZP_EOF_7f3a__'
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

export const getTransactions = (params?: { page?: number; limit?: number }) =>
  axiosInstance.get<TransactionsResponse>(
    "/orders/admin/revenue/transactions",
    { params },
  );

export const getRefunds = (params?: { page?: number; limit?: number }) =>
  axiosInstance.get<RefundsResponse>("/orders/admin/revenue/refunds", {
    params,
  });
__RZP_EOF_7f3a__
echo "  ✓ src/services/revenueApi.ts"
echo
echo "Done — all files written."
