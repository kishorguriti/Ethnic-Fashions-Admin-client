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
