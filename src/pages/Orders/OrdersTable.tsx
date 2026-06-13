import React, { useState } from 'react';
import { Table, Tag, Button, message } from 'antd';
import { EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

// TypeScript schema defining structure matching data items in the image
interface OrderRecord {
  key: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  date: string;
  itemsCount: number;
  paymentStatus: 'Paid' | 'Pending';
  orderStatus: 'Delivered' | 'Processing' | 'Shipped' | 'Pending' | 'Cancelled';
  amount: number;
}

const OrdersTable: React.FC = () => {
  // Dynamic mock state pre-filled with values from your image asset
  const [orders, setOrders] = useState<OrderRecord[]>([
    { key: '1', orderId: 'ORD-2451', customerName: 'Priya Sharma', customerEmail: 'priya@example.com', date: 'Mar 5, 2026', itemsCount: 3, paymentStatus: 'Paid', orderStatus: 'Delivered', amount: 8450 },
    { key: '2', orderId: 'ORD-2450', customerName: 'Ananya Reddy', customerEmail: 'ananya@example.com', date: 'Mar 5, 2026', itemsCount: 2, paymentStatus: 'Paid', orderStatus: 'Processing', amount: 12300 },
    { key: '3', orderId: 'ORD-2449', customerName: 'Meera Patel', customerEmail: 'meera@example.com', date: 'Mar 4, 2026', itemsCount: 1, paymentStatus: 'Paid', orderStatus: 'Shipped', amount: 5680 },
    { key: '4', orderId: 'ORD-2448', customerName: 'Kavita Singh', customerEmail: 'kavita@example.com', date: 'Mar 4, 2026', itemsCount: 4, paymentStatus: 'Pending', orderStatus: 'Pending', amount: 9200 },
    { key: '5', orderId: 'ORD-2447', customerName: 'Deepa Kumar', customerEmail: 'deepa@example.com', date: 'Mar 3, 2026', itemsCount: 2, paymentStatus: 'Paid', orderStatus: 'Delivered', amount: 15750 },
    { key: '6', orderId: 'ORD-2446', customerName: 'Riya Kapoor', customerEmail: 'riya@example.com', date: 'Mar 3, 2026', itemsCount: 1, paymentStatus: 'Paid', orderStatus: 'Cancelled', amount: 3200 }
  ]);

  const handleViewOrder = (orderId: string) => {
    message.info(`Opening overview statement for ${orderId}`);
  };

  const handleDownloadInvoice = (orderId: string) => {
    message.success(`Invoice PDF requested for ${orderId}`);
  };

  // Ant Design dynamic columns layout configuration matrix
  const columns: ColumnsType<OrderRecord> = [
    {
      title: 'ORDER ID',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 120,
      render: (id: string) => {
        // Hyphen break splitting matching the strict cell stack look in the image
        const part1 = id.substring(0, 5);
        const part2 = id.substring(5);
        return (
          <div className="order-id-cell-wrap fw-bold">
            {part1}<br />{part2}
          </div>
        );
      }
    },
    {
      title: 'CUSTOMER',
      key: 'customer',
      render: (_, record) => (
        <div className="customer-meta-cell">
          <div className="customer-name fw-bold mb-0 text-dark">{record.customerName}</div>
          <small className="customer-email text-muted d-block">{record.customerEmail}</small>
        </div>
      )
    },
    {
      title: 'DATE',
      dataIndex: 'date',
      key: 'date',
      width: 110,
      render: (dateStr: string) => {
        // Breaks dates down across separate lines matching the precise container layout
        const dateParts = dateStr.split(' ');
        return (
          <div className="date-cell text-muted">
            {dateParts[0]} {dateParts[1]}<br />{dateParts[2]}
          </div>
        );
      }
    },
    {
      title: 'ITEMS',
      dataIndex: 'itemsCount',
      key: 'items',
      render: (count: number) => (
        <span className="items-count-text text-secondary">
          {count} {count === 1 ? 'item' : 'items'}
        </span>
      )
    },
    {
      title: 'PAYMENT',
      dataIndex: 'paymentStatus',
      key: 'payment',
      render: (status: OrderRecord['paymentStatus']) => (
        <Tag className={`payment-pill-tag tag-${status.toLowerCase()}`}>
          {status}
        </Tag>
      )
    },
    {
      title: 'STATUS',
      dataIndex: 'orderStatus',
      key: 'status',
      render: (status: OrderRecord['orderStatus']) => (
        <Tag className={`status-pill-tag state-${status.toLowerCase()}`}>
          {status}
        </Tag>
      )
    },
    {
      title: 'AMOUNT',
      dataIndex: 'amount',
      key: 'amount',
      render: (amt: number) => (
        <strong className="amount-label-text text-dark fs-6">
          ₹{amt.toLocaleString('en-IN')}
        </strong>
      )
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <div className="actions-wrapper-strip d-inline-flex align-items-center gap-2">
          <Button 
            icon={<EyeOutlined />} 
            className="btn-action-view d-inline-flex align-items-center justify-content-center"
            onClick={() => handleViewOrder(record.orderId)}
          >
            View
          </Button>
          <Button 
            icon={<DownloadOutlined />} 
            className="btn-action-download d-inline-flex align-items-center justify-content-center"
            type="text"
            onClick={() => handleDownloadInvoice(record.orderId)}
          />
        </div>
      )
    }
  ];

  return (
    <div className="orders-table-wrapper bg-white shadow-sm rounded-3 mt-4">
      <Table 
        columns={columns} 
        dataSource={orders} 
        pagination={false}
        className="custom-orders-data-grid"
        // responsive={true}
      />
    </div>
  );
};

export default OrdersTable;
