#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Admin client fixes
# Run FROM THE ADMIN PROJECT ROOT:  bash update-2-admin-fixes.sh
# Idempotent; does not touch node_modules.
#
# Requires the server script (update-1-server-fixes.sh) to be applied first —
# it provides the return images, transaction search, profile and forgot-password
# endpoints this UI calls.
#
# Covers:
#   • Return approval now shows BOTH the catalogue photos and the customer's
#     uploaded evidence photos, instead of approving blind.
#   • Order status dropdown widened, and it now only offers legal next steps —
#     'Returned' is unselectable without an approved return request.
#   • Recent Transactions gets search + pagination.
#   • Admin My Profile page (the menu item was a no-op).
#   • Forgot password (the link was dead).
#   • No success toast on login.
#   • Logo: Ethnic Style.svg in the sidebar.
#   • Return period as a dropdown (7 / 14 / 20 / custom) + max qty per order.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

if [ ! -f "package.json" ] || [ ! -d "src/pages" ]; then
  echo "✖ This does not look like the admin project root (expected package.json + src/pages)."
  echo "  cd into Ethnic-Fashions-Admin-client-Develop and re-run."
  exit 1
fi

echo "Applying admin client changes in: $(pwd)"
echo

BACKUP_DIR=".admin-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
for f in \
  src/services/returnApi.ts \
  src/services/revenueApi.ts \
  src/services/adminApi.ts \
  'src/pages/Returns&Refunds/ReturnsRefundsSummary.tsx' \
  src/pages/Orders/OrderDetailModal.tsx \
  'src/pages/Revenue&Payments/RecentTransactionsAndRefunds.tsx' \
  src/pages/Product/AddNewProduct.tsx \
  src/auth/Login.tsx \
  src/auth/authAPI.ts \
  src/routes/index.tsx \
  src/layout/AdminLayout.tsx \
  src/layout/Sidebar.tsx
do
  if [ -f "$f" ]; then
    mkdir -p "$BACKUP_DIR/$(dirname "$f")"
    cp "$f" "$BACKUP_DIR/$f"
  fi
done
rm -f .update-skipped.log
echo "→ Backed up modified files to $BACKUP_DIR/"
echo

# ─────────────────────────────────────────────────────────────────────────────
# 1. returnApi — carry the customer's evidence photos
# ─────────────────────────────────────────────────────────────────────────────
echo "→ src/services/returnApi.ts"
node - <<'__ADM_EOF__'
const fs = require('fs');
const p = 'src/services/returnApi.ts';
let s = fs.readFileSync(p, 'utf8');
if (s.includes('customerImages')) { console.log('   already patched — skipping'); process.exit(0); }

const anchor = `  reasonText?: string;
  type: "return" | "exchange";`;
if (!s.includes(anchor)) { console.error(`   ⚠ SKIPPED: ${p} — anchor not found, file left unchanged`); process.exit(0); }

s = s.replace(anchor, `  reasonText?: string;
  /** Photos the customer attached as evidence (Cloudinary URLs). */
  customerImages?: string[];
  type: "return" | "exchange";`);

fs.writeFileSync(p, s);
console.log('   patched');
__ADM_EOF__

# ─────────────────────────────────────────────────────────────────────────────
# 2. Returns & Refunds — review returns with the photos in front of you
# ─────────────────────────────────────────────────────────────────────────────
echo "→ src/pages/Returns&Refunds/ReturnsRefundsSummary.tsx"
cat > 'src/pages/Returns&Refunds/ReturnsRefundsSummary.tsx' <<'__ADM_EOF__'
import React, { useCallback, useEffect, useState } from "react";
import {
  Table, Input, Tag, Button, message, Modal, Descriptions, Divider,
  InputNumber, Form, Image, Empty, Alert,
} from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  PictureOutlined,
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

/**
 * The evidence panel — the whole point of the returns screen.
 *
 * Approving a "damaged on arrival" claim is a judgement call, and it cannot be
 * made from a text label alone. This puts the two sets of photos side by side:
 * what the catalogue promised, and what the customer says arrived.
 */
