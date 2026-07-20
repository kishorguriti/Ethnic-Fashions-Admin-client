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
