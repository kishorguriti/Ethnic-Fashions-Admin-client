import React, { useEffect, useState } from "react";
import { Button, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import {
  getRevenueSummary,
  type RevenueSummary,
} from "../../services/revenueApi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import FinancialLedgers from "./RecentTransactionsAndRefunds";

// Register ChartJS elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

// TypeScript Interface schemas
interface MetricCard {
  id: number;
  title: string;
  value: string;
  subText: string;
  iconText: string;
  typeClass: "green" | "blue" | "orange" | "red";
}

const RevenuePaymentsDashboard: React.FC = () => {
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<RevenueSummary | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getRevenueSummary();
        setSummary(res.data.data);
      } catch {
        message.error("Failed to load revenue summary.");
      }
    })();
  }, []);

  const rupees = (n: number) => `₹${(n ?? 0).toLocaleString("en-IN")}`;

  // Telemetry metric summary cards populated from live revenue summary
  const metrics: MetricCard[] = [
    {
      id: 1,
      title: "Total Revenue",
      value: rupees(summary?.totalRevenue ?? 0),
      subText: "+12.5% from last month",
      iconText: "＄",
      typeClass: "green",
    },
    {
      id: 2,
      title: "This Month",
      value: rupees(summary?.thisMonthRevenue ?? 0),
      subText: `${summary?.thisMonthOrders ?? 0} orders`,
      iconText: "📈",
      typeClass: "blue",
    },
    {
      id: 3,
      title: "Pending Payments",
      value: rupees(summary?.pendingPayments ?? 0),
      subText: `${summary?.pendingPaymentsOrders ?? 0} orders`,
      iconText: "💳",
      typeClass: "orange",
    },
    {
      id: 4,
      title: "Refunds (Month)",
      value: rupees(summary?.refundsMonth ?? 0),
      subText: `${summary?.refundsCount ?? 0} refunds`,
      iconText: "🔄",
      typeClass: "red",
    },
  ];

  // Simulated export routine pipeline
  const handleExportReport = async () => {
    setExportLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      message.success(
        "Financial revenue summary report generated and ready for download!",
      );
    } catch {
      message.error("Export routine error, please verify session.");
    } finally {
      setExportLoading(false);
    }
  };

  // Derive labels + values from the live summary (fallback to empty)
  const revenueLabels = summary?.monthlyRevenue.map((p) => p.label) ?? [];
  const revenueValues = summary?.monthlyRevenue.map((p) => p.value) ?? [];
  const ordersLabels = summary?.monthlyOrders.map((p) => p.label) ?? [];
  const ordersValues = summary?.monthlyOrders.map((p) => p.count) ?? [];

  // Compute a clean y-axis max/step so live data isn't clipped
  const axisFor = (values: number[]) => {
    const raw = values.length ? Math.max(...values) : 0;
    const max = raw <= 0 ? 100 : Math.ceil(raw * 1.15);
    return { max, step: Math.max(1, Math.ceil(max / 4)) };
  };
  const revenueAxis = axisFor(revenueValues);
  const ordersAxis = axisFor(ordersValues);

  // 1. Monthly Revenue Trend Chart Config (Line Chart)
  const lineChartData = {
    labels: revenueLabels,
    datasets: [
      {
        label: "Revenue",
        data: revenueValues,
        borderColor: "#9333ea", // Purple line matching image line plot curve accent
        backgroundColor: "#9333ea",
        pointBorderColor: "#9333ea",
        pointBackgroundColor: "#ffffff",
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        tension: 0.35, // Smooth curve configuration
      },
    ],
  };

  // 2. Orders Trend Chart Config (Bar Chart)
  const barChartData = {
    labels: ordersLabels,
    datasets: [
      {
        label: "Orders Count",
        data: ordersValues,
        backgroundColor: "#e54394", // Pink theme tone from the image vertical column blocks
        borderRadius: 2,
        barThickness: 34,
      },
    ],
  };

  const chartOptions = (maxTicks: number, stepSize: number) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        min: 0,
        max: maxTicks,
        ticks: { stepSize, color: "#9ca3af", font: { size: 12 } },
        grid: { color: "#f3f4f6", drawTicks: false },
      },
      x: {
        ticks: { color: "#4b5563", font: { size: 13, weight: 500 } },
        grid: { display: false },
      },
    },
  });

  return (
    <div className="revenue-payments-panel container-fluid p-4">
      {/* SECTION A: Dashboard Heading Header Row Block */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <h1 className="main-panel-title mb-1">Revenue & Payments</h1>
          <p className="sub-panel-desc text-muted mb-0">
            Track revenue, payments and refunds
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

      {/* SECTION B: Core Metric Telemetry Counters Flex Row Grid */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-4 mb-4">
        {metrics.map((card) => (
          <div className="col" key={card.id}>
            <div className="telemetry-surface-card p-4 d-flex align-items-start gap-3 h-100">
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
                  className={`card-trend-footnote ${card.typeClass === "green" ? "trend-up-green" : ""}`}
                >
                  {card.subText}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION C: Graphical Analytics Trend Canvas Row Blocks */}
      <div className="row g-4">
        {/* Monthly Revenue Trend Line Wrapper Card */}
        <div className="col-12 col-xl-6">
          <div className="chart-analytics-card p-4 bg-white">
            <h3 className="chart-inner-title mb-4">Monthly Revenue Trend</h3>
            <div className="chart-canvas-box">
              <Line
                data={lineChartData}
                options={chartOptions(revenueAxis.max, revenueAxis.step)}
              />
            </div>
          </div>
        </div>

        {/* Orders Trend Column Bar Wrapper Card */}
        <div className="col-12 col-xl-6">
          <div className="chart-analytics-card p-4 bg-white">
            <h3 className="chart-inner-title mb-4">Orders Trend</h3>
            <div className="chart-canvas-box">
              <Bar
                data={barChartData}
                options={chartOptions(ordersAxis.max, ordersAxis.step)}
              />
            </div>
          </div>
        </div>
      </div>
      <FinancialLedgers />
    </div>
  );
};

export default RevenuePaymentsDashboard;
