import React, { useCallback, useEffect, useState } from 'react';
import { Table, Tag, Button, message } from 'antd';
import { EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getAdminOrders, type AdminOrder } from '../../services/orderApi';
import OrderDetailModal from './OrderDetailModal';

// TypeScript schema defining structure matching data items in the image
interface OrderRecord {
  key: string;
  id: string; // raw DB _id, used for detail/actions
  orderId: string;
  customerName: string;
  customerEmail: string;
  date: string;
  itemsCount: number;
  paymentStatus: 'Paid' | 'Pending';
  orderStatus: 'Delivered' | 'Processing' | 'Shipped' | 'Pending' | 'Cancelled' | 'Returned';
  amount: number;
}

interface OrdersTableProps {
  search?: string;
  statusFilter?: string; // lowercase API status enum, or undefined for all
}

// Map raw order status enum to the existing display label set.
const mapOrderStatus = (status: AdminOrder['status']): OrderRecord['orderStatus'] => {
  switch (status) {
    case 'confirmed':
      return 'Processing'; // UI has no Confirmed tag — treat as Processing
    case 'processing':
      return 'Processing';
    case 'shipped':
      return 'Shipped';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    case 'returned':
      return 'Returned';
    case 'pending':
    default:
      return 'Pending';
  }
};

const OrdersTable: React.FC<OrdersTableProps> = ({ search, statusFilter }) => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminOrders({
        page: 1,
        limit: 50,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      const mapped: OrderRecord[] = res.data.data.orders.map((o) => ({
        key: o._id,
        id: o._id,
        orderId: o.orderNumber,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        date: new Date(o.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        itemsCount: o.items.length,
        paymentStatus: o.payment?.status === 'paid' ? 'Paid' : 'Pending',
        orderStatus: mapOrderStatus(o.status),
        amount: o.total,
      }));
      setOrders(mapped);
    } catch {
      message.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleViewOrder = (id: string) => {
    setActiveOrderId(id);
    setModalOpen(true);
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
            onClick={() => handleViewOrder(record.id)}
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
        loading={loading}
        pagination={false}
        scroll={{ x: "max-content" }}
        className="custom-orders-data-grid"
        // responsive={true}
      />
      <OrderDetailModal
        open={modalOpen}
        orderId={activeOrderId}
        onClose={() => setModalOpen(false)}
        onUpdated={fetchOrders}
      />
    </div>
  );
};

export default OrdersTable;
