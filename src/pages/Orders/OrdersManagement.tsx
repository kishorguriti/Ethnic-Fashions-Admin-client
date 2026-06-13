import React, { useState } from "react";
import { Button, Input, Select, message } from "antd";
import {
  DownloadOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import OrdersTable from "./OrdersTable";

// TypeScript schema interfaces defining mock metrics
interface OrderMetricCard {
  id: number;
  title: string;
  count: number;
  subText: string;
  accentClass: string; // Dynamic mapping for specific font colors from image
}

const OrdersManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [orderStatusFilter, setOrderStatusFilter] =
    useState<string>("All Orders");
  const [exportLoading, setExportLoading] = useState<boolean>(false);

  // Static KPI metadata parameters matching image text variables exactly
  const summaryMetrics: OrderMetricCard[] = [
    {
      id: 1,
      title: "Total Orders",
      count: 245,
      subText: "+12% from last month",
      accentClass: "accent-black",
    },
    {
      id: 2,
      title: "Pending",
      count: 28,
      subText: "Requires attention",
      accentClass: "accent-orange",
    },
    {
      id: 3,
      title: "Processing",
      count: 42,
      subText: "Being prepared",
      accentClass: "accent-blue",
    },
    {
      id: 4,
      title: "Delivered",
      count: 175,
      subText: "Successfully completed",
      accentClass: "accent-green",
    },
  ];

  // Action download simulation trigger
  const handleExportOrders = async () => {
    setExportLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      message.success("Orders dataset exported successfully as CSV!");
    } catch {
      message.error("Export routine failed. Try again.");
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="orders-management-dashboard container-fluid p-4">
      {/* Pinned Top Heading Strip */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <h1 className="main-section-title mb-1">Orders</h1>
          <p className="sub-section-desc text-muted mb-0">
            Manage and track customer orders
          </p>
        </div>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          loading={exportLoading}
          onClick={handleExportOrders}
          className="export-orders-brand-btn d-inline-flex align-items-center justify-content-center"
        >
          Export Orders
        </Button>
      </div>

      {/* Row Block: Upper Metrics Flex Summary Layout Grid */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-4 mb-4">
        {summaryMetrics.map((card) => (
          <div className="col" key={card.id}>
            <div className="order-kpi-surface-card p-4 d-flex flex-column justify-content-between h-100">
              <span className="kpi-card-title text-muted d-block mb-2">
                {card.title}
              </span>
              <h2 className={`kpi-card-numeric mb-2 ${card.accentClass}`}>
                {card.count}
              </h2>
              {/* Check if first card to apply custom trend green highlight matching design */}
              <span
                className={`kpi-card-subtext ${card.id === 1 ? "trend-green-txt" : ""}`}
              >
                {card.subText}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Control Filter Options Dynamic Toolbar Container Strip */}
      <div className="filter-controls-card p-3 d-flex flex-column flex-md-row justify-content-between gap-3 align-items-stretch align-items-md-center">
        <Input
          placeholder="Search by order ID or customer name..."
          prefix={<SearchOutlined className="search-icon-dimmed" />}
          className="search-input-field flex-grow-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="d-flex align-items-center gap-2 flex-wrap flex-sm-nowrap">
          <Select
            value={orderStatusFilter}
            onChange={(val) => setOrderStatusFilter(val)}
            className="toolbar-select-dropdown"
            options={[
              { value: "All Orders", label: "All Orders" },
              { value: "Pending", label: "Pending" },
              { value: "Processing", label: "Processing" },
              { value: "Delivered", label: "Delivered" },
            ]}
          />
          <Button icon={<FilterOutlined />} className="more-filters-action-btn">
            More Filters
          </Button>
        </div>
      </div>
      <OrdersTable />
    </div>
  );
};

export default OrdersManagement;
