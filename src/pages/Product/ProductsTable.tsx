import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Input,
  Button,
  Switch,
  Modal,
  Tag,
  Tooltip,
  Select,
  message,
} from "antd";
import { useAppSelector } from "../../hooks";
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
  type Product,
} from "../../services/productApi";

const statusColors: Record<string, string> = {
  pending: "gold",
  approved: "green",
  rejected: "red",
};

const ProductsTable: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [partnerFilter, setPartnerFilter] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const role = useAppSelector((state) => state.auth.user?.role);
  const canApprove = role === "super_admin" || role === "admin";

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await getAdminProducts({
        limit: 100,
        // Admins see the live catalog (approved only); partners see all
        // of their own submissions so they can track pending/rejected items
        status: role === "partner" ? undefined : "approved",
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
  }, [role]);

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
    ...(canApprove
      ? [
          {
            title: "PARTNER",
            key: "partner",
            render: (_: unknown, record: Product) => (
              <div>
                <div>{record.createdBy?.name || "—"}</div>
                <small className="text-muted">{record.createdBy?.email}</small>
              </div>
            ),
          },
        ]
      : []),
    ...(role === "partner"
      ? [
          {
            title: "STATUS",
            key: "approvalStatus",
            render: (_: unknown, record: Product) => {
              const tag = record.pendingChanges ? (
                <Tag color="blue">EDIT PENDING REVIEW</Tag>
              ) : (
                <Tag color={statusColors[record.approvalStatus]}>
                  {record.approvalStatus.toUpperCase()}
                </Tag>
              );
              return record.approvalStatus === "rejected" && record.rejectionReason ? (
                <Tooltip title={record.rejectionReason}>{tag}</Tooltip>
              ) : (
                tag
              );
            },
          },
        ]
      : []),
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
            onClick={() => navigate(`/products/edit/${record.slug}`)}
          >
            Edit
          </Button>
          {canApprove && (
            <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
          )}
        </div>
      ),
    },
  ];

  const categoryOptions = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      if (p.category?._id) map.set(p.category._id, p.category.name);
    });
    return [
      { value: "all", label: "All Categories" },
      ...Array.from(map.entries()).map(([value, label]) => ({ value, label })),
    ];
  }, [products]);

  const partnerOptions = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      if (p.createdBy?._id) map.set(p.createdBy._id, p.createdBy.name || p.createdBy.email);
    });
    return [
      { value: "all", label: "All Partners" },
      ...Array.from(map.entries()).map(([value, label]) => ({ value, label })),
    ];
  }, [products]);

  const filteredProducts = products.filter((p) => {
    const term = searchText.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(term) ||
      (p.category?.name || "").toLowerCase().includes(term) ||
      (p.brand || "").toLowerCase().includes(term);
    const matchesCategory = categoryFilter === "all" || p.category?._id === categoryFilter;
    const matchesPartner = partnerFilter === "all" || p.createdBy?._id === partnerFilter;
    return matchesSearch && matchesCategory && matchesPartner;
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
            value={categoryFilter}
            onChange={(val) => setCategoryFilter(val)}
            className="category-dropdown-select"
            suffixIcon={<FilterOutlined />}
            options={categoryOptions}
          />
          {canApprove && (
            <Select
              value={partnerFilter}
              onChange={(val) => setPartnerFilter(val)}
              className="category-dropdown-select"
              suffixIcon={<FilterOutlined />}
              options={partnerOptions}
            />
          )}
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
