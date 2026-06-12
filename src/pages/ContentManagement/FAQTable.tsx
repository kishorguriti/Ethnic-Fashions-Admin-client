import React, { useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

// TypeScript schema definition for FAQ data mapping
interface FAQItem {
  key: string;
  question: string;
  category: 'Returns' | 'Shipping' | 'Orders';
  status: 'Published' | 'Draft';
}

const initialFAQs: FAQItem[] = [
  {
    key: '1',
    question: 'What is your return policy?',
    category: 'Returns',
    status: 'Published',
  },
  {
    key: '2',
    question: 'How long does shipping take?',
    category: 'Shipping',
    status: 'Published',
  },
  {
    key: '3',
    question: 'Do you ship internationally?',
    category: 'Shipping',
    status: 'Published',
  },
  {
    key: '4',
    question: 'How do I track my order?',
    category: 'Orders',
    status: 'Published',
  },
];

const FAQTable: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFAQs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Dynamic Event Actions
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCancelModal = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  const handleCreateFAQ = (values: Omit<FAQItem, 'key'>) => {
    const newFAQ: FAQItem = {
      key: Date.now().toString(),
      ...values,
    };
    setFaqs(prev => [...prev, newFAQ]);
    message.success('FAQ successfully added to table catalog!');
    handleCancelModal();
  };

  const handleEdit = (question: string) => {
    message.info(`Opening structural composer window for: "${question}"`);
  };

  const handleDelete = (key: string, question: string) => {
    Modal.confirm({
      title: 'Are you absolutely sure you want to remove this FAQ entry?',
      content: `"${question}" will be permanently removed from content layers.`,
      okText: 'Delete Entry',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        setFaqs(prev => prev.filter(item => item.key !== key));
        message.error(`Removed: "${question}"`);
      },
    });
  };

  // Ant Design Table Columns Configuration Structure
  const columns: ColumnsType<FAQItem> = [
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question',
      className: 'text-dark-custom fw-semibold column-question',
      width: '45%',
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
      render: (status: 'Published' | 'Draft') => (
        <Tag className={`faq-status-tag tag-${status.toLowerCase()}`}>
          {status}
        </Tag>
      ),
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
            onClick={() => handleEdit(record.question)}
          >
            Edit
          </Button>
          <Button 
            icon={<DeleteOutlined />} 
            danger 
            className="btn-action btn-delete"
            onClick={() => handleDelete(record.key, record.question)}
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
          pagination={false}
          scroll={{ x: 'max-content' }} // Prevents text-wrap breaks on smaller viewports
          className="custom-faq-table"
        />
      </div>

      {/* Dynamic Pop-up Wizard Form Window Component */}
      <Modal
        title="Add New FAQ"
        open={isModalOpen}
        onCancel={handleCancelModal}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreateFAQ} className="mt-3">
          <Form.Item
            name="question"
            label="Question Text"
            rules={[{ required: true, message: 'Please inputs your question' }]}
          >
            <Input placeholder="e.g., What is your return policy?" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category Topic"
            rules={[{ required: true, message: 'Please pick a category group' }]}
          >
            <Select placeholder="Choose target context group">
              <Select.Option value="Returns">Returns</Select.Option>
              <Select.Option value="Shipping">Shipping</Select.Option>
              <Select.Option value="Orders">Orders</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Publishing Status" initialValue="Published">
            <Select>
              <Select.Option value="Published">Published</Select.Option>
              <Select.Option value="Draft">Draft</Select.Option>
            </Select>
          </Form.Item>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button onClick={handleCancelModal}>Cancel</Button>
            <Button type="primary" htmlType="submit" className="btn-modal-submit">
              Save FAQ
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default FAQTable;
