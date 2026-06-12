import React, { useState } from 'react';
import { Table, Button, Tag, Space, message, Modal } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

// Define structure for our article item
interface ArticleItem {
  key: string;
  title: string;
  author: string;
  date: string;
  views: number;
  status: 'Published' | 'Draft';
}

const initialArticles: ArticleItem[] = [
  {
    key: '1',
    title: 'Top 10 Saree Styles for Weddings',
    author: 'Admin',
    date: 'Mar 2, 2026',
    views: 2450,
    status: 'Published',
  },
  {
    key: '2',
    title: 'How to Choose Perfect Jewellery',
    author: 'Admin',
    date: 'Feb 28, 2026',
    views: 1890,
    status: 'Published',
  },
  {
    key: '3',
    title: 'Churidar Styling Guide',
    author: 'Admin',
    date: 'Feb 25, 2026',
    views: 0,
    status: 'Draft',
  },
];

const ArticleTable: React.FC = () => {
  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles);

  // Dynamic Handlers
  const handleAddNew = () => {
    message.success('Opening Create Article composer modal window');
  };

  const handleView = (title: string) => {
    message.info(`Redirecting to public view for: "${title}"`);
  };

  const handleEdit = (title: string) => {
    message.info(`Opening edit mode for article: "${title}"`);
  };

  const handleDelete = (key: string, title: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this article?',
      content: `This action will permanently delete "${title}".`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        setArticles(prev => prev.filter(item => item.key !== key));
        message.error(`Successfully removed article: "${title}"`);
      },
    });
  };

  // Ant Design Table Column Schema Definition
  const columns: ColumnsType<ArticleItem> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      className: 'text-dark-custom fw-semibold column-title',
      width: '30%',
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      className: 'text-muted-custom column-author',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      className: 'text-muted-custom column-date',
    },
    {
      title: 'Views',
      dataIndex: 'views',
      key: 'views',
      className: 'text-muted-custom column-views',
      render: (views: number) => views.toLocaleString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      className: 'column-status',
      render: (status: 'Published' | 'Draft') => (
        <Tag className={`article-status-tag tag-${status.toLowerCase()}`}>
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
        <Space size="middle" className="actions-button-group">
          <Button 
            icon={<EyeOutlined />} 
            className="btn-action btn-view"
            onClick={() => handleView(record.title)}
          >
            View
          </Button>
          <Button 
            icon={<EditOutlined />} 
            className="btn-action btn-edit"
            onClick={() => handleEdit(record.title)}
          >
            Edit
          </Button>
          <Button 
            icon={<DeleteOutlined />} 
            className="btn-action btn-delete"
            danger
            onClick={() => handleDelete(record.key, record.title)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="container my-5 article-manager">
      {/* Upper Create Row Element */}
      <div className="d-flex justify-content-end mb-4">
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          className="btn-purple-primary"
          onClick={handleAddNew}
        >
          New Article
        </Button>
      </div>

      {/* Main Responsive Custom Data Table Wrapper */}
      <div className="table-card shadow-sm p-4 bg-white rounded-4">
        <Table
          columns={columns}
          dataSource={articles}
          pagination={false}
          scroll={{ x: 'max-content' }} // Ensures responsiveness on smaller screen wrappers
          className="custom-article-table"
        />
      </div>
    </div>
  );
};

export default ArticleTable;
