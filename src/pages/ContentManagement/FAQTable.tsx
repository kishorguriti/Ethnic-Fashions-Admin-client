import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getAdminFaqs, deleteFaq, type Faq } from '../../services/faqApi';
import AddFAQModal from './AddFAQModal';

const FAQTable: React.FC = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await getAdminFaqs();
      setFaqs(res.data.data.faqs);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleOpenModal = () => {
    setEditingFaq(null);
    setIsModalOpen(true);
  };

  const handleEdit = (faq: Faq) => {
    setEditingFaq(faq);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingFaq(null);
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    fetchFaqs();
  };

  const handleDelete = (faq: Faq) => {
    Modal.confirm({
      title: 'Are you absolutely sure you want to remove this FAQ entry?',
      content: `"${faq.question}" will be permanently removed from content layers.`,
      okText: 'Delete Entry',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteFaq(faq._id);
          message.success(`Removed: "${faq.question}"`);
          setFaqs((prev) => prev.filter((item) => item._id !== faq._id));
        } catch (err: any) {
          message.error(err?.response?.data?.message || 'Failed to delete FAQ');
        }
      },
    });
  };

  // Ant Design Table Columns Configuration Structure
  const columns: ColumnsType<Faq> = [
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question',
      className: 'text-dark-custom fw-semibold column-question',
      width: '40%',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      className: 'column-category',
      render: (category: string) => (
        <Tag className="category-pill-badge">{category}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      className: 'column-status',
      render: (status: 'published' | 'draft') => (
        <Tag className={`faq-status-tag tag-${status === 'published' ? 'published' : 'draft'}`}>
          {status === 'published' ? 'Published' : 'Draft'}
        </Tag>
      ),
    },
    {
      title: 'Order',
      dataIndex: 'displayOrder',
      key: 'displayOrder',
      className: 'column-order',
      width: 80,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      className: 'column-actions',
      render: (_, record) => (
        <Space size="middle" className="actions-button-wrapper">
          <Button
            icon={<EditOutlined />}
            className="btn-action btn-edit"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            className="btn-action btn-delete"
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="container-flid my-2 faq-manager">
      {/* Top Creation Row Actions Wrapper */}
      <div className="d-flex justify-content-end mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="btn-purple-primary"
          onClick={handleOpenModal}
        >
          Add FAQ
        </Button>
      </div>

      {/* Main Responsive Custom Data Table Card Layout */}
      <div className="table-card shadow-sm p-4 bg-white rounded-4">
        <Table
          columns={columns}
          dataSource={faqs}
          rowKey="_id"
          loading={loading}
          pagination={false}
          scroll={{ x: 'max-content' }}
          className="custom-faq-table"
        />
      </div>

      <AddFAQModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        editingFaq={editingFaq}
      />
    </div>
  );
};

export default FAQTable;
