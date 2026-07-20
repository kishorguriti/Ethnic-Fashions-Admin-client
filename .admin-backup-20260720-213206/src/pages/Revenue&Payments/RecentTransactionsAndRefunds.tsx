import React, { useCallback, useEffect, useState } from "react";
import { Table, Tag, message, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
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

const PAGE_SIZE = 10;

const FinancialLedgers: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [refunds, setRefunds] = useState<RefundRecord[]>([]);
  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [refundLoading, setRefundLoading] = useState<boolean>(false);

  const [txSearch, setTxSearch] = useState<string>("");
  const [txSearchDebounced, setTxSearchDebounced] = useState<string>("");
  const [txPage, setTxPage] = useState<number>(1);
  const [txTotal, setTxTotal] = useState<number>(0);
  const [refundPage, setRefundPage] = useState<number>(1);
  const [refundTotal, setRefundTotal] = useState<number>(0);

  // Debounced so typing doesn't fire a request per keystroke.
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
        setTxTotal(res.data.data.total);
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
  }, [txPage, txSearchDebounced]);

  const loadRefunds = useCallback(async () => {
      setRefundLoading(true);
      try {
        const res = await getRefunds({ page: refundPage, limit: PAGE_SIZE });
        setRefundTotal(res.data.data.total);
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
  }, [refundPage]);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);
  useEffect(() => { loadRefunds(); }, [loadRefunds]);

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
      </div>

      {/* LEDGER BOARD B: Recent Refunds Data Card Grid Component */}
      <div className="ledger-surface-card bg-white border p-4 rounded-3">
        <h3 className="ledger-card-heading mb-4">Recent Refunds</h3>
        <Table
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
        />
      </div>
    </div>
  );
};

export default FinancialLedgers;
