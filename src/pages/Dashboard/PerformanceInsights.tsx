import React from 'react';
import { Table, Tag, List, Badge } from 'antd';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { 
  ShoppingCartOutlined, WarningOutlined, 
  UserOutlined, CreditCardOutlined 
} from '@ant-design/icons';

ChartJS.register(ArcElement, Tooltip, Legend);

// TypeScript Interface Definitions
interface TopProduct {
  rank: number;
  name: string;
  category: string;
  revenue: string;
  sales: number;
}

interface OrderRecord {
  key: string;
  orderId: string;
  customer: string;
  date: string;
  status: 'Delivered' | 'Processing' | 'Shipped' | 'Pending';
  amount: string;
}

interface NotificationItem {
  id: number;
  type: 'order' | 'stock' | 'customer' | 'payment';
  title: string;
  time: string;
  icon: React.ReactNode;
}

const PerformanceInsights: React.FC = () => {
  
  // 1. Category Doughnut Chart Setup
  const doughnutData = {
    labels: ['Sarees', 'Jewellery', 'Churidars'],
    datasets: [
      {
        data: [45, 35, 20],
        backgroundColor: ['#8b5cf6', '#a800e6', '#ec4899'],
        borderWidth: 0,
        cutout: '70%',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  // 2. Top Selling Products Data
  const topProducts: TopProduct[] = [
    { rank: 1, name: 'Banarasi Silk Saree', category: 'Sarees', revenue: '₹1,45,000', sales: 145 },
    { rank: 2, name: 'Gold Plated Necklace Set', category: 'Jewellery', revenue: '₹98,000', sales: 98 },
    { rank: 3, name: 'Designer Anarkali Suit', category: 'Churidars', revenue: '₹87,000', sales: 87 },
    { rank: 4, name: 'Kanjivaram Wedding Saree', category: 'Sarees', revenue: '₹1,14,000', sales: 76 },
    { rank: 5, name: 'Pearl Earrings', category: 'Jewellery', revenue: '₹32,500', sales: 65 },
  ];

  // 3. Recent Orders Data Table Configuration
  const ordersColumns = [
    {
      title: 'ORDER ID',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (id: string) => <span className="order-id-txt">{id}</span>,
    },
    { title: 'CUSTOMER', dataIndex: 'customer', key: 'customer' },
    { title: 'DATE', dataIndex: 'date', key: 'date' },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderRecord['status']) => {
        const colorMap = {
          Delivered: 'black',
          Processing: 'default',
          Shipped: 'blue',
          Pending: 'error',
        };
        return <Tag className={`status-badge tag-${colorMap[status]}`}>{status}</Tag>;
      },
    },
    {
      title: 'AMOUNT',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (amt: string) => <strong className="amount-txt">{amt}</strong>,
    },
  ];

  const recentOrders: OrderRecord[] = [
    { key: '1', orderId: 'ORD-2451', customer: 'Priya Sharma', date: 'Mar 5, 2026', status: 'Delivered', amount: '₹8,450' },
    { key: '2', orderId: 'ORD-2450', customer: 'Ananya Reddy', date: 'Mar 5, 2026', status: 'Processing', amount: '₹12,300' },
    { key: '3', orderId: 'ORD-2449', customer: 'Meera Patel', date: 'Mar 4, 2026', status: 'Shipped', amount: '₹5,680' },
    { key: '4', orderId: 'ORD-2448', customer: 'Kavita Singh', date: 'Mar 4, 2026', status: 'Pending', amount: '₹9,200' },
    { key: '5', orderId: 'ORD-2447', customer: 'Deepa Kumar', date: 'Mar 3, 2026', status: 'Delivered', amount: '₹15,750' },
  ];

  // 4. Activity Logs Notification stream data
  const systemNotifications: NotificationItem[] = [
    { id: 1, type: 'order', title: 'New order #2451 received', time: '5 min ago', icon: <ShoppingCartOutlined /> },
    { id: 2, type: 'stock', title: 'Low stock alert: Banarasi Saree', time: '12 min ago', icon: <WarningOutlined /> },
    { id: 3, type: 'customer', title: 'New customer registration', time: '1 hour ago', icon: <UserOutlined /> },
    { id: 4, type: 'payment', title: 'Payment received for order #2448', time: '2 hours ago', icon: <CreditCardOutlined /> },
  ];

  return (
    <div className="analytics-dashboard-extension py-3">
      
      {/* SECTION A: Performance Insights Header Group */}
      <h2 className="section-title mb-4">Performance Insights</h2>
      <div className="row g-3 mb-5">
        
        {/* Category Performance Card Block */}
        <div className="col-12 col-xl-4">
          <div className="insight-card p-4 h-100">
            <h4 className="card-subtitle mb-4">Category Performance</h4>
            <div className="chart-canvas-wrapper d-flex justify-content-center align-items-center position-relative">
              <div className="doughnut-container">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
              <div className="center-label text-center position-absolute">
                <span className="lbl-top">Sarees</span>
                <h5 className="lbl-pct mb-0">45%</h5>
              </div>
            </div>
            <div className="chart-legends d-flex justify-content-center gap-3 mt-4">
              <span className="legend-dot sarees">Sarees (45%)</span>
              <span className="legend-dot jewelry">Jewellery (35%)</span>
              <span className="legend-dot churidars">Churidars (20%)</span>
            </div>
          </div>
        </div>

        {/* Top Selling Products Progress List Block */}
        <div className="col-12 col-xl-8">
          <div className="insight-card p-4 h-100">
            <h4 className="card-subtitle mb-4">Top Selling Products</h4>
            <div className="product-rankings-stack d-flex flex-column gap-3">
              {topProducts.map((prod) => (
                <div key={prod.rank} className="ranking-row p-3 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div className="rank-badge-box d-flex align-items-center justify-content-center">
                      {prod.rank}
                    </div>
                    <div>
                      <h6 className="prod-name mb-0">{prod.name}</h6>
                      <span className="prod-category text-muted">{prod.category}</span>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="prod-revenue">{prod.revenue}</div>
                    <span className="prod-sales text-muted">{prod.sales} sales</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION B: Recent Activity Stream Layout Header */}
      <h2 className="section-title mb-4">Recent Activity</h2>
      <div className="row g-4">
        
        {/* Recent Orders Data Table Container */}
        <div className="col-12 col-xl-8">
          <div className="insight-card p-4">
            <h4 className="card-subtitle mb-4">Recent Orders</h4>
            <Table 
              columns={ordersColumns} 
              dataSource={recentOrders} 
              pagination={false}
              className="custom-data-table"
            //   responsive={true}
            />
          </div>
        </div>

        {/* Dynamic Activity Feed Area */}
        <div className="col-12 col-xl-4">
          <div className="insight-card p-4">
            <h4 className="card-subtitle mb-4">Notifications</h4>
            <List
              itemLayout="horizontal"
              dataSource={systemNotifications}
              renderItem={(item) => (
                <List.Item className="notification-list-item border-0 px-0 py-3">
                  <List.Item.Meta
                    avatar={
                      <div className={`notify-icon-shell shell-${item.type} d-flex align-items-center justify-content-center`}>
                        {item.icon}
                      </div>
                    }
                    title={<span className="notify-item-title">{item.title}</span>}
                    description={<span className="notify-item-time">{item.time}</span>}
                  />
                </List.Item>
              )}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default PerformanceInsights;
