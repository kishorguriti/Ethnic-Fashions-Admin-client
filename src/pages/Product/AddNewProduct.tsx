import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "../../hooks";
import {
  Form,
  Input,
  Select,
  Switch,
  Button,
  Tabs,
  Tag,
  Table,
  Modal,
  Image,
  Alert,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  TagOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  getAdminProductBySlug,
  createProduct,
  updateProduct,
  toggleProductStatus,
  approveProduct,
  rejectProduct,
  deleteVariant,
  type ProductWithVariants,
  type ProductVariant,
} from "../../services/productApi";
import {
  getAdminCategories,
  type FilterableAttribute,
} from "../../services/categoryApi";
import AddVariantModal from "./AddVariantModal";

interface CategoryOption {
  value: string;
  label: string;
  filterableAttributes: FilterableAttribute[];
}

interface ProductFormValues {
  name: string;
  description?: string;
  category: string;
  brand?: string;
  tags?: string[];
  attributes?: Record<string, string | string[]>;
}

// Mirrors the customer-facing product gallery: a large main image with a
// clickable thumbnail strip, so admins can review images exactly as
// customers will see them before approving a product.
const VariantImageGallery: React.FC<{ variant: ProductVariant }> = ({ variant }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const media = variant.media || [];

  if (media.length === 0) {
    return <p className="text-muted small mb-0">No images uploaded for this variant.</p>;
  }

  return (
    <div className="d-flex flex-column gap-2" style={{ maxWidth: 260 }}>
      <Image
        src={media[Math.min(activeIndex, media.length - 1)]?.url}
        alt={`${variant.color} ${variant.size || ""}`}
        width={240}
        height={240}
        style={{ objectFit: "cover", borderRadius: 8 }}
        preview={{ mask: "Zoom" }}
      />
      {media.length > 1 && (
        <div className="d-flex gap-2 flex-wrap">
          {media.map((m, i) => (
            <img
              key={m._id}
              src={m.url}
              alt={`${variant.color} view ${i + 1}`}
              onClick={() => setActiveIndex(i)}
              style={{
                width: 48,
                height: 48,
                objectFit: "cover",
                borderRadius: 4,
                cursor: "pointer",
                border: i === activeIndex ? "2px solid #1677ff" : "1px solid #d9d9d9",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const statusColors: Record<string, string> = {
  pending: "gold",
  approved: "green",
  rejected: "red",
};

const AddNewProduct: React.FC = () => {
  const [form] = Form.useForm<ProductFormValues>();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const isEdit = !!slug;

  const role = useAppSelector((state) => state.auth.user?.role);
  const canApprove = role === "super_admin" || role === "admin";

  const [tab, setTab] = useState("1");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [product, setProduct] = useState<ProductWithVariants | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getAdminCategories();
        const flattened: CategoryOption[] = [];
        res.data.data.categories.forEach((parent) => {
          (parent.subcategories || []).forEach((sub) => {
            flattened.push({
              value: sub._id,
              label: `${parent.name} > ${sub.name}`,
              filterableAttributes: sub.filterableAttributes || [],
            });
          });
        });
        setCategoryOptions(flattened);
      } catch (err: any) {
        message.error(err?.response?.data?.message || "Failed to load categories");
      }
    };

    const loadProduct = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await getAdminProductBySlug(slug);
        const p = res.data.data.product;
        setProduct(p);
        setVariants(p.variants || []);
        setSelectedCategoryId(p.category._id);
        const attributes = { ...(p.attributes || {}) };
        if (attributes.occasion !== undefined && !Array.isArray(attributes.occasion)) {
          attributes.occasion = attributes.occasion ? [attributes.occasion] : [];
        }
        form.setFieldsValue({
          name: p.name,
          description: p.description,
          category: p.category._id,
          brand: p.brand,
          tags: p.tags || [],
          attributes,
        });
      } catch (err: any) {
        message.error(err?.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
    loadProduct();
  }, [slug, form]);

  const selectedCategory = categoryOptions.find((c) => c.value === selectedCategoryId);

  const handleFinish = async (values: ProductFormValues) => {
    setSubmitting(true);
    try {
      if (isEdit && product) {
        const payload = {
          name: values.name,
          description: values.description,
          brand: values.brand,
          tags: values.tags,
          attributes: values.attributes || {},
        };
        const res = await updateProduct(product._id, payload);
        message.success(res.data.message);
        setProduct((prev) => (prev ? { ...prev, ...res.data.data.product } : prev));
      } else {
        const payload = {
          name: values.name,
          description: values.description,
          category: values.category,
          brand: values.brand,
          tags: values.tags,
          attributes: values.attributes || {},
        };
        const res = await createProduct(payload);
        message.success(res.data.message);
        navigate(`/products/edit/${res.data.data.product.slug}`);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (checked: boolean) => {
    if (!product) return;
    try {
      const res = await toggleProductStatus(product._id);
      setProduct({ ...product, isActive: res.data.data.product.isActive });
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to update status");
    }
  };

  const handleApprove = async () => {
    if (!product) return;
    try {
      const res = await approveProduct(product._id);
      message.success(res.data.message);
      setProduct({ ...product, ...res.data.data.product });
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to approve product");
    }
  };

  const handleReject = async () => {
    if (!product) return;
    if (rejectReason.trim().length < 5) {
      message.error("Please provide a reason of at least 5 characters");
      return;
    }
    setRejecting(true);
    try {
      const res = await rejectProduct(product._id, rejectReason.trim());
      message.success(res.data.message);
      setProduct({ ...product, ...res.data.data.product });
      setRejectModalOpen(false);
      setRejectReason("");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to reject product");
    } finally {
      setRejecting(false);
    }
  };

  const handleVariantSuccess = (variant: ProductVariant) => {
    setVariants((prev) => {
      const exists = prev.find((v) => v._id === variant._id);
      if (exists) return prev.map((v) => (v._id === variant._id ? variant : v));
      return [...prev, variant];
    });
  };

  const handleDeleteVariant = (variant: ProductVariant) => {
    if (!product) return;
    Modal.confirm({
      title: "Delete Variant",
      content: `Are you sure you want to delete the ${variant.color}${variant.size ? ` / ${variant.size}` : ""} variant?`,
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteVariant(product._id, variant._id);
          setVariants((prev) => prev.filter((v) => v._id !== variant._id));
          message.success("Variant deleted successfully");
        } catch (err: any) {
          message.error(err?.response?.data?.message || "Failed to delete variant");
        }
      },
    });
  };

  const variantColumns: ColumnsType<ProductVariant> = [
    {
      title: "Color",
      dataIndex: "color",
      key: "color",
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      render: (size) => size || "Free Size",
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
    },
    {
      title: "MRP",
      dataIndex: "mrp",
      key: "mrp",
      render: (mrp) => `₹${mrp.toLocaleString("en-IN")}`,
    },
    {
      title: "Selling Price",
      dataIndex: "sellingPrice",
      key: "sellingPrice",
      render: (price) => `₹${price.toLocaleString("en-IN")}`,
    },
    {
      title: "Discount",
      dataIndex: "discount",
      key: "discount",
      render: (discount) => `${discount}%`,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
    },
    {
      title: "Media",
      dataIndex: "media",
      key: "media",
      render: (media: ProductVariant["media"]) => (
        <div className="d-flex gap-1">
          {(media || []).slice(0, 3).map((m) => (
            <img
              key={m._id}
              src={m.url}
              alt="variant"
              style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 4 }}
            />
          ))}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <div className="d-inline-flex gap-2">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingVariant(record);
              setVariantModalOpen(true);
            }}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteVariant(record)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="add-product-container container-fluid p-4 min-vh-100">
      <div className="header-navigation-row mb-4">
        <button
          className="back-btn d-inline-flex align-items-center gap-2 p-0 border-0 bg-transparent mb-2"
          onClick={() => navigate("/products")}
          type="button"
        >
          <ArrowLeftOutlined /> Back
        </button>
        <h1 className="main-title mb-1">{isEdit ? "Edit Product" : "Add New Product"}</h1>
        <p className="subtitle-text text-muted mb-0">
          {isEdit ? "Update product details and manage variants" : "Create a new product"}
        </p>
      </div>

      {isEdit && product?.pendingChanges && (
        <Alert
          className="mb-4"
          type="info"
          showIcon
          message={canApprove ? "Edit pending review" : "Your changes are pending review"}
          description={
            canApprove
              ? "This product is live. The partner has submitted edits below — the live listing shown to customers will not change until you approve or reject these changes."
              : "You've submitted changes to this live product. Customers continue to see the current approved details until admin/super_admin approves your edits."
          }
        />
      )}

      {isEdit && !canApprove && product?.approvalStatus === "approved" && !product?.pendingChanges && product?.rejectionReason && (
        <Alert
          className="mb-4"
          type="warning"
          showIcon
          message="Your last submitted edit was rejected"
          description={`Reason: ${product.rejectionReason}. Your live listing is unaffected — you can edit and resubmit.`}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
        disabled={loading}
      >
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="form-card-surface card-info-box p-4">
              <Tabs
                activeKey={tab}
                className="custom-form-tabs mb-4"
                items={[
                  { key: "1", label: "Basic Information" },
                  { key: "2", label: "Attributes" },
                ]}
                onChange={setTab}
              />
              {tab === "1" && (
                <>
                  <Form.Item
                    label="Product Name"
                    name="name"
                    rules={[{ required: true, message: "Please enter the product name" }]}
                  >
                    <Input placeholder="Enter product name" className="custom-form-input" size="large" />
                  </Form.Item>

                  <div className="row">
                    <div className="col-12 col-md-6">
                      <Form.Item
                        label="Category"
                        name="category"
                        rules={[{ required: true, message: "Please select a category" }]}
                      >
                        <Select
                          placeholder="Select category"
                          className="custom-form-select"
                          size="large"
                          disabled={isEdit}
                          options={categoryOptions}
                          onChange={(val) => setSelectedCategoryId(val)}
                        />
                      </Form.Item>
                    </div>
                    <div className="col-12 col-md-6">
                      <Form.Item label="Brand" name="brand">
                        <Input placeholder="Enter brand name" className="custom-form-input" size="large" />
                      </Form.Item>
                    </div>
                  </div>

                  <Form.Item label="Tags" name="tags">
                    <Select
                      mode="tags"
                      placeholder="Add tags and press enter"
                      className="custom-form-select"
                      size="large"
                      open={false}
                    />
                  </Form.Item>

                  <Form.Item label="Product Description" name="description">
                    <Input.TextArea
                      placeholder="Enter product description"
                      rows={4}
                      className="custom-form-input custom-textarea"
                    />
                  </Form.Item>
                </>
              )}
              {tab === "2" && (
                <div>
                  {selectedCategory && selectedCategory.filterableAttributes.length > 0 ? (
                    <div className="row">
                      {selectedCategory.filterableAttributes.map((attr) => (
                        <div className="col-12 col-md-6" key={attr.key}>
                          <Form.Item label={attr.label} name={["attributes", attr.key]}>
                            {attr.key === "occasion" ? (
                              <Select
                                mode="multiple"
                                placeholder={`Select ${attr.label}`}
                                className="custom-form-select"
                                size="large"
                                options={attr.options.map((opt) => ({ value: opt, label: opt }))}
                                allowClear
                              />
                            ) : attr.type === "select" || attr.type === "color" ? (
                              <Select
                                placeholder={`Select ${attr.label}`}
                                className="custom-form-select"
                                size="large"
                                options={attr.options.map((opt) => ({ value: opt, label: opt }))}
                                allowClear
                              />
                            ) : (
                              <Input
                                placeholder={`Enter ${attr.label}`}
                                className="custom-form-input"
                                size="large"
                              />
                            )}
                          </Form.Item>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state-dashed-box d-flex flex-column align-items-center justify-content-center text-center p-5">
                      <div className="icon-badge-circle d-flex align-items-center justify-content-center mb-4">
                        <TagOutlined className="badge-tag-icon" />
                      </div>
                      <h3 className="empty-state-main-msg mb-2">
                        Select a category to view attributes
                      </h3>
                      <p className="empty-state-sub-instruction mb-0 text-muted mx-auto">
                        Go to Basic Information tab and choose a category
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          <div className="col-12 col-lg-4">
            <div className="d-flex flex-column gap-4">
              {isEdit && product && (
                <div className="form-card-surface p-4">
                  <h3 className="card-inner-heading mb-4">Status</h3>

                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="toggle-label-text">Approval Status</span>
                    <Tag color={statusColors[product.approvalStatus]}>
                      {product.approvalStatus.toUpperCase()}
                    </Tag>
                  </div>

                  {canApprove && product.createdBy && (
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <span className="toggle-label-text">Product Owner</span>
                      <span className="text-end">
                        {product.createdBy.name || product.createdBy.email}
                      </span>
                    </div>
                  )}

                  {product.approvalStatus === "rejected" && product.rejectionReason && (
                    <p className="text-muted small mb-3">
                      Reason: {product.rejectionReason}
                    </p>
                  )}

                  {canApprove && product.pendingChanges && (
                    <div className="mb-3">
                      <span className="toggle-label-text d-block mb-2">Proposed Changes</span>
                      <div className="p-2 rounded" style={{ background: "#f5f5f5", fontSize: 12 }}>
                        {Object.entries(product.pendingChanges).map(([key, value]) => (
                          <div key={key} className="mb-1">
                            <strong>{key}:</strong>{" "}
                            {Array.isArray(value) ? value.join(", ") : String(value ?? "—")}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="toggle-label-text">Active</span>
                    <Switch
                      checked={product.isActive}
                      disabled={product.approvalStatus !== "approved"}
                      onChange={handleToggleActive}
                      className="custom-form-switch"
                    />
                  </div>

                  {canApprove && (product.approvalStatus === "pending" || product.pendingChanges) && (
                    <div className="d-flex gap-2 mt-3">
                      <Button type="primary" className="flex-grow-1" onClick={handleApprove}>
                        Approve
                      </Button>
                      <Button danger className="flex-grow-1" onClick={() => setRejectModalOpen(true)}>
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="action-button-stack d-flex flex-column gap-2 mt-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  className="brand-submit-btn w-100 btn-lg"
                  size="large"
                >
                  {isEdit ? "Save Changes" : "Create Product"}
                </Button>
                <Button
                  className="brand-cancel-btn w-100 btn-lg"
                  size="large"
                  onClick={() => navigate("/products")}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>

        {isEdit && (
          <div className="row g-4 mt-4">
            <div className="col-12">
              <div className="form-card-surface card-info-box p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="card-inner-heading mb-0">Variants</h3>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingVariant(null);
                      setVariantModalOpen(true);
                    }}
                  >
                    Add Variant
                  </Button>
                </div>
                <Table
                  className="variants-table"
                  columns={variantColumns}
                  dataSource={variants}
                  rowKey="_id"
                  pagination={false}
                  scroll={{ x: "max-content" }}
                />
              </div>
            </div>
          </div>
        )}

        {isEdit && canApprove && variants.length > 0 && (
          <div className="row g-4 mt-4">
            <div className="col-12">
              <div className="form-card-surface card-info-box p-4">
                <h3 className="card-inner-heading mb-4">Product Images (Customer Preview)</h3>
                <div className="row g-4">
                  {variants.map((variant) => (
                    <div className="col-12 col-md-6 col-lg-4" key={variant._id}>
                      <div className="d-flex flex-column gap-2">
                        <span className="fw-semibold">
                          {variant.color}{variant.size ? ` / ${variant.size}` : ""}
                        </span>
                        <VariantImageGallery variant={variant} />
                        <div className="d-flex align-items-center gap-2">
                          <span className="price-current">
                            ₹{variant.sellingPrice.toLocaleString("en-IN")}
                          </span>
                          {variant.mrp > variant.sellingPrice && (
                            <>
                              <span className="text-muted text-decoration-line-through">
                                ₹{variant.mrp.toLocaleString("en-IN")}
                              </span>
                              <Tag color="volcano">{variant.discount}% OFF</Tag>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Form>

      {isEdit && product && (
        <AddVariantModal
          open={variantModalOpen}
          onClose={() => setVariantModalOpen(false)}
          onSuccess={handleVariantSuccess}
          productId={product._id}
          editingVariant={editingVariant}
        />
      )}

      <Modal
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        onOk={handleReject}
        okText="Reject Product"
        okButtonProps={{ danger: true, loading: rejecting }}
        title="Reject Product"
        centered
      >
        <p className="text-muted mb-2">Please provide a reason for rejection (min. 5 characters):</p>
        <Input.TextArea
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="e.g., Price is too high compared to market rate"
        />
      </Modal>
    </div>
  );
};

export default AddNewProduct;
