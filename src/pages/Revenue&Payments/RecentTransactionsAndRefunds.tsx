import React, { useState } from "react";
import { Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";

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
  // 1. Transactions state list pre-filled with explicitly mapped data rows visible in your image
  const [transactions] = useState<TransactionRecord[]>([
    {
      key: "t1",
      txId: "TXN-45123",
      orderId: "ORD-2451",
      customer: "Priya Sharma",
      date: "Mar 5, 2026",
      method: "UPI",
      status: "Success",
      amount: 8450,
    },
    {
      key: "t2",
      txId: "TXN-45122",
      orderId: "ORD-2450",
      customer: "Ananya Reddy",
      date: "Mar 5, 2026",
      method: "Credit Card",
      status: "Success",
      amount: 12300,
    },
    {
      key: "t3",
      txId: "TXN-45121",
      orderId: "ORD-2449",
      customer: "Meera Patel",
      date: "Mar 4, 2026",
      method: "Debit Card",
      status: "Success",
      amount: 5680,
    },
    {
      key: "t4",
      txId: "TXN-45120",
      orderId: "ORD-2448",
      customer: "Kavita Singh",
      date: "Mar 4, 2026",
      method: "Net Banking",
      status: "Pending",
      amount: 9200,
    },
    {
      key: "t5",
      txId: "TXN-45119",
      orderId: "ORD-2447",
      customer: "Deepa Kumar",
      date: "Mar 3, 2026",
      method: "UPI",
      status: "Success",
      amount: 15750,
    },
  ]);

  // 2. Refunds state list pre-filled with data rows from the layout image
  const [refunds] = useState<RefundRecord[]>([
    {
      key: "r1",
      refundId: "REF-001",
      orderId: "ORD-2440",
      customer: "Priya Sharma",
      date: "Mar 3, 2026",
      status: "Processed",
      amount: 8450,
    },
    {
      key: "r2",
      refundId: "REF-002",
      orderId: "ORD-2435",
      customer: "Meera Patel",
      date: "Mar 2, 2026",
      status: "Processing",
      amount: 4200,
    },
    {
      key: "r3",
      refundId: "REF-003",
      orderId: "ORD-2428",
      customer: "Kavita Singh",
      date: "Mar 1, 2026",
      status: "Processed",
      amount: 12000,
    },
  ]);

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
