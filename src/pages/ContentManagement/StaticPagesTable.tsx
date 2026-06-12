import React, { useState } from "react";
import { Table, Button, Tag, Space, message } from "antd";
import { PlusOutlined, EyeOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

// Define the TypeScript interface for our static page entry
interface StaticPageItem {
  key: string;
  pageTitle: string;
  urlSlug: string;
  lastUpdated: string;
  status: "Published" | "Draft";
}

const initialPages: StaticPageItem[] = [
  {
    key: "1",
    pageTitle: "Privacy Policy",
    urlSlug: "/privacy-policy",
    lastUpdated: "Mar 1, 2026",
    status: "Published",
  },
  {
    key: "2",
    pageTitle: "Terms & Conditions",
    urlSlug: "/terms",
    lastUpdated: "Mar 1, 2026",
    status: "Published",
  },
  {
    key: "3",
    pageTitle: "Shipping Policy",
    urlSlug: "/shipping",
    lastUpdated: "Feb 28, 2026",
    status: "Published",
  },
  {
    key: "4",
    pageTitle: "Return & Refund Policy",
    urlSlug: "/returns",
    lastUpdated: "Feb 28, 2026",
    status: "Published",
  },
];

const StaticPagesTable: React.FC = () => {
  const [pages] = useState<StaticPageItem[]>(initialPages);

  // Functional Interactive Handlers
  const handleAddNewPage = () => {
    message.success("Opening Create New Page setup builder wizard");
  };

  const handleViewPage = (slug: string) => {
    message.info(`Opening preview router lane for: ${slug}`);
  };

  const handleEditPage = (title: string) => {
    message.info(`Opening rich-text inline block editor for: "${title}"`);
  };

  // Ant Design Table Columns Config Setup Schema
  const columns: ColumnsType<StaticPageItem> = [
    {
      title: "Page Title",
      dataIndex: "pageTitle",
      key: "pageTitle",
      className: "text-dark-custom fw-semibold column-title",
      width: "30%",
    },
    {
      title: "URL Slug",
      dataIndex: "urlSlug",
      key: "urlSlug",
      className: "column-slug",
      render: (slug: string) => (
        <span className="purple-slug-link fw-medium">{slug}</span>
      ),
    },
    {
      title: "Last Updated",
      dataIndex: "lastUpdated",
      key: "lastUpdated",
      className: "text-muted-custom column-updated",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      className: "column-status",
      render: (status: "Published" | "Draft") => (
        <Tag className={`page-status-tag tag-${status.toLowerCase()}`}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      className: "column-actions",
      render: (_, record) => (
        <Space size="middle" className="actions-group-wrapper">
          <Button
            icon={<EyeOutlined />}
            className="btn-action btn-view"
            onClick={() => handleViewPage(record.urlSlug)}
          >
            View
          </Button>
          <Button
            icon={<EditOutlined />}
            className="btn-action btn-edit"
            onClick={() => handleEditPage(record.pageTitle)}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="container-fluid my-2 static-pages-manager">
      {/* Upper Button Group Layout Box */}
      <div className="d-flex justify-content-end mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="btn-purple-primary"
          onClick={handleAddNewPage}
        >
          New Page
        </Button>
      </div>

      {/* Main Structural Shared Table Shell */}
      <div className="table-card shadow-sm p-4 py-3 bg-white rounded-4">
        <Table
          columns={columns}
          dataSource={pages}
          pagination={false}
          scroll={{ x: "max-content" }} // Preserves row integrity across mobile viewports
          className="custom-pages-table"
        />
      </div>
    </div>
  );
};

export default StaticPagesTable;
