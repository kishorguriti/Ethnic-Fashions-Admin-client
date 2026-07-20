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

/**
 * Which statuses may legally follow the current one.
 *
 * The dropdown previously offered all ten values at every stage, so a delivered
 * order could be sent back to Pending and any order at all could be marked
 * Returned. The server now rejects the illegitimate ones; showing them as
 * disabled here means the operator understands the workflow instead of
 * discovering it through an error toast.
 *
 * The return_* states are deliberately unreachable from this dropdown — they are
 * driven by the Returns & Refunds screen, which is where the evidence lives.
 */
const ALLOWED_NEXT: Record<string, OrderStatus[]> = {
  pending:          ["confirmed", "processing", "cancelled"],
  confirmed:        ["processing", "shipped", "cancelled"],
  processing:       ["shipped", "cancelled"],
  shipped:          ["delivered"],
  delivered:        [],
  cancelled:        [],
  return_requested: [],
  return_approved:  ["returned"],
  return_received:  ["returned"],
  returned:         [],
};

// Why a given target is unavailable — shown in the dropdown so the rule is
// explained at the point of confusion.
const blockedReason = (current: string, target: OrderStatus): string => {
  if (target === current) return "Current status";
  if (target === "returned") {
    return "Approve the return under Returns & Refunds first";
  }
  if (["return_requested", "return_approved", "return_received"].includes(target)) {
    return "Managed from the Returns & Refunds screen";
  }
  if (["delivered", "cancelled", "returned"].includes(current)) {
    return `An order that is ${current} cannot change status`;
  }
  return "Not a valid next step from " + formatOrderStatus(current);
};

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
    {
      title: "Item",
      dataIndex: "name",
      key: "name",
      render: (name: string, r) => (
        <div className="d-flex align-items-center gap-2">
          {r.image ? (
            <img
              src={r.image}
              alt=""
              style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6 }}
            />
          ) : null}
          <span>{name}</span>
        </div>
      ),
    },
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
              <div className="order-status-select-wrap" style={{ minWidth: 280 }}>
                <label className="text-muted d-block mb-1">Update Status</label>
                <Select
                  value={statusValue}
                  onChange={(v) => setStatusValue(v)}
                  style={{ width: "100%" }}
                  popupMatchSelectWidth={false}
                  listHeight={340}
                  optionLabelProp="label"
                  options={STATUS_OPTIONS.map((opt) => {
                    const allowed =
                      opt.value === order.status ||
                      (ALLOWED_NEXT[order.status] ?? []).includes(opt.value);
                    return {
                      value: opt.value,
                      label: opt.label,
                      disabled: !allowed,
                      title: allowed ? opt.label : blockedReason(order.status, opt.value),
                    };
                  })}
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

            {/* Makes the next legal step explicit rather than something to guess at. */}
            <div className="order-flow-hint text-muted small mt-2">
              {(() => {
                const next = ALLOWED_NEXT[order.status] ?? [];
                if (order.status === "return_requested") {
                  return "A return has been requested — approve or reject it under Returns & Refunds.";
                }
                if (!next.length) {
                  return `${formatOrderStatus(order.status)} is a final state — no further status changes are possible.`;
                }
                return `Next step: ${next.map(formatOrderStatus).join(" or ")}.`;
              })()}
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
