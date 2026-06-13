import React, { useState } from "react";
import { Table, Button, Tag, message } from "antd";
import { MailOutlined, EyeOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

// TypeScript schema interfaces defining email campaigns
interface CampaignMetricCard {
  id: number;
  title: string;
  value: string | number;
  subText: string;
  colorClass: "text-dark" | "text-purple" | "text-green";
}

interface CampaignRecord {
  key: string;
  name: string;
  type: "Email" | "SMS" | "Push";
  sent: number;
  openedCount: number;
  openedPct: number;
  clickedCount: number;
  clickedPct: number;
  date: string;
  status: "Completed" | "Scheduled" | "Draft";
}

const EmailCampaignsDashboard: React.FC = () => {
  // 1. Core Summary Telemetry Data cards
  const summaryMetrics: CampaignMetricCard[] = [
    {
      id: 1,
      title: "Total Campaigns",
      value: 24,
      subText: "All time",
      colorClass: "text-dark",
    },
    {
      id: 2,
      title: "Average Open Rate",
      value: "58.4%",
      subText: "Industry avg: 45%",
      colorClass: "text-purple",
    },
    {
      id: 3,
      title: "Average Click Rate",
      value: "22.3%",
      subText: "Industry avg: 18%",
      colorClass: "text-green",
    },
  ];

  // 2. Dynamic state pre-filled with data rows visible in your image
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([
    {
      key: "1",
      name: "Spring Festival Sale",
      type: "Email",
      sent: 3842,
      openedCount: 2145,
      openedPct: 56,
      clickedCount: 856,
      clickedPct: 22,
      date: "Mar 1, 2026",
      status: "Completed",
    },
    {
      key: "2",
      name: "New Arrival Alert",
      type: "Email",
      sent: 2500,
      openedCount: 1580,
      openedPct: 63,
      clickedCount: 420,
      clickedPct: 17,
      date: "Mar 3, 2026",
      status: "Completed",
    },
    {
      key: "3",
      name: "VIP Customer Exclusive",
      type: "Email",
      sent: 284,
      openedCount: 215,
      openedPct: 76,
      clickedCount: 98,
      clickedPct: 35,
      date: "Mar 5, 2026",
      status: "Scheduled",
    },
  ]);

  const handleCreateCampaign = () => {
    message.success("Opening New Campaign Builder overlay Wizard!");
  };

  const handleViewReport = (name: string) => {
    message.info(`Loading performance metrics report for: ${name}`);
  };

  // 3. Ant Design Dynamic Column Schema Configuration
  const columns: ColumnsType<CampaignRecord> = [
    {
      title: "Campaign Name",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <strong className="campaign-title-label text-dark">{text}</strong>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (text) => (
        <span className="text-secondary fw-medium">{text}</span>
      ),
    },
    {
      title: "Sent",
      dataIndex: "sent",
      key: "sent",
      render: (num) => (
        <span className="text-secondary fw-medium">
          {num.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      title: "Opened",
      key: "opened",
      render: (_, record) => (
        <span className="text-dark fw-medium">
          {record.openedCount.toLocaleString("en-IN")}{" "}
          <span className="rate-pct text-muted">({record.openedPct}%)</span>
        </span>
      ),
    },
    {
      title: "Clicked",
      key: "clicked",
      render: (_, record) => (
        <span className="text-dark fw-medium">
          {record.clickedCount.toLocaleString("en-IN")}{" "}
          <span className="rate-pct text-muted">({record.clickedPct}%)</span>
        </span>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text) => <span className="text-muted fw-medium">{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: CampaignRecord["status"]) => {
        const badgeStyle =
          status === "Completed"
            ? "status-pill-completed"
            : "status-pill-scheduled";
        return (
          <Tag className={`campaign-tag-badge ${badgeStyle}`}>{status}</Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          className="view-report-action-btn d-inline-flex align-items-center justify-content-center"
          onClick={() => handleViewReport(record.name)}
        >
          View Report
        </Button>
      ),
    },
  ];

  return (
    <div className="email-campaigns-dashboard p-2">
      {/* Upper Create Action Placement Strip Row */}
      <div className="d-flex justify-content-end mb-4">
        <Button
          type="primary"
          icon={<MailOutlined />}
          onClick={handleCreateCampaign}
          className="new-campaign-brand-btn px-4 py-2 d-inline-flex align-items-center justify-content-center fw-bold"
          size="large"
        >
          New Campaign
        </Button>
      </div>

      {/* KPI Performance Metrics Overview Grid Deck (Bootstrap 5 columns) */}
      <div className="row g-4 mb-5">
        {summaryMetrics.map((card) => (
          <div className="col-12 col-md-4" key={card.id}>
            <div className="metric-surface-card p-4 d-flex flex-column justify-content-between h-100">
              <span className="kpi-title-text text-muted d-block mb-2">
                {card.title}
              </span>
              <h2 className={`kpi-numeric-value mb-2 ${card.colorClass}`}>
                {card.value}
              </h2>
              <span className="kpi-sub-lbl text-muted small">
                {card.subText}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Campaign Performance Records Data Table Card Panel Wrapper */}
      <div className="campaigns-table-card border bg-white rounded-3 overflow-hidden">
        <Table
          columns={columns}
          dataSource={campaigns}
          pagination={false}
          scroll={{ x: "max-content" }}
          className="custom-campaigns-data-grid"
          //   responsive={true}
        />
      </div>
    </div>
  );
};

export default EmailCampaignsDashboard;
