import React, { useEffect, useState } from 'react';
import { Progress, message } from 'antd';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getCustomerGrowth, getWishlistInsights, type GrowthPoint, type WishlistInsight } from '../../services/analyticsApi';
import { getCustomerStats, type CustomerStats } from '../../services/customerApi';

// Register ChartJS elements
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface SummaryCard {
  id: number;
  title: string;
  value: string;
  subText: string;
  themeClass: 'green' | 'blue' | 'purple';
}

const GrowthTrafficDashboard: React.FC = () => {
  const [growthData, setGrowthData] = useState<GrowthPoint[]>([]);
  const [wishlistInsights, setWishlistInsights] = useState<WishlistInsight[]>([]);
  const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [growthRes, wishlistRes, statsRes] = await Promise.all([
          getCustomerGrowth(),
          getWishlistInsights(5),
          getCustomerStats(),
        ]);
        setGrowthData(growthRes.data.data);
        setWishlistInsights(wishlistRes.data.data);
        setCustomerStats(statsRes.data.data);
      } catch {
        message.error('Failed to load growth & traffic data.');
      }
    };
    fetchData();
  }, []);

  const summaryCards: SummaryCard[] = [
    { id: 1, title: 'Total Customers', value: customerStats ? customerStats.totalCustomers.toLocaleString('en-IN') : '—', subText: 'All registered customers', themeClass: 'green' },
    { id: 2, title: 'New This Month', value: customerStats ? customerStats.newThisMonth.toLocaleString('en-IN') : '—', subText: 'Registered this month', themeClass: 'blue' },
    { id: 3, title: 'Verified Customers', value: customerStats ? customerStats.verifiedCustomers.toLocaleString('en-IN') : '—', subText: 'Phone number verified', themeClass: 'purple' },
  ];

  // Customer Growth Chart Config (Line Chart)
  const growthChartData = {
    labels: growthData.map((p) => p.label),
    datasets: [
      {
        label: 'Customers',
        data: growthData.map((p) => p.count),
        borderColor: '#10b981',
        backgroundColor: '#10b981',
        pointBorderColor: '#10b981',
        pointBackgroundColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.1,
      }
    ]
  };

  const growthChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        min: 0,
        ticks: { color: '#9ca3af', font: { size: 12 } },
        grid: { color: '#f3f4f6', drawTicks: false }
      },
      x: {
        ticks: { color: '#9ca3af', font: { size: 12 } },
        grid: { display: false }
      }
    }
  };

  const maxWishlistCount = Math.max(1, ...wishlistInsights.map((w) => w.wishlistCount));

  return (
    <div className="growth-traffic-panel container-fluid p-4 px-0">

      {/* Top Main Module Heading Section */}
      <h1 className="main-section-title mb-4">Growth & Traffic</h1>

      {/* Row Block A: Split Layout Charts Grid */}
      <div className="row g-4 mb-5">

        {/* Left Side: Customer Growth Canvas Card */}
        <div className="col-12 col-xl-6">
          <div className="dashboard-content-card p-4 bg-white h-100">
            <h3 className="card-inner-title mb-4">Customer Growth</h3>
            <div className="chart-canvas-box">
              <Line data={growthChartData} options={growthChartOptions} />
            </div>
          </div>
        </div>

        {/* Right Side: Top Wishlisted Products Progress List Card */}
        <div className="col-12 col-xl-6">
          <div className="dashboard-content-card p-4 bg-white h-100">
            <h3 className="card-inner-title mb-4">Top Wishlisted Products</h3>
            <div className="traffic-progress-stack d-flex flex-column gap-3">
              {wishlistInsights.length === 0 && (
                <span className="text-muted">No wishlist activity yet.</span>
              )}
              {wishlistInsights.map((item) => (
                <div key={item.productId} className="traffic-item-row p-3 rounded-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <strong className="source-name text-dark">{item.name}</strong>
                    <span className="source-visitors text-muted small">{item.wishlistCount} wishlisted</span>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <div className="flex-grow-1">
                      <Progress
                        percent={(item.wishlistCount / maxWishlistCount) * 100}
                        showInfo={false}
                        strokeColor="#cc00a3"
                        trailColor="#e5e7eb"
                        strokeWidth={10}
                        className="custom-pink-bar m-0"
                      />
                    </div>
                    <strong className="rate-text text-dark">{item.cartCount}</strong>
                  </div>

                  <span className="source-conversions text-muted small d-block mt-1">
                    {item.cartCount} in cart · {item.opportunity} opportunity score
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Row Block B: Performance Summary Deck Segment */}
      <h3 className="main-section-title mb-4">Performance Summary</h3>
      <div className="row row-cols-1 row-cols-md-3 g-4">
        {summaryCards.map((card) => (
          <div className="col" key={card.id}>
            <div className={`summary-telemetry-card surface-${card.themeClass} p-4 h-100 d-flex flex-column justify-content-between`}>
              <div className="card-top">
                <span className="summary-lbl d-block mb-2">{card.title}</span>
                <h2 className="summary-numeric mb-2">{card.value}</h2>
              </div>
              <div className="card-bottom">
                <span className="summary-footnote small">{card.subText}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default GrowthTrafficDashboard;