const ReturnEvidence: React.FC<{ data: AdminReturn }> = ({ data }) => {
  const customerImages = data.customerImages ?? [];

  return (
    <div className="return-evidence">
      <div className="evidence-block mb-3">
        <div className="evidence-heading d-flex align-items-center gap-2 mb-2">
          <PictureOutlined />
          <span className="fw-semibold">Product as listed</span>
          <span className="text-muted small">({data.items.length} item{data.items.length === 1 ? "" : "s"})</span>
        </div>

        <Image.PreviewGroup>
          <div className="evidence-item-list d-flex flex-column gap-2">
            {data.items.map((it, idx) => (
              <div key={idx} className="evidence-item d-flex align-items-center gap-3 p-2 rounded-3 border">
                {it.image ? (
                  <Image
                    src={it.image}
                    alt={it.name}
                    width={56}
                    height={56}
                    className="evidence-thumb"
                    style={{ objectFit: "cover", borderRadius: 8 }}
                  />
                ) : (
                  <div className="evidence-thumb-empty d-flex align-items-center justify-content-center">
                    <PictureOutlined className="text-muted" />
                  </div>
                )}
                <div className="flex-grow-1">
                  <div className="fw-medium">{it.name}</div>
                  <div className="text-muted small">
                    {[it.color, it.size].filter(Boolean).join(" / ") || "—"} · Qty {it.quantity}
                  </div>
                </div>
                <strong>{money(it.lineTotal)}</strong>
              </div>
            ))}
          </div>
        </Image.PreviewGroup>
      </div>

      <div className="evidence-block">
        <div className="evidence-heading d-flex align-items-center gap-2 mb-2">
          <PictureOutlined />
          <span className="fw-semibold">Photos from the customer</span>
          <span className="text-muted small">({customerImages.length})</span>
        </div>

        {customerImages.length ? (
          <Image.PreviewGroup>
            <div className="evidence-customer-grid d-flex flex-wrap gap-2">
              {customerImages.map((url, idx) => (
                <Image
                  key={idx}
                  src={url}
                  alt={`Customer photo ${idx + 1}`}
                  width={96}
                  height={96}
                  style={{ objectFit: "cover", borderRadius: 10 }}
                />
              ))}
            </div>
          </Image.PreviewGroup>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="The customer did not attach any photos"
            className="evidence-empty py-2 m-0"
          />
        )}
      </div>

      {data.reasonText && (
        <>
          <Divider className="my-3" />
          <div className="evidence-note">
            <div className="text-muted small mb-1">Customer's note</div>
            <div className="evidence-note-body p-3 rounded-3">{data.reasonText}</div>
          </div>
        </>
      )}
    </div>
  );
};

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

  // Review modal — approve or reject, with the evidence visible.
  const [review, setReview] = useState<{ data: AdminReturn; mode: "approve" | "reject" } | null>(null);
  const [reviewLoading, setReviewLoading] = useState<boolean>(false);
  const [reviewNote, setReviewNote] = useState<string>("");

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

  const openReview = (data: AdminReturn, mode: "approve" | "reject") => {
    setReviewNote("");
    setReview({ data, mode });
  };

  const submitReview = async () => {
    if (!review) return;
    const { data, mode } = review;
    setReviewLoading(true);
    try {
      if (mode === "approve") {
        await approveReturn(data._id, reviewNote || undefined);
        message.success(`Request ${data.returnNumber} has been approved.`);
      } else {
        await rejectReturn(data._id, reviewNote || undefined);
        message.warning(`Request ${data.returnNumber} has been rejected.`);
      }
      setReview(null);
      refreshAll();
    } catch (err: any) {
      message.error(err?.response?.data?.message || `Failed to ${mode} return.`);
    } finally {
      setReviewLoading(false);
    }
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
    setRefundTarget(record.raw);
    refundForm.setFieldsValue({ amount: record.amount });
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
    {
      // Thumbnail in the row, so the list itself is scannable.
      title: "Product", dataIndex: "product", key: "product",
      render: (text, record) => (
        <div className="d-flex align-items-center gap-2">
          {record.raw.items?.[0]?.image ? (
            <img
              src={record.raw.items[0].image}
              alt=""
              className="row-thumb"
              style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 6 }}
            />
          ) : null}
          <span className="product-txt text-secondary">{text}</span>
          {(record.raw.customerImages?.length ?? 0) > 0 && (
            <Tag className="evidence-flag" title="Customer attached photos">
              <PictureOutlined /> {record.raw.customerImages!.length}
            </Tag>
          )}
        </div>
      ),
    },
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
                onClick={() => openReview(record.raw, "approve")}
              >
                Review
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                className="btn-action-reject d-inline-flex align-items-center gap-1"
                onClick={() => openReview(record.raw, "reject")}
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
            placeholder="Search by return ID, order ID or customer..."
            prefix={<SearchOutlined className="search-icon-dimmed" />}
            className="search-input-field"
            allowClear
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

      {/* Review modal — approve / reject with the evidence in view */}
      <Modal
        open={!!review}
        title={
          review
            ? `${review.mode === "approve" ? "Approve" : "Reject"} return — ${review.data.returnNumber}`
            : ""
        }
        width={720}
        okText={review?.mode === "approve" ? "Approve return" : "Reject return"}
        okButtonProps={{ danger: review?.mode === "reject", loading: reviewLoading }}
        onOk={submitReview}
        onCancel={() => setReview(null)}
        destroyOnHidden
        className="return-review-modal"
      >
        {review && (
          <div className="return-review-body">
            <Descriptions size="small" column={2} className="mb-3" items={[
              { key: "order", label: "Order", children: review.data.orderNumber },
              { key: "customer", label: "Customer", children: review.data.customerName },
              { key: "reason", label: "Reason", children: <Tag>{review.data.reason}</Tag> },
              { key: "amount", label: "Refund amount", children: <strong>{money(review.data.amount)}</strong> },
            ]} />

            <ReturnEvidence data={review.data} />

            <Divider className="my-3" />

            {review.mode === "approve" ? (
              <Alert
                type="info"
                showIcon
                className="mb-3"
                message="Approving does not move any money"
                description="This marks the request approved so the customer can ship the item back. The refund is a separate step: mark the product received, then Process Refund."
              />
            ) : (
              <Alert
                type="warning"
                showIcon
                className="mb-3"
                message="The order returns to Delivered"
                description="The customer may submit a new request while the return window is still open."
              />
            )}

            <label className="text-muted d-block mb-1">
              Note to the customer {review.mode === "reject" ? "(recommended)" : "(optional)"}
            </label>
            <Input.TextArea
              rows={3}
              maxLength={500}
              showCount
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder={
                review.mode === "approve"
                  ? "e.g. Approved — please ship the item back within 7 days"
                  : "e.g. The photos show normal wear rather than a manufacturing defect"
              }
            />
          </div>
        )}
      </Modal>

      {/* Detail modal */}
      <Modal
        open={!!detail}
        title={detail ? `Return ${detail.returnNumber}` : "Return details"}
        footer={null}
        onCancel={() => setDetail(null)}
        width={720}
        destroyOnHidden
        className="return-detail-modal"
      >
        {detail && (
          <>
            <Descriptions size="small" column={2} bordered className="mb-3" items={[
              { key: "order", label: "Order", children: detail.orderNumber },
              { key: "customer", label: "Customer", children: detail.customerName },
              { key: "reason", label: "Reason", children: detail.reason },
              { key: "type", label: "Type", children: detail.type },
              { key: "status", label: "Status", children: <Tag className={`return-status-pill ${statusDisplay(detail).cls}`}>{statusDisplay(detail).label}</Tag> },
              { key: "amount", label: "Amount", children: money(detail.amount) },
              ...(detail.adminNote ? [{ key: "adminNote", label: "Admin note", span: 2, children: detail.adminNote }] : []),
              ...(detail.refund?.at ? [{ key: "refund", label: "Refund", span: 2, children: `${money(detail.refund.amount || 0)} via ${detail.refund.method}${detail.refund.razorpayRefundId ? ` (${detail.refund.razorpayRefundId})` : ""}` }] : []),
            ]} />

            <ReturnEvidence data={detail} />
          </>
        )}
      </Modal>

      {/* Refund modal */}
      <Modal
        open={!!refundTarget}
        title={refundTarget ? `Process Refund — ${refundTarget.returnNumber}` : "Process Refund"}
        okText="Send refund"
        okButtonProps={{ danger: true, loading: refundLoading }}
        onCancel={() => { setRefundTarget(null); refundForm.resetFields(); }}
        onOk={handleProcessRefund}
        destroyOnHidden
      >
        <Alert
          type="info"
          showIcon
          className="mb-3"
          message="This sends a real refund to Razorpay"
          description="The amount is credited to the customer's original payment method. Until this step runs, no money has moved — approving a return alone does not refund anything."
        />
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
__ADM_EOF__
echo "   written"

# ─────────────────────────────────────────────────────────────────────────────
# 3. Order detail — wider status dropdown, and only legal next steps
# ─────────────────────────────────────────────────────────────────────────────
echo "→ src/pages/Orders/OrderDetailModal.tsx (status flow)"
node - <<'__ADM_EOF__'
const fs = require('fs');
const p = 'src/pages/Orders/OrderDetailModal.tsx';
let s = fs.readFileSync(p, 'utf8');
if (s.includes('ALLOWED_NEXT')) { console.log('   already patched — skipping'); process.exit(0); }

const fail = (n) => { console.error(`   ⚠ SKIPPED: anchor not found: ${n}`); process.exit(0); };
const edits = [];
const edit = (name, from, to) => edits.push({ name, from, to });

// ── The transition map ──────────────────────────────────────────────────────
edit('status flow map',
`const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
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
];`,
`const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
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
    return \`An order that is \${current} cannot change status\`;
  }
  return "Not a valid next step from " + formatOrderStatus(current);
};`);

