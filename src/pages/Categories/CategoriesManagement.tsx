import React, { useState } from "react";
import { Button, Table, Tag, Modal, Input, message } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  RightOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import AddCategoryModal from "./AddCategoryModal";

// TypeScript schema interfaces
interface CategoryItem {
  id: string;
  name: string;
  productCount: number;
  subcategories: string[];
  status: "Active" | "Inactive";
}

const CategoriesManagement: React.FC = () => {
  // Main dynamic state array tracking database structures matching the design layout
  const [open, setModalOpen] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  const [categories, setCategories] = useState<CategoryItem[]>([
    {
      id: "1",
      name: "Sarees",
      productCount: 245,
      subcategories: ["Banarasi", "Kanjivaram", "Paithani", "Silk", "Cotton"],
      status: "Active",
    },
    {
      id: "2",
      name: "Churidars",
      productCount: 182,
      subcategories: ["Anarkali", "Straight", "Flared", "Designer"],
      status: "Active",
    },
    {
      id: "3",
      name: "Jewellery",
      productCount: 156,
      subcategories: ["Necklaces", "Earrings", "Rings", "Bracelets", "Bangles"],
      status: "Active",
    },
  ]);

  // Handle addition of a mock new subcategory on card triggers
  const handleAddSubcategory = (catId: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === catId) {
          const newSubName = prompt(`Enter new subcategory for ${cat.name}:`);
          if (!newSubName?.trim()) return cat;
          return {
            ...cat,
            subcategories: [...cat.subcategories, newSubName.trim()],
          };
        }
        return cat;
      }),
    );
    message.success("Subcategory appended successfully!");
  };

  // Safe item deletion confirmation wrapper routine
  const handleDeleteCategory = (catId: string, name: string) => {
    Modal.confirm({
      title: `Are you sure you want to delete ${name}?`,
      icon: <ExclamationCircleOutlined className="text-danger" />,
      content:
        "This will eliminate all associated subcategory nodes completely.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        setCategories((prev) => prev.filter((c) => c.id !== catId));
        message.success(`${name} category removed.`);
      },
    });
  };

  // Ant Design Categories Table Column setup mapping image values
  const tableColumns: ColumnsType<CategoryItem> = [
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
      render: (subs: string[]) => (
        <span className="sub-count-txt">{subs.length} subcategories</span>
      ),
    },
    {
      title: "Products",
      dataIndex: "productCount",
      key: "productCount",
      render: (count) => <span className="product-count-txt">{count}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag className={`status-badge-pill pill-${status.toLowerCase()}`}>
          {status}
        </Tag>
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
          >
            Edit
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            className="action-btn-delete"
            onClick={() => handleDeleteCategory(record.id, record.name)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const onClose = () => {
    setModalOpen(false);
  };
  const handleOpenModal = () => {
    setModalOpen(true);
  };
  const onSuccess = (data: any) => {
    console.log(data, " Successfully Created ");
    setModalOpen(false);
  };
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
            onClick={() => handleOpenModal()}
          >
            Add Category
          </Button>
        </div>

        {/* Grid Block View: Upper Flex Card Groups */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 mb-5">
          {categories.map((cat) => (
            <div className="col" key={cat.id}>
              <div className="category-structure-card h-100 p-4">
                {/* Card Header Strip with context settings buttons */}
                <div className="card-top-header d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h3 className="card-cat-title mb-1">{cat.name}</h3>
                    <span className="card-cat-count text-muted">
                      {cat.productCount} products
                    </span>
                  </div>
                  <div className="header-icon-actions d-flex gap-2">
                    <Button
                      type="text"
                      icon={<EditOutlined className="icon-muted" />}
                      size="small"
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    />
                  </div>
                </div>

                {/* Subcategories Vertical List Segment Stack */}
                <div className="subcategories-list-area mt-3">
                  <span className="sub-lbl-title mb-2 d-block">
                    Subcategories:
                  </span>
                  <div className="sub-items-group d-flex flex-column gap-2 mb-3">
                    {cat.subcategories.map((sub, index) => (
                      <div
                        key={index}
                        className="sub-row-item d-flex justify-content-between align-items-center px-3 py-2"
                      >
                        <span className="sub-name-lbl">{sub}</span>
                        <RightOutlined className="chevron-icon-muted" />
                      </div>
                    ))}
                  </div>

                  {/* Subcategory interactive addition handler button link */}
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    className="add-sub-dashed-btn w-100 d-flex align-items-center justify-content-center"
                    onClick={() => handleAddSubcategory(cat.id)}
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
            rowKey="id"
            pagination={false}
            className="custom-branding-table"
          />
        </div>
      </div>
      <AddCategoryModal open={open} onClose={onClose} onSuccess={onSuccess} />
    </>
  );
};

export default CategoriesManagement;
