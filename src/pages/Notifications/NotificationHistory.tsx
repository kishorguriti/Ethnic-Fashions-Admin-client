import React, { useState } from 'react';
import { Table, Tag, Input, Space, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';

// Define the TypeScript interface for our data row
interface NotificationData {
  key: string;
  title: string;
  type: 'Order Update' | 'Promotional' | 'Payment';
  recipients: number;
  dateTime: string;
  status: 'Sent' | 'Pending' | 'Failed'; // Added extra statuses for dynamic functionality
}

// Initial data from your image
const initialData: NotificationData[] = [
  {
    key: '1',
    title: 'New Order Placed',
    type: 'Order Update',
    recipients: 1,
    dateTime: 'Mar 5, 2026 10:30 AM',
    status: 'Sent',
  },
  {
    key: '2',
    title: 'Flash Sale Alert',
    type: 'Promotional',
    recipients: 3842,
    dateTime: 'Mar 4, 2026 2:00 PM',
    status: 'Sent',
  },
  {
    key: '3',
    title: 'Order Shipped',
    type: 'Order Update',
    recipients: 5,
    dateTime: 'Mar 4, 2026 9:15 AM',
    status: 'Sent',
  },
  {
    key: '4',
    title: 'Payment Received',
    type: 'Payment',
    recipients: 1,
    dateTime: 'Mar 3, 2026 4:45 PM',
    status: 'Sent',
  },
  {
    key: '5',
    title: 'New Arrivals Alert',
    type: 'Promotional',
    recipients: 2500,
    dateTime: 'Mar 3, 2026 11:00 AM',
    status: 'Sent',
  },
];

const NotificationHistory: React.FC = () => {
  const [data, setData] = useState<NotificationData[]>(initialData);
  const [searchText, setSearchText] = useState('');

  // Dynamic search functionality
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    
    const filteredData = initialData.filter((item) =>
      item.title.toLowerCase().includes(value.toLowerCase()) ||
      item.type.toLowerCase().includes(value.toLowerCase())
    );
    setData(filteredData);
  };

  // Define Ant Design Table Columns
  const columns: ColumnsType<NotificationData> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      className: 'fw-bold text-dark-custom column-title',
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      className: 'text-muted-custom column-type',
      filters: [
        { text: 'Order Update', value: 'Order Update' },
        { text: 'Promotional', value: 'Promotional' },
        { text: 'Payment', value: 'Payment' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Recipients',
      dataIndex: 'recipients',
      key: 'recipients',
      className: 'text-muted-custom column-recipients',
      render: (recipients: number) => `${recipients.toLocaleString()} users`,
      sorter: (a, b) => a.recipients - b.recipients,
    },
    {
      title: 'Date & Time',
      dataIndex: 'dateTime',
      key: 'dateTime',
      className: 'text-muted-custom column-datetime',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'right',
      render: (status: string) => (
        <Tag className={`status-tag tag-${status.toLowerCase()}`}>
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-12">
          {/* Dynamic Top Bar Controls */}
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <Input.Search
              placeholder="Search by title or type..."
              value={searchText}
              onChange={handleSearch}
              style={{ maxWidth: 300 }}
              allowClear
            />
            <Button type="primary" onClick={() => setData(initialData)}>
              Reset View
            </Button>
          </div>

          {/* Core Table Layout */}
          <div className="custom-table-card shadow-sm p-4 bg-white rounded">
            <Table
              columns={columns}
              dataSource={data}
              pagination={{ pageSize: 5, hideOnSinglePage: true }}
              scroll={{ x: 'max-content' }} // Ensures responsiveness on mobile screens
              className="custom-antd-table"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationHistory;
