import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Switch,
  Tag,
  Modal,
  message,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import {
  getAdminProducts,
  deleteProduct,
  toggleProductStatus,
  approveProduct,
  rejectProduct,
  type Product,
  type ApprovalStatus,
} from "../../services/productApi";

const statusColors: Record<string, string> = {
  pending: "gold",
  approved: "green",
  rejected: "red",
};

const ProductsTable: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | "all">("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await getAdminProducts({
        limit: 100,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setProducts(res.data.data.products);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleToggleActive = async (record: Product, checked: boolean) => {
    try {
      const res = await toggleProductStatus(record._id);
      setProducts((prev) =>
        prev.map((p) => (p._id === record._id ? { ...p, isActive: res.data.data.product.isActive } : p)),
      );
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to update status");
    }
  };

  const handleApprove = async (record: Product) => {
    try {
      const res = await approveProduct(record._id);
      message.success(res.data.message);
      setProducts((prev) =>
        prev.map((p) => (p._id === record._id ? { ...p, ...res.data.data.product } : p)),
      );
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
          setProducts((prev) =>
            prev.map((p) => (p._id === record._id ? { ...p, ...res.data.data.product } : p)),
          );
        } catch (err: any) {
          message.error(err?.response?.data?.message || "Failed to reject product");
          return Promise.reject();
        }
      },
    });
  };

  const handleDelete = (record: Product) => {
    Modal.confirm({
      title: "Delete Product",
      content: `Are you sure you want to delete "${record.name}"? This action cannot be undone.`,
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteProduct(record._id);
          setProducts((prev) => prev.filter((p) => p._id !== record._id));
          message.success("Product deleted successfully");
        } catch (err: any) {
          message.error(err?.response?.data?.message || "Failed to delete product");
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
        <div className="product-info-cell">
          <h5 className="prod-title mb-0">{record.name}</h5>
          {record.brand && <span className="text-muted small">{record.brand}</span>}
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
      render: (status) => <Tag color={statusColors[status]}>{status.toUpperCase()}</Tag>,
    },
    {
      title: "ACTIVE",
      dataIndex: "isActive",
      key: "active",
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          disabled={record.approvalStatus !== "approved"}
          onChange={(checked) => handleToggleActive(record, checked)}
          className="custom-switch-toggle"
        />
      ),
    },
    {
      title: "CREATED",
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
            icon={<EditOutlined />}
            className="btn-edit-action"
            onClick={() => navigate(`/products/edit/${record._id}`)}
          >
            Edit
          </Button>
          {record.approvalStatus === "pending" && (
            <>
              <Button onClick={() => handleApprove(record)}>Approve</Button>
              <Button danger onClick={() => handleReject(record)}>
                Reject
              </Button>
            </>
          )}
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
        </div>
      ),
    },
  ];

  const filteredProducts = products.filter((p) => {
    const term = searchText.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.category?.name || "").toLowerCase().includes(term) ||
      (p.brand || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="products-inventory-panel p-4">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <h1 className="inventory-view-title mb-1">Products</h1>
          <p className="inventory-view-desc text-muted mb-0">Manage your product inventory</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="add-product-btn-brand"
          onClick={() => navigate("/products/add-new-product")}
        >
          Add Product
        </Button>
      </div>

      <div className="filter-controls-strip p-3 mb-4 d-flex flex-column flex-md-row justify-content-between gap-3 align-items-stretch align-items-md-center">
        <Input
          placeholder="Search products by name, category, brand..."
          prefix={<SearchOutlined className="search-icon-muted" />}
          className="search-input-field flex-grow-1"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Select
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            className="category-dropdown-select"
            suffixIcon={<FilterOutlined />}
            options={[
              { value: "all", label: "All Statuses" },
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
            ]}
          />
        </div>
      </div>

      <div className="table-card-wrapper bg-white">
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="_id"
          loading={loading}
          pagination={{
            position: ["bottomRight"],
            defaultPageSize: 10,
          }}
          className="custom-inventory-table"
          footer={() => (
            <span className="footer-counter-lbl text-muted">
              Showing {filteredProducts.length} of {products.length} products
            </span>
          )}
        />
      </div>
    </div>
  );
};

export default ProductsTable;