// ── Item thumbnails ─────────────────────────────────────────────────────────
edit('item thumbnails',
`  const itemColumns: ColumnsType<OrderItem> = [
    { title: "Item", dataIndex: "name", key: "name" },`,
`  const itemColumns: ColumnsType<OrderItem> = [
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
    },`);

// ── The dropdown itself ─────────────────────────────────────────────────────
edit('status control',
`            {/* Status update control */}
            <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-end gap-2">
              <div style={{ minWidth: 180 }}>
                <label className="text-muted d-block mb-1">Update Status</label>
                <Select
                  value={statusValue}
                  onChange={(v) => setStatusValue(v)}
                  options={STATUS_OPTIONS}
                  style={{ width: "100%" }}
                />
              </div>`,
`            {/* Status update control */}
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
              </div>`);

// ── Explain the current position in the flow ────────────────────────────────
edit('flow hint',
`              {canRefund && (
                <Button danger onClick={() => setRefundOpen(true)}>
                  Process Refund
                </Button>
              )}
            </div>`,
`              {canRefund && (
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
                  return \`\${formatOrderStatus(order.status)} is a final state — no further status changes are possible.\`;
                }
                return \`Next step: \${next.map(formatOrderStatus).join(" or ")}.\`;
              })()}
            </div>`);

for (const e of edits) if (!s.includes(e.from)) fail(e.name);
for (const e of edits) s = s.replace(e.from, e.to);

fs.writeFileSync(p, s);
console.log(`   patched (${edits.length} edits)`);
__ADM_EOF__

# ─────────────────────────────────────────────────────────────────────────────
# 4. Transactions — search + pagination
# ─────────────────────────────────────────────────────────────────────────────
echo "→ src/services/revenueApi.ts (search params)"
node - <<'__ADM_EOF__'
const fs = require('fs');
const p = 'src/services/revenueApi.ts';
let s = fs.readFileSync(p, 'utf8');
if (s.includes('search?: string')) { console.log('   already patched — skipping'); process.exit(0); }

const anchor = `export const getTransactions = (params?: { page?: number; limit?: number }) =>`;
if (!s.includes(anchor)) { console.error(`   ⚠ SKIPPED: ${p} — anchor not found, file left unchanged`); process.exit(0); }

s = s.replace(anchor, `export const getTransactions = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  method?: string;
  status?: string;
  from?: string;
  to?: string;
}) =>`);

fs.writeFileSync(p, s);
console.log('   patched');
__ADM_EOF__

echo "→ src/pages/Revenue&Payments/RecentTransactionsAndRefunds.tsx (search)"
node - <<'__ADM_EOF__'
const fs = require('fs');
const p = 'src/pages/Revenue&Payments/RecentTransactionsAndRefunds.tsx';
let s = fs.readFileSync(p, 'utf8');
if (s.includes('txSearch')) { console.log('   already patched — skipping'); process.exit(0); }

const fail = (n) => { console.error(`   ⚠ SKIPPED: anchor not found: ${n}`); process.exit(0); };
const edits = [];
const edit = (name, from, to) => edits.push({ name, from, to });

edit('imports',
`import React, { useEffect, useState } from "react";
import { Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";`,
`import React, { useCallback, useEffect, useState } from "react";
import { Table, Tag, message, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";`);

// Replace the fire-once effect with searchable, paginated loaders.
edit('loaders',
`  useEffect(() => {
    (async () => {
      setTxLoading(true);
      try {
        const res = await getTransactions({ page: 1, limit: 10 });`,
`  // Debounced so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => { setTxSearchDebounced(txSearch); setTxPage(1); }, 350);
    return () => clearTimeout(t);
  }, [txSearch]);

  const loadTransactions = useCallback(async () => {
      setTxLoading(true);
      try {
        const res = await getTransactions({
          page: txPage,
          limit: PAGE_SIZE,
          search: txSearchDebounced || undefined,
        });
        setTxTotal(res.data.data.total);`);

edit('tx mapping tail',
`      } catch {
        message.error("Failed to load transactions.");
      } finally {
        setTxLoading(false);
      }
    })();

    (async () => {
      setRefundLoading(true);
      try {
        const res = await getRefunds({ page: 1, limit: 10 });`,
`      } catch {
        message.error("Failed to load transactions.");
      } finally {
        setTxLoading(false);
      }
  }, [txPage, txSearchDebounced]);

  const loadRefunds = useCallback(async () => {
      setRefundLoading(true);
      try {
        const res = await getRefunds({ page: refundPage, limit: PAGE_SIZE });
        setRefundTotal(res.data.data.total);`);

edit('refund mapping tail',
`      } catch {
        message.error("Failed to load refunds.");
      } finally {
        setRefundLoading(false);
      }
    })();
  }, []);`,
`      } catch {
        message.error("Failed to load refunds.");
      } finally {
        setRefundLoading(false);
      }
  }, [refundPage]);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);
  useEffect(() => { loadRefunds(); }, [loadRefunds]);`);

edit('state',
`  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [refundLoading, setRefundLoading] = useState<boolean>(false);`,
`  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [refundLoading, setRefundLoading] = useState<boolean>(false);

  const [txSearch, setTxSearch] = useState<string>("");
  const [txSearchDebounced, setTxSearchDebounced] = useState<string>("");
  const [txPage, setTxPage] = useState<number>(1);
  const [txTotal, setTxTotal] = useState<number>(0);
  const [refundPage, setRefundPage] = useState<number>(1);
  const [refundTotal, setRefundTotal] = useState<number>(0);`);

edit('tx table',
`      <div className="ledger-surface-card bg-white border p-4 rounded-3">
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
      </div>`,
`      <div className="ledger-surface-card bg-white border p-4 rounded-3">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
          <h3 className="ledger-card-heading mb-0">Recent Transactions</h3>
          <Input
            placeholder="Search order, customer, phone or payment ID..."
            prefix={<SearchOutlined className="text-muted" />}
            allowClear
            value={txSearch}
            onChange={(e) => setTxSearch(e.target.value)}
            className="ledger-search-input"
            style={{ maxWidth: 340 }}
          />
        </div>
        <Table
          columns={transactionColumns}
          dataSource={transactions}
          loading={txLoading}
          pagination={{
            current: txPage,
            total: txTotal,
            pageSize: PAGE_SIZE,
            showSizeChanger: false,
            onChange: (page) => setTxPage(page),
          }}
          scroll={{ x: "max-content" }}
          className="custom-financial-table"
        />
      </div>`);

edit('refund table',
`        <Table
          columns={refundColumns}
          dataSource={refunds}
          loading={refundLoading}
          pagination={false}
          scroll={{ x: "max-content" }}
          className="custom-financial-table"
          //   responsive={true}
        />`,
`        <Table
          columns={refundColumns}
          dataSource={refunds}
          loading={refundLoading}
          pagination={{
            current: refundPage,
            total: refundTotal,
            pageSize: PAGE_SIZE,
            showSizeChanger: false,
            onChange: (page) => setRefundPage(page),
          }}
          scroll={{ x: "max-content" }}
          className="custom-financial-table"
        />`);

