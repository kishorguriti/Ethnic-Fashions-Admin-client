import React, { useState } from "react";
import { message } from "antd";
import {
  BellOutlined,
  MailOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import SendNotification from "./SendNotification";
import NotificationHistory from "./NotificationHistory";
import TemplateGrid from "./Templates";

export const NotificationManagement: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [activeTab, setActiveTab] = useState<any>(0);

  // Live preview dynamic state hooks

  return (
    <div className="notification-dashboard py-5">
      {contextHolder}
      <div className="container">
        {/* Top Header Row */}
        <div className="row mb-4">
          <div className="col-12 dashboard-header">
            <h1>Notification Management</h1>
            <p>Send and manage customer notifications</p>
          </div>
        </div>

        {/* Dynamic Metric Grid cards */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="stat-card">
              <div className="d-flex align-items-center">
                <BellOutlined style={{ color: "#3182CE", fontSize: "18px" }} />
                <span className="stat-label">Total Sent</span>
              </div>
              <div className="stat-value">15,482</div>
              <div className="stat-subtext">This month</div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="stat-card">
              <div className="d-flex align-items-center">
                <MailOutlined style={{ color: "#38A169", fontSize: "18px" }} />
                <span className="stat-label">Open Rate</span>
              </div>
              <div className="stat-value">72.4%</div>
              <div className="stat-subtext positive">+5.2% vs last month</div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="stat-card">
              <div className="d-flex align-items-center">
                <PhoneOutlined style={{ color: "#805AD5", fontSize: "18px" }} />
                <span className="stat-label">Push Subscribers</span>
              </div>
              <div className="stat-value">2,845</div>
              <div className="stat-subtext">Active subscribers</div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="stat-card">
              <div className="d-flex align-items-center">
                <ClockCircleOutlined
                  style={{ color: "#DD6B20", fontSize: "18px" }}
                />
                <span className="stat-label">Scheduled</span>
              </div>
              <div className="stat-value">8</div>
              <div className="stat-subtext">Pending delivery</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}

        <div className="dashboard-subnav-strip d-flex gap-2 align-items-center p-2 mb-4">
          {["Send Notification", "Notification History", "Templates"].map(
            (tab, i: any) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`subnav-pill border-0 px-3 py-1.5 fw-semibold ${activeTab === i ? "active" : ""}`}
              >
                {tab}
              </button>
            ),
          )}
        </div>
        {activeTab === 0 && <SendNotification messageApi={messageApi} />}
        {activeTab === 1 && <NotificationHistory />}
      {activeTab === 2 && <TemplateGrid />}

        {/* Bottom Configuration Interface Split */}
      </div>
    </div>
  );
};
