import React, { useEffect, useState } from "react";
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
import {
  getAnalyticsSummary,
  getWishlistByCategory,
  getCartInsights,
  type DashboardSummary,
  type WishlistCategoryShare,
  type CartInsight,
} from "../../services/analyticsApi";

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

const CATEGORY_COLORS = ["#8b5cf6", "#ec4899", "#6366f1", "#10b981", "#f59e0b"];

const AnalyticsDashboard: React.FC = () => {
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [wishlistCategories, setWishlistCategories] = useState<WishlistCategoryShare[]>([]);
  const [topCarted, setTopCarted] = useState<CartInsight[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, categoryRes, cartRes] = await Promise.all([
          getAnalyticsSummary(),
          getWishlistByCategory(5),
          getCartInsights(5),
        ]);
        setSummary(summaryRes.data.data);
        setWishlistCategories(categoryRes.data.data);
        setTopCarted(cartRes.data.data);
      } catch {
        message.error("Failed to load analytics data.");
      }
    };
    fetchData();
  }, []);

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

  // 1. Wishlist by Category Doughnut Config
  const doughnutChartData = {
    labels: wishlistCategories.map((c) => c.name),
    datasets: [
      {
        data: wishlistCategories.map((c) => c.percentage),
        backgroundColor: wishlistCategories.map((_, i) => CATEGORY_COLORS[i % CATEGORY_COLORS.length]),
        borderWidth: 0,
        cutout: "70%",
      },
    ],
  };

  // 2. Top Carted Products Horizontal Bar Config
  const maxCartCount = Math.max(1, ...topCarted.map((p) => p.cartCount));
  const barChartData = {
    labels: topCarted.map((p) => p.name),
    datasets: [
      {
        data: topCarted.map((p) => p.cartCount / maxCartCount),
        backgroundColor: "#ec4899",
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
        <div className="col">
          <div className="kpi-surface-card p-4 d-flex align-items-start gap-3 h-100">
            <div className="icon-avatar-shell shell-purple d-flex align-items-center justify-content-center flex-shrink-0 fw-bold">
              ❤️
            </div>
            <div className="data-stack flex-grow-1">
              <span className="card-lbl text-muted d-block mb-1">Total Wishlisted Items</span>
              <h2 className="card-numeric-value mb-1">{summary ? summary.totalWishlisted.toLocaleString("en-IN") : "—"}</h2>
              <span className="card-trend-footnote">Across all customers</span>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="kpi-surface-card p-4 d-flex align-items-start gap-3 h-100">
            <div className="icon-avatar-shell shell-blue d-flex align-items-center justify-content-center flex-shrink-0 fw-bold">
              🛒
            </div>
            <div className="data-stack flex-grow-1">
              <span className="card-lbl text-muted d-block mb-1">Total Carted Items</span>
              <h2 className="card-numeric-value mb-1">{summary ? summary.totalCarted.toLocaleString("en-IN") : "—"}</h2>
              <span className="card-trend-footnote">Across all customers</span>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="kpi-surface-card p-4 d-flex align-items-start gap-3 h-100">
            <div className="icon-avatar-shell shell-green d-flex align-items-center justify-content-center flex-shrink-0 fw-bold">
              ⭐
            </div>
            <div className="data-stack flex-grow-1">
              <span className="card-lbl text-muted d-block mb-1">Top Wishlisted Product</span>
              <h2 className="card-numeric-value mb-1" style={{ fontSize: "1.1rem" }}>
                {summary?.topWishlisted?.name || "—"}
              </h2>
              <span className="card-trend-footnote">
                {summary?.topWishlisted ? `${summary.topWishlisted.count} wishlists` : "No data yet"}
              </span>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="kpi-surface-card p-4 d-flex align-items-start gap-3 h-100">
            <div className="icon-avatar-shell shell-orange d-flex align-items-center justify-content-center flex-shrink-0 fw-bold">
              🏆
            </div>
            <div className="data-stack flex-grow-1">
              <span className="card-lbl text-muted d-block mb-1">Top Carted Product</span>
              <h2 className="card-numeric-value mb-1" style={{ fontSize: "1.1rem" }}>
                {summary?.topCarted?.name || "—"}
              </h2>
              <span className="card-trend-footnote">
                {summary?.topCarted ? `${summary.topCarted.count} carts` : "No data yet"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION C: Engagement Analysis Split Section Charts */}
      <h3 className="section-inner-heading mb-3">Engagement Analysis</h3>
      <div className="row g-4">
        {/* Wishlist by Category Doughnut Card Layout */}
        <div className="col-12 col-xl-5">
          <div className="analytics-chart-card p-4 bg-white d-flex flex-column justify-content-between">
            <h4 className="chart-inner-title mb-4">Wishlist by Category</h4>
            <div className="chart-canvas-box d-flex justify-content-center align-items-center mb-4 position-relative">
              <div className="doughnut-sizing-container">
                {wishlistCategories.length > 0 ? (
                  <Doughnut
                    data={doughnutChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                    }}
                  />
                ) : (
                  <span className="text-muted">No wishlist activity yet.</span>
                )}
              </div>
            </div>

            {/* Legend List Stack Mapped to Design Layout Specifications */}
            <List
              dataSource={wishlistCategories}
              renderItem={(item, index) => (
                <List.Item className="legend-list-row border-0 px-3 py-2 mb-2 rounded-2">
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="legend-dot"
                      style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                    />
                    <span className="legend-name">{item.name}</span>
                  </div>
                  <strong className="legend-revenue">{item.count} ({item.percentage}%)</strong>
                </List.Item>
              )}
            />
          </div>
        </div>

        {/* Top Carted Products Horizontal Bar Chart Layout */}
        <div className="col-12 col-xl-7">
          <div className="analytics-chart-card p-4 bg-white">
            <h4 className="chart-inner-title mb-4">Top Carted Products</h4>
            <div className="chart-canvas-box vertical-bar-canvas">
              {topCarted.length > 0 ? (
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
              ) : (
                <span className="text-muted">No cart activity yet.</span>
              )}
            </div>
          </div>
        </div>
      </div>
      <GrowthTrafficDashboard />
    </div>
  );
};

export default AnalyticsDashboard;
