import React, { useEffect, useState } from 'react';
import {
  UserOutlined, ShoppingOutlined, AppstoreOutlined,
  WarningOutlined, HeartOutlined
} from '@ant-design/icons';
import { message } from 'antd';
import { getDashboardOverview, type DashboardOverview } from '../../services/adminApi';

interface CardData {
  id: number;
  title: string;
  value: string;
  badgeText: string;
  badgeType: 'success' | 'warning' | 'danger' | 'neutral';
  icon: React.ReactNode;
  themeClass: string;
}

const OverviewCards: React.FC = () => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await getDashboardOverview();
        setOverview(res.data.data);
      } catch {
        message.error('Failed to load dashboard overview.');
      }
    };
    fetchOverview();
  }, []);

  const cards: CardData[] = [
    {
      id: 1,
      title: 'Total Customers',
      value: overview ? overview.totalCustomers.toLocaleString('en-IN') : '—',
      badgeText: 'All registered customers',
      badgeType: 'success',
      icon: <UserOutlined />,
      themeClass: 'theme-purple',
    },
    {
      id: 2,
      title: 'Total Products',
      value: overview ? overview.totalProducts.toLocaleString('en-IN') : '—',
      badgeText: 'Active in catalog',
      badgeType: 'success',
      icon: <ShoppingOutlined />,
      themeClass: 'theme-blue',
    },
    {
      id: 3,
      title: 'Total Categories',
      value: overview ? overview.totalCategories.toLocaleString('en-IN') : '—',
      badgeText: 'Active categories',
      badgeType: 'neutral',
      icon: <AppstoreOutlined />,
      themeClass: 'theme-green',
    },
    {
      id: 4,
      title: 'Low Stock Alerts',
      value: overview ? overview.lowStockCount.toLocaleString('en-IN') : '—',
      badgeText: 'Needs attention',
      badgeType: 'danger',
      icon: <WarningOutlined />,
      themeClass: 'theme-red',
    },
    {
      id: 5,
      title: 'Total Wishlisted Items',
      value: overview ? overview.totalWishlisted.toLocaleString('en-IN') : '—',
      badgeText: 'Across all customers',
      badgeType: 'neutral',
      icon: <HeartOutlined />,
      themeClass: 'theme-orange',
    },
  ];

  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-5 g-4">
      {cards.map((card) => (
        <div className="col" key={card.id}>
          <div className="kpi-metric-card h-100 p-4 d-flex flex-column justify-content-between">
            <div className="card-top d-flex align-items-center mb-3">
              <div className={`metric-icon-avatar d-flex align-items-center justify-content-center ${card.themeClass}`}>
                {card.icon}
              </div>
            </div>
            <div className="card-middle mb-2">
              <span className="metric-title-lbl d-block text-muted mb-1">{card.title}</span>
              <h2 className="metric-numeric-value mb-0">{card.value}</h2>
            </div>
            <div className="card-bottom mt-2">
              <span className={`badge-trend-indicator trend-${card.badgeType}`}>
                {card.badgeText}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OverviewCards;
