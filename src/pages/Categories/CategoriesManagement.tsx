import React, { useEffect, useState } from "react";
import { Button, Table, Tag, Switch, Modal, Alert, Empty, Spin, message } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import AddCategoryModal from "./AddCategoryModal";
import {
  getAdminCategories,
  deleteCategory,
  toggleCategoryStatus,
  reorderCategory,
  type Category,
} from "../../services/categoryApi";

const CategoriesManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [modalParentId, setModalParentId] = useState<string | null>(null);
  const [modalParentName, setModalParentName] = useState<string | undefined>(undefined);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminCategories();
      setCategories(res.data.data.categories);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to load categories.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setModalParentId(null);
    setModalParentName(undefined);
    setModalOpen(true);
  };

  const handleOpenAddSubcategory = (cat: Category) => {
    setEditingCategory(null);
    setModalParentId(cat._id);
    setModalParentName(cat.name);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: Category, parentId: string | null) => {
    setEditingCategory(cat);
    setModalParentId(parentId);
    setModalParentName(undefined);
    setModalOpen(true);
  };

  const onClose = () => {
    setModalOpen(false);
  };

  const onSuccess = () => {
    setModalOpen(false);
    fetchCategories();
  };

  const handleDeleteCategory = (catId: string, name: string) => {
    Modal.confirm({
      title: `Are you sure you want to delete ${name}?`,
      icon: <ExclamationCircleOutlined className="text-danger" />,
      content:
        "This will also remove all associated subcategories.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res = await deleteCategory(catId);
          message.success(res.data.message);
          fetchCategories();
        } catch (err: any) {
          message.error(
            err?.response?.data?.message || "Failed to delete category.",
          );
        }
      },
    });
  };

  const handleToggleStatus = async (catId: string) => {
    setTogglingId(catId);
    try {
      const res = await toggleCategoryStatus(catId);
      message.success(res.data.message);
      fetchCategories();
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || "Failed to update status.",
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const current = categories[index];
    const target = categories[targetIndex];

    try {
      await Promise.all([
        reorderCategory(current._id, target.displayOrder),
        reorderCategory(target._id, current.displayOrder),
      ]);
      fetchCategories();
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || "Failed to reorder categories.",
      );
    }
  };

  // Ant Design Categories Table Column setup
  const tableColumns: ColumnsType<Category> = [
    {
      title: "Category",
      dataIndex: "name",
      key: "name",
      render: (text) => <strong className="category-bold-title">{text}</strong>,
    },
    {
      title: "Subcategories",
      dataIndex: "subcategories",
      key: "subcategories",
      render: (subs: Category[]) => (
        <span className="sub-count-txt">{subs.length} subcategories</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean, record) => (
        <div className="d-flex align-items-center gap-2">
          <Tag className={`status-badge-pill pill-${isActive ? "active" : "inactive"}`}>
            {isActive ? "Active" : "Inactive"}
          </Tag>
          <Switch
            size="small"
            checked={isActive}
            loading={togglingId === record._id}
            onChange={() => handleToggleStatus(record._id)}
          />
        </div>
      ),
    },
    {
      title: "Order",
      key: "order",
      render: (_, record, index) => (
        <div className="d-inline-flex gap-1">
          <Button
            type="text"
            size="small"
            icon={<ArrowUpOutlined />}
            disabled={index === 0}
            onClick={() => handleMove(index, "up")}
          />
          <Button
            type="text"
            size="small"
            icon={<ArrowDownOutlined />}
            disabled={index === categories.length - 1}
            onClick={() => handleMove(index, "down")}
          />
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <div className="table-actions d-inline-flex gap-3">
          <Button
            type="text"
            icon={<EditOutlined />}
            className="action-btn-edit"
            onClick={() => handleOpenEdit(record, null)}
          >
            Edit
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            className="action-btn-delete"
            onClick={() => handleDeleteCategory(record._id, record.name)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="categories-management-wrapper container-fluid p-4">
        {/* Top Heading Group Title Strip */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
          <div>
            <h1 className="section-main-title mb-1">Categories</h1>
            <p className="section-sub-desc text-muted mb-0">
              Manage product categories and subcategories
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="add-category-brand-btn"
            onClick={handleOpenAddCategory}
          >
            Add Category
          </Button>
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
            showIcon
            className="mb-4"
            action={
              <Button size="small" onClick={fetchCategories}>
                Retry
              </Button>
            }
          />
        )}

        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <Spin size="large" />
          </div>
        ) : categories.length === 0 ? (
          !error && <Empty description="No categories found" className="py-5" />
        ) : (
          <>
            {/* Grid Block View: Upper Flex Card Groups */}
            <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 mb-5">
              {categories.map((cat) => (
                <div className="col" key={cat._id}>
                  <div className="category-structure-card h-100 p-4">
                    {/* Card Header Strip with context settings buttons */}
                    <div className="card-top-header d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h3 className="card-cat-title mb-1">{cat.name}</h3>
                        <span className="card-cat-count text-muted">
                          {cat.subcategories.length} subcategories
                        </span>
                      </div>
                      <div className="header-icon-actions d-flex gap-2">
                        <Button
                          type="text"
                          icon={<EditOutlined className="icon-muted" />}
                          size="small"
                          onClick={() => handleOpenEdit(cat, null)}
                        />
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          size="small"
                          onClick={() => handleDeleteCategory(cat._id, cat.name)}
                        />
                      </div>
                    </div>

                    {/* Subcategories Vertical List Segment Stack */}
                    <div className="subcategories-list-area mt-3">
                      <span className="sub-lbl-title mb-2 d-block">
                        Subcategories:
                      </span>
                      <div className="sub-items-group d-flex flex-column gap-2 mb-3">
                        {cat.subcategories.map((sub) => (
                          <div
                            key={sub._id}
                            className="sub-row-item d-flex justify-content-between align-items-center px-3 py-2"
                          >
                            <span className="sub-name-lbl">{sub.name}</span>
                            <div className="d-inline-flex gap-1">
                              <Button
                                type="text"
                                size="small"
                                icon={<EditOutlined className="icon-muted" />}
                                onClick={() => handleOpenEdit(sub, cat._id)}
                              />
                              <Button
                                type="text"
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => handleDeleteCategory(sub._id, sub.name)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Subcategory interactive addition handler button link */}
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        className="add-sub-dashed-btn w-100 d-flex align-items-center justify-content-center"
                        onClick={() => handleOpenAddSubcategory(cat)}
                      >
                        Add Subcategory
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table Section Block View: Category Details Area Layout */}
            <div className="category-details-table-card p-4 bg-white">
              <h4 className="table-inner-heading mb-4">Category Details</h4>
              <Table
                columns={tableColumns}
                dataSource={categories}
                rowKey="_id"
                pagination={false}
                scroll={{ x: "max-content" }}
                className="custom-branding-table"
              />
            </div>
          </>
        )}
      </div>
      <AddCategoryModal
        open={modalOpen}
        onClose={onClose}
        onSuccess={onSuccess}
        editingCategory={editingCategory}
        parentId={modalParentId}
        parentName={modalParentName}
      />
    </>
  );
};

export default CategoriesManagement;
