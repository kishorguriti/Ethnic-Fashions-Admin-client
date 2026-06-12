import React from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const ChartsSection: React.FC = () => {
  // Line chart matching Revenue Trend structure parameters
  const revenueData = {
    labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
    datasets: [
      {
        label: 'Monthly Revenue',
        data: [44000, 52000, 48000, 61000, 55000, 68000],
        borderColor: '#a800e6',
        backgroundColor: 'rgba(168, 0, 230, 0.04)',
        tension: 0.38,
        pointBackgroundColor: '#a800e6',
        pointHoverRadius: 6,
        fill: true,
      },
    ],
  };

  // Bar chart configuration array mapping Orders counts
  const ordersData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Orders Per Day',
        data: [45, 52, 49, 63, 58, 71, 44],
        backgroundColor: '#e62490',
        borderRadius: 4,
        barThickness: 16,
      },
    ],
  };

  const genericOptions = (stepSize: number) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: '#f3f4f6' }, ticks: { stepSize, color: '#9ca3af' } },
      x: { grid: { display: false }, ticks: { color: '#9ca3af' } },
    },
  });

  return (
    <div className="row g-4">
      <div className="col-12 col-xl-6">
        <div className="chart-card-wrapper p-4">
          <h4 className="chart-inner-title mb-4">Monthly Revenue</h4>
          <div className="chart-canvas-container">
            <Line data={revenueData} options={genericOptions(20000)} />
          </div>
        </div>
      </div>
      <div className="col-12 col-xl-6">
        <div className="chart-card-wrapper p-4">
          <h4 className="chart-inner-title mb-4">Orders Per Day</h4>
          <div className="chart-canvas-container">
            <Bar data={ordersData} options={genericOptions(20)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
