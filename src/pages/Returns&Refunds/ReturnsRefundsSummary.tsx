import React, { useState } from "react";
import { Table, Input, Tag, Button, message, Modal } from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

// TypeScript schema interface matching the image's layout structure
interface ReturnRecord {
  key: string;
  returnId: string;
  orderId: string;
  customer: string;
  product: string;
  date: string;
  reason: string;
  status: "Pending" | "Approved" | "Refunded" | "Rejected" | "Processing";
  amount: number;
}

// TypeScript schema defining dynamic KPI layout cards data structures
interface ReturnMetricCard {
  id: number;
  title: string;
  value: string | number;
  subText: string;
  themeClass: "accent-orange" | "accent-blue" | "accent-green" | "accent-black";
}

const ReturnsRefundsSummary: React.FC = () => {
  // Metric configurations extracted exactly from your design image reference
  const metrics: ReturnMetricCard[] = [
    {
      id: 1,
      title: "Pending Returns",
      value: 12,
      subText: "Awaiting review",
      themeClass: "accent-orange",
    },
    {
      id: 2,
      title: "Approved",
      value: 8,
      subText: "Ready to refund",
      themeClass: "accent-blue",
    },
    {
      id: 3,
      title: "Refunded",
      value: 45,
      subText: "This month",
      themeClass: "accent-green",
    },
    {
      id: 4,
      title: "Total Refund Amount",
      value: "₹1,24,500",
      subText: "This month",
      themeClass: "accent-black",
    },
  ];

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Dynamic record state list pre-filled with explicitly mapped data rows visible in your image
  const [returnsData, setReturnsData] = useState<ReturnRecord[]>([
    {
      key: "1",
      returnId: "RET-001",
      orderId: "ORD-2445",
      customer: "Priya Sharma",
      product: "Banarasi Saree",
      date: "Mar 5, 2026",
      reason: "Size issue",
      status: "Pending",
      amount: 8500,
    },
    {
      key: "2",
      returnId: "RET-002",
      orderId: "ORD-2438",
      customer: "Meera Patel",
      product: "Gold Necklace",
      date: "Mar 4, 2026",
      reason: "Defective",
      status: "Approved",
      amount: 12000,
    },
    {
      key: "3",
      returnId: "RET-003",
      orderId: "ORD-2430",
      customer: "Kavita Singh",
      product: "Anarkali Suit",
      date: "Mar 3, 2026",
      reason: "Wrong item",
      status: "Refunded",
      amount: 4200,
    },
    {
      key: "4",
      returnId: "RET-004",
      orderId: "ORD-2425",
      customer: "Deepa Kumar",
      product: "Silver Earrings",
      date: "Mar 2, 2026",
      reason: "Changed mind",
      status: "Rejected",
      amount: 2800,
    },
    {
      key: "5",
      returnId: "RET-005",
      orderId: "ORD-2420",
      customer: "Riya Kapoor",
      product: "Cotton Churidar",
      date: "Mar 1, 2026",
      reason: "Color mismatch",
      status: "Processing",
      amount: 1800,
    },
  ]);

  // Handle inline return approval actions
  const handleApprove = (key: string, returnId: string) => {
    setReturnsData((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, status: "Approved" } : item,
      ),
    );
    message.success(`Request ${returnId} has been approved.`);
  };

  // Handle inline return rejection configurations
  const handleReject = (key: string, returnId: string) => {
    Modal.confirm({
      title: `Reject Return Request ${returnId}?`,
      icon: <CloseCircleOutlined className="text-danger" />,
      content:
        "Are you sure you want to decline this customer refund claim submission?",
      okText: "Reject Request",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        setReturnsData((prev) =>
          prev.map((item) =>
            item.key === key ? { ...item, status: "Rejected" } : item,
          ),
        );
        message.warning(`Request ${returnId} has been rejected.`);
      },
    });
  };

  // Handle process refund transaction lifecycles
  const handleProcessRefund = (key: string, returnId: string) => {
    setReturnsData((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, status: "Refunded" } : item,
      ),
    );
    message.success(`Refund processed successfully for request ${returnId}.`);
  };

  // Ant Design columns layout configuration matrix mapping image values
  const columns: ColumnsType<ReturnRecord> = [
    {
      title: "Return ID",
      dataIndex: "returnId",
      key: "returnId",
      render: (id) => <span className="return-id-highlight fw-bold">{id}</span>,
    },
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      render: (id) => <span className="order-id-txt text-secondary">{id}</span>,
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      render: (text) => (
        <span className="customer-txt text-dark fw-medium">{text}</span>
      ),
    },
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
      render: (text) => (
        <span className="product-txt text-secondary">{text}</span>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text) => <span className="date-txt text-muted">{text}</span>,
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      render: (text) => (
        <span className="reason-txt text-secondary">{text}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: ReturnRecord["status"]) => {
        const styleMap = {
          Pending: "status-pill-pending",
          Approved: "status-pill-approved",
          Refunded: "status-pill-refunded",
          Rejected: "status-pill-rejected",
          Processing: "status-pill-processing",
        };
        return (
          <Tag className={`return-status-pill ${styleMap[status]}`}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amt) => (
        <strong className="amount-txt text-dark">
          ₹{amt.toLocaleString("en-IN")}
        </strong>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <div className="table-actions-strip d-inline-flex align-items-center gap-2">
          {/* Conditional actions mapping rendering states based on status triggers */}
          {record.status === "Pending" && (
            <>
              <Button
                icon={<CheckCircleOutlined />}
                className="btn-action-approve d-inline-flex align-items-center gap-1"
                onClick={() => handleApprove(record.key, record.returnId)}
              >
                Approve
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                className="btn-action-reject d-inline-flex align-items-center gap-1"
                onClick={() => handleReject(record.key, record.returnId)}
              >
                Reject
              </Button>
            </>
          )}

          {record.status === "Approved" && (
            <Button
              className="btn-action-process-refund"
              onClick={() => handleProcessRefund(record.key, record.returnId)}
            >
              Process Refund
            </Button>
          )}

          {/* Persistent view action button icon visible across all items in layout */}
          <Button
            icon={<EyeOutlined />}
            type="text"
            className="btn-action-view d-inline-flex align-items-center justify-content-center"
            onClick={() =>
              message.info(`Inspecting record timeline: ${record.returnId}`)
            }
          />
        </div>
      ),
    },
  ];

  // Filtering runtime loop execution logic
  const filteredData = returnsData.filter(
    (item) =>
      item.returnId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="returns-refunds-summary container-fluid p-4">
      {/* 1. Section Header Title Block Area */}
      <div className="section-header-block mb-4">
        <h1 className="main-section-title mb-1">Returns & Refunds</h1>
        <p className="sub-section-desc text-muted mb-0">
          Manage product returns and refund requests
        </p>
      </div>

      {/* 2. Responsive Grid Block Row: Core Metric Summary Cards Deck */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-4">
        {metrics.map((card) => (
          <div className="col" key={card.id}>
            <div className="kpi-surface-card p-4 d-flex flex-column justify-content-between h-100">
              <div className="card-top-content">
                <span className="kpi-card-title text-muted d-block mb-2">
                  {card.title}
                </span>
                <h2 className={`kpi-card-numeric mb-2 ${card.themeClass}`}>
                  {card.value}
                </h2>
              </div>
              <div className="card-bottom-content">
                <span className="kpi-card-subtext text-muted d-block">
                  {card.subText}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="returns-refunds-table-panel pb-4 w-100 mt-4">
        {/* Search Filter Toolbar Component Strip */}
        <div className="filter-toolbar p-3 mb-4 bg-white rounded-3 border">
          <Input
            placeholder="Search by return ID or order ID..."
            prefix={<SearchOutlined className="search-icon-dimmed" />}
            className="search-input-field"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Main Core Tracking Records Grid Deck Wrapper */}
        <div className="table-card-surface bg-white border rounded-3 overflow-hidden pb-3">
          <Table
            columns={columns}
            dataSource={filteredData}
            scroll={{ x: "max-content" }}
            pagination={{
              current: currentPage,
              onChange: (page) => setCurrentPage(page),
              position: ["bottomRight"],
              defaultPageSize: 5,
              showSizeChanger: false,
              itemRender: (_, type, originalElement) => {
                if (type === "prev")
                  return (
                    <Button size="small" className="pag-btn">
                      Previous
                    </Button>
                  );
                if (type === "next")
                  return (
                    <Button size="small" className="pag-btn">
                      Next
                    </Button>
                  );
                return originalElement;
              },
            }}
            className="custom-returns-data-grid"
            footer={() => (
              <span className="footer-counter-text text-muted">
                Showing 1 to {filteredData.length} of 65 returns
              </span>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default ReturnsRefundsSummary;