edit('page size const',
`const FinancialLedgers: React.FC = () => {`,
`const PAGE_SIZE = 10;

const FinancialLedgers: React.FC = () => {`);

for (const e of edits) if (!s.includes(e.from)) fail(e.name);
for (const e of edits) s = s.replace(e.from, e.to);

fs.writeFileSync(p, s);
console.log(`   patched (${edits.length} edits)`);
__ADM_EOF__

# ─────────────────────────────────────────────────────────────────────────────
# 5. Login — no success toast, working forgot-password link
# ─────────────────────────────────────────────────────────────────────────────
echo "→ src/auth/Login.tsx"
node - <<'__ADM_EOF__'
const fs = require('fs');
const p = 'src/auth/Login.tsx';
let s = fs.readFileSync(p, 'utf8');
if (s.includes('/forgot-password')) { console.log('   already patched — skipping'); process.exit(0); }

// Both edits here are cosmetic/wiring. Matching on structure rather than exact
// text, and warning instead of aborting, so a reworded toast can't take down
// the rest of the run.
const notes = [];
const warn = (msg) => {
  notes.push(msg);
  fs.appendFileSync('.update-skipped.log', `src/auth/Login.tsx — ${msg}\n`);
};

// 1) Drop the success toast. Tolerant of wording, quote style and indentation —
//    the redirect into the dashboard is its own confirmation.
const toastRe = /^[ \t]*message\.success\(\s*["'`][^"'`]*[Ll]ogin[^"'`]*success[^"'`]*["'`]\s*\)\s*;?[ \t]*\r?\n/m;
if (toastRe.test(s)) {
  s = s.replace(toastRe, '');
  console.log('   · success toast removed');
} else {
  warn('login success toast not found (already removed, or worded differently)');
}

// 2) Point the dead "Forgot password?" link at the new page.
const linkRe = /<a\b[^>]*href=["']#forgot["'][\s\S]*?<\/a>/;
if (linkRe.test(s)) {
  s = s.replace(linkRe, '<Link to="/forgot-password" className="forgot-link">\n                Forgot password?\n              </Link>');
  console.log('   · forgot-password link wired');
} else {
  warn('the "Forgot password?" link was not found — point it at /forgot-password by hand');
}

// Ensure Link is imported, but only if we actually used it.
if (s.includes('<Link to="/forgot-password"') &&
    !/import\s*\{[^}]*\bLink\b[^}]*\}\s*from\s*["']react-router-dom["']/.test(s)) {
  const m = s.match(/import\s*\{([^}]*)\}\s*from\s*(["'])react-router-dom\2;/);
  if (m) {
    s = s.replace(m[0], `import { ${m[1].trim().replace(/,$/, '')}, Link } from "react-router-dom";`);
  } else {
    s = `import { Link } from "react-router-dom";\n` + s;
  }
}

fs.writeFileSync(p, s);
console.log(notes.length ? `   patched (${notes.length} item needs a manual look)` : '   patched');
__ADM_EOF__

echo "→ src/auth/authAPI.ts (reset endpoints)"
node - <<'__ADM_EOF__'
const fs = require('fs');
const p = 'src/auth/authAPI.ts';
let s = fs.readFileSync(p, 'utf8');
if (s.includes('forgotPasswordAPI')) { console.log('   already present — skipping'); process.exit(0); }

s += `
// ─── Forgot password ──────────────────────────────────────────────────────────

// Always resolves 200 regardless of whether the email exists — the server
// deliberately gives no signal either way, so the UI must not imply one.
export const forgotPasswordAPI = (email: string) =>
  axiosInstance.post<{ success: boolean; message: string }>(
    "/admin/forgot-password",
    { email },
  );

export const resetPasswordAPI = (data: {
  email: string;
  otp: string;
  newPassword: string;
}) =>
  axiosInstance.post<{ success: boolean; message: string }>(
    "/admin/reset-password",
    data,
  );
`;
fs.writeFileSync(p, s);
console.log('   added');
__ADM_EOF__

echo "→ src/auth/ForgotPassword.tsx"
cat > 'src/auth/ForgotPassword.tsx' <<'__ADM_EOF__'
import React, { useState } from "react";
import { Form, Input, Button, Alert, Steps, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { MailOutlined, LockOutlined, SafetyOutlined } from "@ant-design/icons";
import { forgotPasswordAPI, resetPasswordAPI } from "./authAPI";

/**
 * Two-step reset: request a code by email, then set a new password with it.
 *
 * The request step never reveals whether an address is registered — the server
 * returns the same response either way, and this screen mirrors that wording so
 * the UI doesn't leak what the API deliberately withholds.
 */
const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<0 | 1>(0);
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const requestCode = async (values: { email: string }) => {
    setLoading(true);
    setError("");
    try {
      await forgotPasswordAPI(values.email);
      setEmail(values.email);
      setStep(1);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not send the reset code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (values: { otp: string; newPassword: string; confirm: string }) => {
    setLoading(true);
    setError("");
    try {
      await resetPasswordAPI({ email, otp: values.otp, newPassword: values.newPassword });
      message.success("Password reset. Please sign in.");
      navigate("/login");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not reset the password. Check the code and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page d-flex align-items-center justify-content-center min-vh-100">
      <div className="forgot-card">
        <div className="forgot-card-header text-center mb-4">
          <h2 className="forgot-title mb-1">Reset your password</h2>
          <p className="text-muted mb-0">
            {step === 0
              ? "We'll email you a verification code"
              : `Enter the code sent to ${email}`}
          </p>
        </div>

        <Steps
          size="small"
          current={step}
          className="mb-4"
          items={[{ title: "Your email" }, { title: "New password" }]}
        />

        {error && <Alert message={error} type="error" showIcon className="mb-3" />}

        {step === 0 ? (
          <Form layout="vertical" onFinish={requestCode} requiredMark={false}>
            <Form.Item
              name="email"
              label="Email address"
              rules={[
                { required: true, message: "Enter your email address" },
                { type: "email", message: "Enter a valid email address" },
              ]}
            >
              <Input
                size="large"
                prefix={<MailOutlined className="text-muted" />}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </Form.Item>

            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              Send reset code
            </Button>
          </Form>
        ) : (
          <Form layout="vertical" onFinish={submitReset} requiredMark={false}>
            <Form.Item
              name="otp"
              label="Verification code"
              rules={[{ required: true, message: "Enter the code from your email" }]}
            >
              <Input
                size="large"
                prefix={<SafetyOutlined className="text-muted" />}
                placeholder="6-digit code"
                maxLength={6}
                autoComplete="one-time-code"
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="New password"
              rules={[
                { required: true, message: "Choose a new password" },
                { min: 8, message: "Use at least 8 characters" },
              ]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined className="text-muted" />}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="confirm"
              label="Confirm new password"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Re-enter the password" },
                ({ getFieldValue }) => ({
                  validator: (_, value) =>
                    !value || getFieldValue("newPassword") === value
                      ? Promise.resolve()
                      : Promise.reject(new Error("The two passwords do not match")),
                }),
              ]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined className="text-muted" />}
                placeholder="Re-enter the password"
                autoComplete="new-password"
              />
            </Form.Item>

            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              Reset password
            </Button>

            <Button type="link" block className="mt-2" onClick={() => { setStep(0); setError(""); }}>
              Use a different email
            </Button>
          </Form>
        )}

        <div className="text-center mt-3">
          <Link to="/login" className="back-to-login">← Back to sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
__ADM_EOF__
echo "   written"

# ─────────────────────────────────────────────────────────────────────────────
# 6. My Profile page
# ─────────────────────────────────────────────────────────────────────────────
echo "→ src/services/adminApi.ts (profile endpoints)"
node - <<'__ADM_EOF__'
const fs = require('fs');
const p = 'src/services/adminApi.ts';
let s = fs.readFileSync(p, 'utf8');
if (s.includes('getAdminProfile')) { console.log('   already present — skipping'); process.exit(0); }

s += `
// ─── My profile ───────────────────────────────────────────────────────────────

export interface AdminProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt?: string;
}

export const getAdminProfile = () =>
  axiosInstance.get<{ success: boolean; data: { admin: AdminProfile } }>(
    "/admin/profile",
  );

export const updateAdminProfile = (data: {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}) =>
  axiosInstance.patch<{ success: boolean; data: { admin: AdminProfile } }>(
    "/admin/profile",
    data,
  );

export const changeAdminPassword = (data: {
  currentPassword: string;
  newPassword: string;
}) =>
  axiosInstance.post<{ success: boolean; message: string }>(
    "/admin/profile/change-password",
    data,
  );
`;
fs.writeFileSync(p, s);
console.log('   added');
__ADM_EOF__

echo "→ src/pages/Profile/MyProfile.tsx"
mkdir -p 'src/pages/Profile'
cat > 'src/pages/Profile/MyProfile.tsx' <<'__ADM_EOF__'
import React, { useEffect, useState } from "react";
import { Form, Input, Button, Avatar, Tag, Skeleton, message, Divider } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  type AdminProfile,
} from "../../services/adminApi";

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  partner: "Partner",
};

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const MyProfile: React.FC = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [pwSaving, setPwSaving] = useState<boolean>(false);

  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAdminProfile();
      const p = res.data.data.admin;
      setProfile(p);
      profileForm.setFieldsValue({ name: p.name, phone: p.phone ?? "" });
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to load your profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const saveProfile = async (values: { name: string; phone?: string }) => {
    setSaving(true);
    try {
      const res = await updateAdminProfile({ name: values.name, phone: values.phone });
      setProfile(res.data.data.admin);
      message.success("Profile updated.");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (values: { currentPassword: string; newPassword: string }) => {
    setPwSaving(true);
    try {
      await changeAdminPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success("Password changed.");
      passwordForm.resetFields();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to change your password.");
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="my-profile-page container-fluid p-4">
      <div className="section-header-block mb-4">
        <h1 className="main-section-title mb-1">My Profile</h1>
        <p className="sub-section-desc text-muted mb-0">Manage your account details and password</p>
      </div>

      {loading ? (
        <div className="profile-surface-card p-4 bg-white border rounded-3">
          <Skeleton active avatar paragraph={{ rows: 6 }} />
        </div>
      ) : (
        <div className="row g-4">
          {/* Identity summary */}
          <div className="col-12 col-xl-4">
            <div className="profile-surface-card p-4 bg-white border rounded-3 h-100 text-center">
              <Avatar
                size={96}
                src={profile?.avatarUrl || undefined}
                icon={<UserOutlined />}
                className="profile-avatar mb-3"
              />
              <h4 className="profile-name mb-1">{profile?.name || "—"}</h4>
              <div className="text-muted mb-2">{profile?.email}</div>
              <Tag className="profile-role-pill">{ROLE_LABEL[profile?.role ?? ""] || profile?.role}</Tag>

              <Divider className="my-3" />

              <div className="profile-meta text-start small">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Last signed in</span>
                  <span>{fmtDate(profile?.lastLoginAt)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Account created</span>
                  <span>{fmtDate(profile?.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Editable details */}
          <div className="col-12 col-xl-8">
            <div className="profile-surface-card p-4 bg-white border rounded-3 mb-4">
              <h5 className="profile-block-title mb-3">Account details</h5>
              <Form form={profileForm} layout="vertical" onFinish={saveProfile} requiredMark={false}>
                <div className="row">
                  <div className="col-12 col-md-6">
                    <Form.Item
                      name="name"
                      label="Full name"
                      rules={[{ required: true, message: "Enter your name" }, { min: 2, message: "At least 2 characters" }]}
                    >
                      <Input size="large" prefix={<UserOutlined className="text-muted" />} placeholder="Your name" />
                    </Form.Item>
                  </div>
                  <div className="col-12 col-md-6">
                    <Form.Item name="phone" label="Phone">
                      <Input size="large" prefix={<PhoneOutlined className="text-muted" />} placeholder="Optional" />
                    </Form.Item>
                  </div>
                </div>

                <Form.Item label="Email">
                  {/* Email identifies the account and keys the login OTP, so it is
                      not editable here — a super admin must change it. */}
                  <Input
                    size="large"
                    prefix={<MailOutlined className="text-muted" />}
                    value={profile?.email}
                    disabled
                  />
                </Form.Item>

                <Button type="primary" htmlType="submit" loading={saving}>
                  Save changes
                </Button>
              </Form>
            </div>

            <div className="profile-surface-card p-4 bg-white border rounded-3">
              <h5 className="profile-block-title mb-3">Change password</h5>
              <Form form={passwordForm} layout="vertical" onFinish={savePassword} requiredMark={false}>
                <Form.Item
                  name="currentPassword"
                  label="Current password"
                  rules={[{ required: true, message: "Enter your current password" }]}
                >
                  <Input.Password size="large" prefix={<LockOutlined className="text-muted" />} autoComplete="current-password" />
                </Form.Item>

                <div className="row">
                  <div className="col-12 col-md-6">
                    <Form.Item
                      name="newPassword"
                      label="New password"
                      rules={[
                        { required: true, message: "Choose a new password" },
                        { min: 8, message: "Use at least 8 characters" },
                      ]}
                    >
                      <Input.Password size="large" prefix={<LockOutlined className="text-muted" />} autoComplete="new-password" />
                    </Form.Item>
                  </div>
                  <div className="col-12 col-md-6">
                    <Form.Item
                      name="confirm"
                      label="Confirm new password"
                      dependencies={["newPassword"]}
                      rules={[
                        { required: true, message: "Re-enter the new password" },
                        ({ getFieldValue }) => ({
                          validator: (_, value) =>
                            !value || getFieldValue("newPassword") === value
                              ? Promise.resolve()
                              : Promise.reject(new Error("The two passwords do not match")),
                        }),
                      ]}
                    >
                      <Input.Password size="large" prefix={<LockOutlined className="text-muted" />} autoComplete="new-password" />
                    </Form.Item>
                  </div>
                </div>

                <Button type="primary" htmlType="submit" loading={pwSaving}>
                  Change password
                </Button>
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
__ADM_EOF__
echo "   written"

# ─────────────────────────────────────────────────────────────────────────────
# 7. Routes, profile menu wiring, and the logo
# ─────────────────────────────────────────────────────────────────────────────
echo "→ src/routes/index.tsx"
node - <<'__ADM_EOF__'
const fs = require('fs');
const p = 'src/routes/index.tsx';
let s = fs.readFileSync(p, 'utf8');
if (s.includes('MyProfile')) { console.log('   already patched — skipping'); process.exit(0); }

const fail = (n) => { console.error(`   ⚠ SKIPPED: anchor not found: ${n}`); process.exit(0); };
const edits = [
  [`import Login from "../auth/Login";`,
   `import Login from "../auth/Login";
import ForgotPassword from "../auth/ForgotPassword";
import MyProfile from "../pages/Profile/MyProfile";`],
  [`          <Route path="settings" element={<StoreSettings />} />`,
   `          <Route path="settings" element={<StoreSettings />} />
          <Route path="profile" element={<MyProfile />} />`],
  [`      <Route path="/login" element={<Login />} />`,
   `      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />`],
];

for (const [from] of edits) if (!s.includes(from)) fail(from.slice(0, 40));
for (const [from, to] of edits) s = s.replace(from, to);

fs.writeFileSync(p, s);
console.log('   patched');
__ADM_EOF__

echo "→ src/layout/AdminLayout.tsx (My Profile menu)"
node - <<'__ADM_EOF__'
const fs = require('fs');
const p = 'src/layout/AdminLayout.tsx';
let s = fs.readFileSync(p, 'utf8');
if (s.includes('navigate("/profile")') || s.includes("navigate('/profile')")) {
  console.log('   already patched — skipping'); process.exit(0);
}

// "My Profile" fell through every branch and did nothing. Rather than matching
// the whole handler body — which differs between copies — insert a profile
// branch ahead of the logout check, whichever shape that check takes.
const logoutRe = /if\s*\(\s*key\s*===\s*["']logout["']\s*\)\s*\{/;

if (logoutRe.test(s)) {
  s = s.replace(logoutRe, (m) =>
    `if (key === "profile") {\n        navigate("/profile");\n        return;\n      }\n      ${m}`);
  // Cosmetic: this pointed at the STORE settings page, which is a different thing.
  s = s.replace(/\{\s*key:\s*["']settings["'],\s*label:\s*["']Account Settings["']\s*\}/,
                '{ key: "settings", label: "Store Settings" }');
  fs.writeFileSync(p, s);
  console.log('   patched');
} else {
  fs.appendFileSync('.update-skipped.log',
    'src/layout/AdminLayout.tsx — could not find the menu\'s logout branch; wire "My Profile" to navigate("/profile") by hand\n');
  console.warn('   ⚠ SKIPPED: could not find the menu handler — file left unchanged');
  console.warn('     Wire the "profile" menu key to navigate("/profile") by hand.');
}
__ADM_EOF__

echo "→ src/layout/Sidebar.tsx (logo)"
node - <<'__ADM_EOF__'
const fs = require('fs');
const p = 'src/layout/Sidebar.tsx';
let s = fs.readFileSync(p, 'utf8');
if (s.includes('EthnicStyleLogo')) { console.log('   already patched — skipping'); process.exit(0); }

const from = `          <div className="brand-logo-group d-flex align-items-center gap-2">
            <div className="brand-gradient-dot" />
            <span className="brand-title-text">Ethnic Fashion</span>
          </div>`;
const to = `          <div className="brand-logo-group d-flex align-items-center gap-2">
            <img src={EthnicStyleLogo} alt="Ethnic Fashion" className="brand-logo-img" />
          </div>`;

if (!s.includes(from)) { console.error(`   ⚠ SKIPPED: ${p} — anchor not found, file left unchanged`); process.exit(0); }
s = s.replace(from, to);

// Import the finalised brand mark. The file name contains a space, so the
// specifier must stay quoted exactly as-is.
const firstImport = s.match(/^import .*$/m);
s = s.replace(firstImport[0], `${firstImport[0]}\nimport EthnicStyleLogo from "../assets/svg/Ethnic Style.svg";`);

fs.writeFileSync(p, s);
console.log('   patched');
__ADM_EOF__

# ─────────────────────────────────────────────────────────────────────────────
# 8. Product form — return period dropdown + max qty per order
# ─────────────────────────────────────────────────────────────────────────────
echo "→ src/services/productApi.ts (maxQtyPerOrder)"
node - <<'__ADM_EOF__'
const fs = require('fs');
const p = 'src/services/productApi.ts';
let s = fs.readFileSync(p, 'utf8');
if (s.includes('maxQtyPerOrder')) { console.log('   already patched — skipping'); process.exit(0); }
if (!s.includes('returnPeriodDays')) { console.error('   ⚠ SKIPPED: returnPeriodDays not found'); process.exit(0); }

// Mirror the field everywhere returnPeriodDays is declared.
s = s.replace(/(\n(\s*)returnPeriodDays\??: number;)/g, '$1\n$2maxQtyPerOrder?: number;');

fs.writeFileSync(p, s);
console.log('   patched');
__ADM_EOF__

echo "→ src/pages/Product/AddNewProduct.tsx (return period dropdown)"
node - <<'__ADM_EOF__'
const fs = require('fs');
const p = 'src/pages/Product/AddNewProduct.tsx';
let s = fs.readFileSync(p, 'utf8');
if (s.includes('RETURN_PERIOD_PRESETS')) { console.log('   already patched — skipping'); process.exit(0); }

const fail = (n) => { console.error(`   ⚠ SKIPPED: anchor not found: ${n}`); process.exit(0); };

// ── The control itself ──────────────────────────────────────────────────────
const fieldFrom = `                  <div className="row">
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
                  </div>`;

const fieldTo = `                  <div className="row">
                    <div className="col-12 col-md-6">
                      <Form.Item
                        label="Return Period"
                        extra="Days after delivery a customer can request a return"
                      >
                        {/* The value lives in returnPeriodDays; this pair of
                            controls is just a friendlier way to set it. Anything
                            outside the presets flips it to a free-entry box. */}
                        <Form.Item
                          noStyle
                          shouldUpdate={(prev, cur) =>
                            prev.returnPeriodDays !== cur.returnPeriodDays
                          }
                        >
                          {() => {
                            const days = form.getFieldValue("returnPeriodDays") ?? 14;
                            const isPreset = RETURN_PERIOD_PRESETS.includes(days);
                            return (
                              <div className="d-flex gap-2">
                                <Select
                                  size="large"
                                  className="flex-grow-1"
                                  value={isPreset ? days : "custom"}
                                  onChange={(v) =>
                                    form.setFieldsValue({
                                      returnPeriodDays: v === "custom" ? 0 : Number(v),
                                    })
                                  }
                                  options={[
                                    ...RETURN_PERIOD_PRESETS.map((d) => ({
                                      value: d,
                                      label: \`\${d} days\`,
                                    })),
                                    { value: "custom", label: "Custom…" },
                                  ]}
                                />
                                {!isPreset && (
                                  <InputNumber
                                    min={0}
                                    max={365}
                                    size="large"
                                    style={{ width: 150 }}
                                    value={days}
                                    addonAfter="days"
                                    onChange={(v) =>
                                      form.setFieldsValue({
                                        returnPeriodDays: Number(v ?? 0),
                                      })
                                    }
                                  />
                                )}
                              </div>
                            );
                          }}
                        </Form.Item>
                      </Form.Item>

                      {/* The real field — kept in the form, driven by the above. */}
                      <Form.Item name="returnPeriodDays" hidden>
                        <InputNumber />
                      </Form.Item>
                    </div>

                    <div className="col-12 col-md-6">
                      <Form.Item
                        label="Max quantity per order"
                        name="maxQtyPerOrder"
                        extra="Stops one buyer clearing the shelf. 0 uses the store-wide default."
                      >
                        <InputNumber
                          min={0}
                          max={1000}
                          placeholder="0"
                          className="custom-form-input w-100"
                          size="large"
                        />
                      </Form.Item>
                    </div>
                  </div>`;

if (!s.includes(fieldFrom)) fail('return period field');
s = s.replace(fieldFrom, fieldTo);

// ── Presets constant ────────────────────────────────────────────────────────
const compAnchor = s.match(/^const AddNewProduct[^\n]*$/m);
if (!compAnchor) fail('component declaration');
s = s.replace(compAnchor[0], `// Offered in the Return Period dropdown; anything else counts as "custom".
const RETURN_PERIOD_PRESETS: number[] = [7, 14, 20];

${compAnchor[0]}`);

// ── Carry the new field through the form's data flow ────────────────────────
s = s.replace(/(\n(\s*)returnPeriodDays\??: number;)/g, '$1\n$2maxQtyPerOrder?: number;');
s = s.replace(
  /returnPeriodDays: p\.returnPeriodDays \?\? 14,/g,
  'returnPeriodDays: p.returnPeriodDays ?? 14,\n          maxQtyPerOrder: p.maxQtyPerOrder ?? 0,'
);
s = s.replace(
  /returnPeriodDays: values\.returnPeriodDays \?\? 14,/g,
  'returnPeriodDays: values.returnPeriodDays ?? 14,\n          maxQtyPerOrder: values.maxQtyPerOrder ?? 0,'
);
s = s.replace(
  'initialValues={{ returnPeriodDays: 14 }}',
  'initialValues={{ returnPeriodDays: 14, maxQtyPerOrder: 0 }}'
);

// Select is used by the new control — make sure it is imported.
if (!/import\s*\{[^}]*\bSelect\b[^}]*\}\s*from\s*["']antd["']/.test(s)) {
  const m = s.match(/import\s*\{([^}]*)\}\s*from\s*(["'])antd\2;/);
  if (m) s = s.replace(m[0], `import {${m[1].replace(/\s*$/, '')}, Select } from "antd";`);
  else fail('antd import');
}

fs.writeFileSync(p, s);
console.log('   patched');
__ADM_EOF__

# ─────────────────────────────────────────────────────────────────────────────
# 9. Styles for the new/updated screens
# ─────────────────────────────────────────────────────────────────────────────
echo "→ src/styles/page-components/_adminFixes.scss"
cat > 'src/styles/page-components/_adminFixes.scss' <<'__ADM_EOF__'
// Styles for the screens added/reworked by update-2-admin-fixes.sh.

$af-primary: #8e2de2;
$af-border: #eef2f6;
$af-surface: #fafafa;
$af-muted: #6b7280;

// ─── Return review: evidence panel ──────────────────────────────────────────
.return-evidence {
  .evidence-heading {
    font-size: 0.9rem;
    color: #111827;
  }

  .evidence-item {
    background: $af-surface;
    border-color: $af-border !important;
    transition: border-color 0.2s ease;

    &:hover { border-color: rgba($af-primary, 0.35) !important; }
  }

  .evidence-thumb-empty {
    width: 56px;
    height: 56px;
    border-radius: 8px;
    background: #f0f0f0;
    flex-shrink: 0;
  }

  .evidence-customer-grid img { border: 1px solid $af-border; }

  .evidence-empty {
    background: $af-surface;
    border: 1px dashed #dfe3e8;
    border-radius: 12px;
  }

  .evidence-note-body {
    background: $af-surface;
    border: 1px solid $af-border;
    color: #374151;
    white-space: pre-wrap;
  }
}

.return-review-modal,
.return-detail-modal {
  .ant-modal-body { max-height: 68vh; overflow-y: auto; }
}

// Flags a row whose customer attached photos.
.evidence-flag {
  background: rgba($af-primary, 0.08);
  border-color: rgba($af-primary, 0.2);
  color: $af-primary;
  font-size: 0.72rem;
}

// ─── Orders: status dropdown ────────────────────────────────────────────────
.order-status-select-wrap {
  .ant-select-selector { min-height: 40px !important; }
}

.order-flow-hint {
  padding: 8px 12px;
  background: $af-surface;
  border: 1px solid $af-border;
  border-radius: 8px;
}

// ─── Transactions search ────────────────────────────────────────────────────
.ledger-search-input .ant-input-affix-wrapper,
.ledger-search-input { border-radius: 10px; }

// ─── My Profile ─────────────────────────────────────────────────────────────
.my-profile-page {
  .profile-surface-card {
    border-color: $af-border !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    border-radius: 16px !important;
  }

  .profile-avatar {
    background: linear-gradient(135deg, #a800e6 0%, #ff007f 100%);
  }

  .profile-name { font-weight: 600; }

  .profile-role-pill {
    background: rgba($af-primary, 0.08);
    border-color: rgba($af-primary, 0.2);
    color: $af-primary;
    border-radius: 999px;
    padding-inline: 12px;
  }

  .profile-block-title {
    font-weight: 600;
    color: #111827;
  }

  .profile-meta { color: #374151; }
}

// ─── Forgot password ────────────────────────────────────────────────────────
.forgot-password-page {
  background: linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%);
  padding: 24px;

  .forgot-card {
    width: 100%;
    max-width: 440px;
    background: #fff;
    border: 1px solid $af-border;
    border-radius: 20px;
    padding: 32px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  }

  .forgot-title {
    font-weight: 600;
    color: #111827;
  }

  .back-to-login {
    color: $af-muted;
    text-decoration: none;

    &:hover { color: $af-primary; }
  }
}

// ─── Sidebar brand mark ─────────────────────────────────────────────────────
.brand-logo-img {
  height: 30px;
  width: auto;
  max-width: 150px;
  object-fit: contain;
}
__ADM_EOF__

node - <<'__ADM_EOF__'
const fs = require('fs');
const p = 'src/styles/page-components/index.scss';
let s = fs.readFileSync(p, 'utf8');
if (s.includes('_adminFixes.scss')) { console.log('   already registered — skipping'); process.exit(0); }
// Matches the existing (non-idiomatic but consistent) @import url(...) style.
s = s.replace(/\s*$/, '\n') + `@import url('./_adminFixes.scss');\n`;
fs.writeFileSync(p, s);
console.log('   registered _adminFixes.scss');
__ADM_EOF__

# ─────────────────────────────────────────────────────────────────────────────
# 10. Store Settings — the store-wide return period + max qty defaults
# ─────────────────────────────────────────────────────────────────────────────
echo "→ src/services/adminApi.ts (settings defaults)"
node - <<'__ADM_EOF__'
const fs = require('fs');
const p = 'src/services/adminApi.ts';
let s = fs.readFileSync(p, 'utf8');
if (s.includes('defaultMaxQtyPerOrder')) { console.log('   already patched — skipping'); process.exit(0); }

const anchor = `export interface StoreSettings {
  storeName: string;
  tagline?: string;
  contactEmail?: string;
  contactPhone?: string;
  storeAddress?: string;
  logoUrl?: string;
}`;
if (!s.includes(anchor)) { console.error(`   ⚠ SKIPPED: ${p} — anchor not found, file left unchanged`); process.exit(0); }

s = s.replace(anchor, `export interface StoreSettings {
  storeName: string;
  tagline?: string;
  contactEmail?: string;
  contactPhone?: string;
  storeAddress?: string;
  logoUrl?: string;
  /** Applied to any product that has not set its own value. */
  defaultReturnPeriodDays?: number;
  defaultMaxQtyPerOrder?: number;
}`);

fs.writeFileSync(p, s);
console.log('   patched');
__ADM_EOF__

echo "→ src/pages/Settings.tsx (defaults section)"
node - <<'__ADM_EOF__'
const fs = require('fs');
const p = 'src/pages/Settings.tsx';
let s = fs.readFileSync(p, 'utf8');
if (s.includes('defaultMaxQtyPerOrder')) { console.log('   already patched — skipping'); process.exit(0); }

const fail = (n) => { console.error(`   ⚠ SKIPPED: anchor not found: ${n}`); process.exit(0); };
const edits = [];
const edit = (name, from, to) => edits.push({ name, from, to });

edit('imports',
`import { Form, Input, Button, Upload, message } from 'antd';`,
`import { Form, Input, Button, Upload, message, Select, InputNumber } from 'antd';`);

edit('form values type',
`interface StoreSettingsFormValues {
  storeName: string;
  tagline?: string;
  contactEmail: string;
  contactPhone: string;
  storeAddress?: string;
}`,
`interface StoreSettingsFormValues {
  storeName: string;
  tagline?: string;
  contactEmail: string;
  contactPhone: string;
  storeAddress?: string;
  defaultReturnPeriodDays?: number;
  defaultMaxQtyPerOrder?: number;
}`);

edit('load values',
`          storeAddress: settings.storeAddress,
        });`,
`          storeAddress: settings.storeAddress,
          // Fall back to the server's own defaults so the form never shows blanks
          // on a settings document created before these fields existed.
          defaultReturnPeriodDays: settings.defaultReturnPeriodDays ?? 14,
          defaultMaxQtyPerOrder: settings.defaultMaxQtyPerOrder ?? 5,
        });`);

edit('defaults section',
`          {/* Primary Save Changes Action Handler Button Block */}`,
`          {/* Order & return defaults — the fallback for every product that
              hasn't overridden them on its own product page. */}
          <div className="settings-defaults-block mt-5 pt-4">
            <h3 className="card-inner-headline mb-1">Order &amp; Return Defaults</h3>
            <p className="text-muted small mb-4">
              Applied to any product that has not set its own value.
            </p>

            <div className="row">
              <div className="col-12 col-md-6">
                <Form.Item
                  label="Default Return Period"
                  name="defaultReturnPeriodDays"
                  extra="Days after delivery a customer can request a return"
                >
                  <Select
                    size="large"
                    options={[
                      { value: 7, label: '7 days' },
                      { value: 14, label: '14 days' },
                      { value: 20, label: '20 days' },
                      { value: 30, label: '30 days' },
                    ]}
                  />
                </Form.Item>
              </div>

              <div className="col-12 col-md-6">
                <Form.Item
                  label="Default Max Quantity Per Order"
                  name="defaultMaxQtyPerOrder"
                  extra="Stops a single buyer clearing the shelf on a popular product"
                  rules={[{ required: true, message: 'Set a limit of at least 1' }]}
                >
                  <InputNumber min={1} max={1000} size="large" className="w-100" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Primary Save Changes Action Handler Button Block */}`);

for (const e of edits) if (!s.includes(e.from)) fail(e.name);
for (const e of edits) s = s.replace(e.from, e.to);

fs.writeFileSync(p, s);
console.log(`   patched (${edits.length} edits)`);
__ADM_EOF__

node - <<'__ADM_EOF__'
const fs = require('fs');
const p = 'src/styles/page-components/_adminFixes.scss';
let s = fs.readFileSync(p, 'utf8');
if (s.includes('settings-defaults-block')) process.exit(0);
s += `
// ─── Store settings: defaults section ───────────────────────────────────────
.settings-defaults-block {
  border-top: 1px solid $af-border;
}
`;
fs.writeFileSync(p, s);
console.log('   styles appended');
__ADM_EOF__

# ─────────────────────────────────────────────────────────────────────────────
echo
echo "✔ Admin client changes applied."
echo
echo "   SCAN THE OUTPUT ABOVE FOR '⚠ SKIPPED' — those files were left"
echo "   untouched because their code has drifted, and need a manual look."
echo
echo "Type-check (tsc --noEmit):"
if [ -d node_modules ]; then
  npx tsc -b --noEmit 2>&1 | head -30 || echo "  (see errors above)"
else
  echo "  ⚠ node_modules missing — run 'npm install', then 'npm run build' to verify."
fi

if [ -f .update-skipped.log ]; then
  echo
  echo "⚠  Some patches were skipped — apply these by hand:"
  sed "s/^/   /" .update-skipped.log
fi

cat <<'__NOTES__'

─────────────────────────────────────────────────────────────────────────
NOTES

  • Apply update-1-server-fixes.sh FIRST — this UI calls endpoints it adds
    (/admin/profile, /admin/forgot-password, return customerImages,
     transaction search params).

  • Approving a return still does NOT move money. That is intentional and
    now stated in the UI: approve → mark received → Process Refund. Only
    the last step calls Razorpay. This is why refunds were not appearing
    in the Razorpay dashboard.

  • The order status dropdown now disables illegal transitions and explains
    why on hover. 'Returned' only becomes selectable once a return has been
    approved under Returns & Refunds.

  Rollback: original files are in the .admin-backup-* directory created above.
─────────────────────────────────────────────────────────────────────────
__NOTES__
