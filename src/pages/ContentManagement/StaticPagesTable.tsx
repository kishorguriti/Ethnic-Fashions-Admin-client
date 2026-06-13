import React, { useEffect, useState } from "react";
import { Table, Button, Tag, Space, message } from "antd";
import { EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
  getAdminStaticPages,
  type StaticPage,
} from "../../services/staticPageApi";
import EditStaticPageModal from "./EditStaticPageModal";

const StaticPagesTable: React.FC = () => {
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadPages = async () => {
    setLoading(true);
    try {
      const res = await getAdminStaticPages();
      setPages(res.data.data.pages);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  const handleEditPage = (id: string) => {
    setEditingPageId(id);
    setModalOpen(true);
  };

  const handleEditSuccess = (updated: StaticPage) => {
    setPages((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
  };

  const columns: ColumnsType<StaticPage> = [
    {
      title: "Page Title",
      dataIndex: "title",
      key: "title",
      className: "text-dark-custom fw-semibold column-title",
      width: "30%",
    },
    {
      title: "URL Slug",
      dataIndex: "slug",
      key: "slug",
      className: "column-slug",
      render: (slug: string) => (
        <span className="purple-slug-link fw-medium">/{slug}</span>
      ),
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      className: "text-muted-custom column-updated",
      render: (updatedAt: string) => dayjs(updatedAt).format("MMM D, YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      className: "column-status",
      render: (status: "published" | "draft") => (
        <Tag className={`page-status-tag tag-${status}`}>
          {status === "published" ? "Published" : "Draft"}
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
            icon={<EditOutlined />}
            className="btn-action btn-edit"
            onClick={() => handleEditPage(record._id)}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="container-fluid my-2 static-pages-manager">
      <div className="table-card shadow-sm p-4 py-3 bg-white rounded-4">
        <Table
          columns={columns}
          dataSource={pages}
          rowKey="_id"
          loading={loading}
          pagination={false}
          scroll={{ x: "max-content" }}
          className="custom-pages-table"
        />
      </div>

      <EditStaticPageModal
        open={modalOpen}
        pageId={editingPageId}
        onClose={() => setModalOpen(false)}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default StaticPagesTable;
