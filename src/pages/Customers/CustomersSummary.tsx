import React, { useEffect, useState } from "react";
import { Button, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import CustomersDirectoryTable from "./CustomersTable";
import { getCustomerStats, type CustomerStats } from "../../services/customerApi";

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
  const [stats, setStats] = useState<CustomerStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getCustomerStats();
        setStats(res.data.data);
      } catch {
        message.error("Failed to load customer statistics.");
      }
    };
    fetchStats();
  }, []);

  const metrics: CustomerMetric[] = [
    {
      id: 1,
      title: "Total Customers",
      value: stats ? stats.totalCustomers.toLocaleString("en-IN") : "—",
      subText: "All registered customers",
      themeClass: "theme-black",
    },
    {
      id: 2,
      title: "New This Month",
      value: stats ? stats.newThisMonth.toLocaleString("en-IN") : "—",
      subText: "Registered this month",
      themeClass: "theme-blue",
    },
    {
      id: 3,
      title: "Verified Customers",
      value: stats ? stats.verifiedCustomers.toLocaleString("en-IN") : "—",
      subText: "Phone number verified",
      themeClass: "theme-purple",
    },
    {
      id: 4,
      title: "Saved Addresses",
      value: stats ? stats.withSavedAddress.toLocaleString("en-IN") : "—",
      subText: "Customers with an address on file",
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
                <span className="kpi-card-subtext">{card.subText}</span>
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
