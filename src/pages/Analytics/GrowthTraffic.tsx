import React from 'react';
import { Progress } from 'antd';
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

// Register ChartJS elements
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// TypeScript schemas
interface TrafficSourceItem {
  id: number;
  sourceName: string;
  visitors: string;
  conversions: string;
  conversionRate: number;
}

interface SummaryCard {
  id: number;
  title: string;
  value: string;
  subText: string;
  themeClass: 'green' | 'blue' | 'purple';
}

const GrowthTrafficDashboard: React.FC = () => {
  
  // 1. Traffic Sources dataset from the image layout
  const trafficSources: TrafficSourceItem[] = [
    { id: 1, sourceName: 'Organic Search', visitors: '12,450 visitors', conversions: '1245 conversions', conversionRate: 10 },
    { id: 2, sourceName: 'Direct', visitors: '8,920 visitors', conversions: '892 conversions', conversionRate: 10 },
    { id: 3, sourceName: 'Social Media', visitors: '6,780 visitors', conversions: '475 conversions', conversionRate: 7 },
    { id: 4, sourceName: 'Email Campaign', visitors: '4,560 visitors', conversions: '684 conversions', conversionRate: 15 },
    { id: 5, sourceName: 'Paid Ads', visitors: '3,240 visitors', conversions: '389 conversions', conversionRate: 12 }
  ];

  // 2. Performance Summary dataset from the bottom row section
  const summaryCards: SummaryCard[] = [
    { id: 1, title: 'Average Order Value', value: '₹4,280', subText: '+8.5% vs last month', themeClass: 'green' },
    { id: 2, title: 'Customer Lifetime Value', value: '₹12,450', subText: 'Average per customer', themeClass: 'blue' },
    { id: 3, title: 'Repeat Purchase Rate', value: '42.3%', subText: '+3.2% vs last month', themeClass: 'purple' }
  ];

  // 3. Customer Growth Chart Config (Line Chart)
  const growthChartData = {
    labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
    datasets: [
      {
        label: 'Customers',
        data: [3200, 3350, 3480, 3560, 3680, 3750, 3842],
        borderColor: '#10b981', // Emerald green line accent from the image
        backgroundColor: '#10b981',
        pointBorderColor: '#10b981',
        pointBackgroundColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.1, // Matches straight line segment look
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
        max: 4000,
        ticks: { stepSize: 1000, color: '#9ca3af', font: { size: 12 } },
        grid: { color: '#f3f4f6', drawTicks: false }
      },
      x: {
        ticks: { color: '#9ca3af', font: { size: 12 } },
        grid: { display: false }
      }
    }
  };

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

        {/* Right Side: Traffic Sources Progress List Card */}
        <div className="col-12 col-xl-6">
          <div className="dashboard-content-card p-4 bg-white h-100">
            <h3 className="card-inner-title mb-4">Traffic Sources & Conversion</h3>
            <div className="traffic-progress-stack d-flex flex-column gap-3">
              {trafficSources.map((source) => (
                <div key={source.id} className="traffic-item-row p-3 rounded-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <strong className="source-name text-dark">{source.sourceName}</strong>
                    <span className="source-visitors text-muted small">{source.visitors}</span>
                  </div>
                  
                  {/* Ant Design custom progress layout strip mapping visual design colors */}
                  <div className="d-flex align-items-center gap-3">
                    <div className="flex-grow-1">
                      <Progress 
                        percent={source.conversionRate * 5} // Proportional scaling metric values
                        showInfo={false} 
                        strokeColor="#cc00a3" // Vibrant pink progress fill from your image references
                        trailColor="#e5e7eb"
                        strokeWidth={10}
                        className="custom-pink-bar m-0"
                      />
                    </div>
                    <strong className="rate-text text-dark">{source.conversionRate}%</strong>
                  </div>

                  <span className="source-conversions text-muted small d-block mt-1">{source.conversions}</span>
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
