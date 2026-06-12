import React, { useState } from "react";
import { Button, List, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import GrowthTrafficDashboard from "./GrowthTraffic";

// Register ChartJS elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

// TypeScript Interface schemas
interface KPICard {
  id: number;
  title: string;
  value: string;
  subText: string;
  iconText: string;
  typeClass: "green" | "blue" | "orange" | "purple";
}

interface CategoryBreakdown {
  name: string;
  percentage: number;
  revenue: string;
  color: string;
}

const AnalyticsDashboard: React.FC = () => {
  const [exportLoading, setExportLoading] = useState<boolean>(false);

  // Telemetry metric summary data items extracted from your image structure
  const kpiMetrics: KPICard[] = [
    {
      id: 1,
      title: "Conversion Rate",
      value: "3.8%",
      subText: "+0.5% from last month",
      iconText: "📈",
      typeClass: "green",
    },
    {
      id: 2,
      title: "Page Views",
      value: "145,842",
      subText: "This month",
      iconText: "👁️",
      typeClass: "blue",
    },
    {
      id: 3,
      title: "Cart Abandonment",
      value: "68.2%",
      subText: "+2.1% from last month",
      iconText: "🛒",
      typeClass: "orange",
    },
    {
      id: 4,
      title: "Avg. Session Duration",
      value: "4m 32s",
      subText: "+18s from last month",
      iconText: "⏱️",
      typeClass: "purple",
    },
  ];

  // Revenue Breakdown List Data Source
  const categoriesData: CategoryBreakdown[] = [
    { name: "Sarees", percentage: 45, revenue: "₹3,42,000", color: "#8b5cf6" },
    {
      name: "Churidars",
      percentage: 30,
      revenue: "₹2,28,000",
      color: "#ec4899",
    },
    {
      name: "Jewellery",
      percentage: 25,
      revenue: "₹1,90,000",
      color: "#6366f1",
    },
  ];

  // Simulated export routine pipeline
  const handleExportReport = async () => {
    setExportLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      message.success(
        "Analytics report summary metrics downloaded successfully!",
      );
    } catch {
      message.error("Export routine error, please verify session.");
    } finally {
      setExportLoading(false);
    }
  };

  // 1. Revenue by Category Doughnut Config
  const doughnutChartData = {
    labels: categoriesData.map((c) => c.name),
    datasets: [
      {
        data: categoriesData.map((c) => c.percentage),
        backgroundColor: categoriesData.map((c) => c.color),
        borderWidth: 0,
        cutout: "70%",
      },
    ],
  };

  // 2. Top Products by Sales Horizontal Bar Config
  const barChartData = {
    labels: [
      "Banarasi Silk Saree",
      "Gold Necklace Set",
      "Anarkali Suit",
      "Kanjivaram Saree",
      "Pearl Earrings",
    ],
    datasets: [
      {
        data: [0.88, 0.76, 0.65, 0.54, 0.42], // Scaled values matching design framework layout lines
        backgroundColor: "#ec4899", // Pink theme tone from the image vertical column blocks
        borderRadius: 4,
        barThickness: 16,
      },
    ],
  };

  return (
    <div className="analytics-view-panel container-fluid p-4">
      {/* SECTION A: Dashboard Heading Header Row Block */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <h1 className="main-panel-title mb-1">Analytics</h1>
          <p className="sub-panel-desc text-muted mb-0">
            Insights and performance metrics
          </p>
        </div>
        <Button
          icon={<DownloadOutlined />}
          loading={exportLoading}
          onClick={handleExportReport}
          className="export-report-btn d-inline-flex align-items-center justify-content-center fw-semibold"
        >
          Export Report
        </Button>
      </div>

      {/* SECTION B: Key Performance Indicators Summary Cards */}
      <h3 className="section-inner-heading mb-3">Key Performance Indicators</h3>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-4 mb-5">
        {kpiMetrics.map((card) => (
          <div className="col" key={card.id}>
            <div className="kpi-surface-card p-4 d-flex align-items-start gap-3 h-100">
              <div
                className={`icon-avatar-shell shell-${card.typeClass} d-flex align-items-center justify-content-center flex-shrink-0 fw-bold`}
              >
                {card.iconText}
              </div>
              <div className="data-stack flex-grow-1">
                <span className="card-lbl text-muted d-block mb-1">
                  {card.title}
                </span>
                <h2 className="card-numeric-value mb-1">{card.value}</h2>
                <span
                  className={`card-trend-footnote ${card.typeClass === "blue" ? "" : "colored-trend"}`}
                >
                  {card.subText}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION C: Revenue Analysis Split Section Charts */}
      <h3 className="section-inner-heading mb-3">Revenue Analysis</h3>
      <div className="row g-4">
        {/* Revenue by Category Doughnut Card Layout */}
        <div className="col-12 col-xl-5">
          <div className="analytics-chart-card p-4 bg-white d-flex flex-column justify-content-between">
            <h4 className="chart-inner-title mb-4">Revenue by Category</h4>
            <div className="chart-canvas-box d-flex justify-content-center align-items-center mb-4 position-relative">
              <div className="doughnut-sizing-container">
                <Doughnut
                  data={doughnutChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>

            {/* Legend List Stack Mapped to Design Layout Specifications */}
            <List
              dataSource={categoriesData}
              renderItem={(item) => (
                <List.Item className="legend-list-row border-0 px-3 py-2 mb-2 rounded-2">
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="legend-dot"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="legend-name">{item.name}</span>
                  </div>
                  <strong className="legend-revenue">{item.revenue}</strong>
                </List.Item>
              )}
            />
          </div>
        </div>

        {/* Top Products Horizontal Bar Chart Layout */}
        <div className="col-12 col-xl-7">
          <div className="analytics-chart-card p-4 bg-white">
            <h4 className="chart-inner-title mb-4">Top Products by Sales</h4>
            <div className="chart-canvas-box vertical-bar-canvas">
              <Bar
                data={barChartData}
                options={{
                  indexAxis: "y" as const,
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: {
                      min: 0,
                      max: 1,
                      ticks: { stepSize: 0.25, color: "#9ca3af" },
                      grid: { color: "#f3f4f6" },
                    },
                    y: {
                      ticks: { color: "#4b5563", font: { size: 13 } },
                      grid: { display: false },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <GrowthTrafficDashboard />
    </div>
  );
};

export default AnalyticsDashboard;
