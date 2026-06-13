import React, { useEffect, useState } from "react";
import { Table, Input, Button, Tag, Modal, Tooltip, message } from "antd";
import { CheckOutlined, CloseOutlined, EyeOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import {
  getPendingProducts,
  approveProduct,
  rejectProduct,
  type Product,
} from "../../services/productApi";

const statusColors: Record<string, string> = {
  pending: "gold",
  approved: "green",
  rejected: "red",
};

const PendingApprovals: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await getPendingProducts({ limit: 100 });
      setProducts(res.data.data.products);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to load pending products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleApprove = async (record: Product) => {
    try {
      const res = await approveProduct(record._id);
      message.success(res.data.message);
      setProducts((prev) => prev.filter((p) => p._id !== record._id));
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to approve product");
    }
  };

  const handleReject = (record: Product) => {
    let reason = "";
    Modal.confirm({
      title: "Reject Product",
      content: (
        <div className="pt-2">
          <p className="text-muted mb-2">Please provide a reason for rejection (min. 5 characters):</p>
          <Input.TextArea
            rows={3}
            onChange={(e) => {
              reason = e.target.value;
            }}
            placeholder="e.g., Price is too high compared to market rate"
          />
        </div>
      ),
      okText: "Reject",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        if (reason.trim().length < 5) {
          message.error("Please provide a reason of at least 5 characters");
          return Promise.reject();
        }
        try {
          const res = await rejectProduct(record._id, reason.trim());
          message.success(res.data.message);
          setProducts((prev) => prev.filter((p) => p._id !== record._id));
        } catch (err: any) {
          message.error(err?.response?.data?.message || "Failed to reject product");
          return Promise.reject();
        }
      },
    });
  };

  const columns: ColumnsType<Product> = [
    {
      title: "PRODUCT",
      dataIndex: "name",
      key: "product",
      render: (_, record) => (
        <div className="product-info-cell d-flex align-items-center gap-2">
          {record.thumbnail ? (
            <img
              src={record.thumbnail}
              alt={record.name}
              style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }}
            />
          ) : (
            <div
              style={{ width: 40, height: 40, borderRadius: 4, background: "#f0f0f0" }}
            />
          )}
          <div>
            <h5 className="prod-title mb-0">{record.name}</h5>
            {record.brand && <span className="text-muted small">{record.brand}</span>}
          </div>
        </div>
      ),
    },
    {
      title: "PARTNER",
      key: "partner",
      render: (_, record) => (
        <div>
          <div>{record.createdBy?.name || "—"}</div>
          <small className="text-muted">{record.createdBy?.email}</small>
        </div>
      ),
    },
    {
      title: "CATEGORY",
      dataIndex: "category",
      key: "category",
      render: (category) => <span className="category-tag">{category?.name}</span>,
    },
    {
      title: "STATUS",
      dataIndex: "approvalStatus",
      key: "approvalStatus",
      render: (status, record) => {
        if (record.pendingChanges) {
          return <Tag color="blue">EDIT PENDING REVIEW</Tag>;
        }
        const tag = <Tag color={statusColors[status]}>{status.toUpperCase()}</Tag>;
        return status === "rejected" && record.rejectionReason ? (
          <Tooltip title={record.rejectionReason}>{tag}</Tooltip>
        ) : (
          tag
        );
      },
    },
    {
      title: "SUBMITTED",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("en-IN"),
    },
    {
      title: "ACTIONS",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <div className="actions-wrapper d-inline-flex align-items-center gap-2">
          <Button
            icon={<EyeOutlined />}
            onClick={() => navigate(`/products/edit/${record.slug}`)}
          >
            Review
          </Button>
          <Button icon={<CheckOutlined />} onClick={() => handleApprove(record)}>
            Approve
          </Button>
          <Button danger icon={<CloseOutlined />} onClick={() => handleReject(record)}>
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="products-inventory-panel p-4">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <h1 className="inventory-view-title mb-1">Pending Approvals</h1>
          <p className="inventory-view-desc text-muted mb-0">
            Review and approve products submitted by partners before they go live
          </p>
        </div>
      </div>

      <div className="table-card-wrapper bg-white">
        <Table
          columns={columns}
          dataSource={products}
          rowKey="_id"
          loading={loading}
          pagination={{ position: ["bottomRight"], defaultPageSize: 10 }}
          className="custom-inventory-table"
          footer={() => (
            <span className="footer-counter-lbl text-muted">
              {products.length} product{products.length !== 1 ? "s" : ""} awaiting review
            </span>
          )}
        />
      </div>
    </div>
  );
};

export default PendingApprovals;
