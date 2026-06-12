import React, { useState } from "react";
import { Button, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import CustomersDirectoryTable from "./CustomersTable";

// TypeScript schema defining dynamic KPI layout cards data structures
interface CustomerMetric {
  id: number;
  title: string;
  value: string | number;
  subText: string;
  themeClass: "theme-black" | "theme-purple" | "theme-blue" | "theme-green";
}

const CustomersSummary: React.FC = () => {
  const [campaignLoading, setCampaignLoading] = useState<boolean>(false);

  // Dynamic values extracted exactly from your design image reference
  const metrics: CustomerMetric[] = [
    {
      id: 1,
      title: "Total Customers",
      value: "3,842",
      subText: "+24 this week",
      themeClass: "theme-black",
    },
    {
      id: 2,
      title: "VIP Customers",
      value: "284",
      subText: "Top spenders",
      themeClass: "theme-purple",
    },
    {
      id: 3,
      title: "New This Month",
      value: "156",
      subText: "+18% vs last month",
      themeClass: "theme-blue",
    },
    {
      id: 4,
      title: "Average Order Value",
      value: "₹4,280",
      subText: "Per customer",
      themeClass: "theme-green",
    },
  ];

  // Action email handler mock trigger routine
  const handleSendCampaign = async () => {
    setCampaignLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      message.success("Email campaign dispatcher initiated successfully!");
    } catch {
      message.error("Failed to trigger campaign routine.");
    } finally {
      setCampaignLoading(false);
    }
  };

  return (
    <div className="customers-summary-container container-fluid p-4">
      {/* 1. Header Row Panel with Pinned Action Button */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div className="title-group">
          <h1 className="main-section-title mb-1">Customers</h1>
          <p className="sub-section-desc text-muted mb-0">
            Manage your customer database
          </p>
        </div>
        <Button
          type="primary"
          icon={<MailOutlined />}
          loading={campaignLoading}
          onClick={handleSendCampaign}
          className="send-campaign-brand-btn d-inline-flex align-items-center justify-content-center"
          size="large"
        >
          Send Email Campaign
        </Button>
      </div>

      {/* 2. Responsive Grid Block Row: Core Metric Surface Panels */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-4">
        {metrics.map((card) => (
          <div className="col" key={card.id}>
            <div className="kpi-surface-card p-4 d-flex flex-column justify-content-between h-100">
              <div className="card-top">
                <span className="kpi-card-title text-muted d-block mb-2">
                  {card.title}
                </span>
                <h2 className={`kpi-card-numeric mb-2 ${card.themeClass}`}>
                  {card.value}
                </h2>
              </div>
              <div className="card-bottom">
                <span
                  className={`kpi-card-subtext ${card.id === 1 ? "highlight-trend-up" : ""}`}
                >
                  {card.subText}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <CustomersDirectoryTable />
    </div>
  );
};

export default CustomersSummary;
