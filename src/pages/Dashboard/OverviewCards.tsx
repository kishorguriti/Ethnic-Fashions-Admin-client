import React from 'react';
import { 
  DollarOutlined, ShoppingCartOutlined, UserOutlined, 
  ClockCircleOutlined, WarningOutlined 
} from '@ant-design/icons';

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
  const cards: CardData[] = [
    {
      id: 1,
      title: 'Total Revenue',
      value: '₹8,450',
      badgeText: '+12.5% from last month',
      badgeType: 'success',
      icon: <DollarOutlined />,
      themeClass: 'theme-green',
    },
    {
      id: 2,
      title: 'Orders Today',
      value: '142',
      badgeText: '+8 from yesterday',
      badgeType: 'success',
      icon: <ShoppingCartOutlined />,
      themeClass: 'theme-blue',
    },
    {
      id: 3,
      title: 'Total Customers',
      value: '3,842',
      badgeText: '+24 this week',
      badgeType: 'success',
      icon: <UserOutlined />,
      themeClass: 'theme-purple',
    },
    {
      id: 4,
      title: 'Pending Orders',
      value: '28',
      badgeText: '3 urgent',
      badgeType: 'neutral',
      icon: <ClockCircleOutlined />,
      themeClass: 'theme-orange',
    },
    {
      id: 5,
      title: 'Low Stock Alerts',
      value: '12',
      badgeText: 'Needs attention',
      badgeType: 'danger',
      icon: <WarningOutlined />,
      themeClass: 'theme-red',
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
