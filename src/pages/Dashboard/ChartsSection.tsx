import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { message } from 'antd';
import { getCustomerGrowth, getNewCustomersDaily, type GrowthPoint } from '../../services/analyticsApi';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const ChartsSection: React.FC = () => {
  const [customerGrowth, setCustomerGrowth] = useState<GrowthPoint[]>([]);
  const [newCustomersDaily, setNewCustomersDaily] = useState<GrowthPoint[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [growthRes, dailyRes] = await Promise.all([
          getCustomerGrowth(),
          getNewCustomersDaily(),
        ]);
        setCustomerGrowth(growthRes.data.data);
        setNewCustomersDaily(dailyRes.data.data);
      } catch {
        message.error('Failed to load chart data.');
      }
    };
    fetchData();
  }, []);

  const growthData = {
    labels: customerGrowth.map((p) => p.label),
    datasets: [
      {
        label: 'Customer Growth',
        data: customerGrowth.map((p) => p.count),
        borderColor: '#a800e6',
        backgroundColor: 'rgba(168, 0, 230, 0.04)',
        tension: 0.38,
        pointBackgroundColor: '#a800e6',
        pointHoverRadius: 6,
        fill: true,
      },
    ],
  };

  const dailyData = {
    labels: newCustomersDaily.map((p) => p.label),
    datasets: [
      {
        label: 'New Customers Per Day',
        data: newCustomersDaily.map((p) => p.count),
        backgroundColor: '#e62490',
        borderRadius: 4,
        barThickness: 16,
      },
    ],
  };

  const genericOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: '#f3f4f6' }, ticks: { color: '#9ca3af' }, beginAtZero: true },
      x: { grid: { display: false }, ticks: { color: '#9ca3af' } },
    },
  };

  return (
    <div className="row g-4">
      <div className="col-12 col-xl-6">
        <div className="chart-card-wrapper p-4">
          <h4 className="chart-inner-title mb-4">Customer Growth</h4>
          <div className="chart-canvas-container">
            <Line data={growthData} options={genericOptions} />
          </div>
        </div>
      </div>
      <div className="col-12 col-xl-6">
        <div className="chart-card-wrapper p-4">
          <h4 className="chart-inner-title mb-4">New Customers Per Day</h4>
          <div className="chart-canvas-container">
            <Bar data={dailyData} options={genericOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
