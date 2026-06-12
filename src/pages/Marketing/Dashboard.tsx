import React, { useState } from "react";
import Coupons from "./Coupons";
import EmailCampaignsDashboard from "./EmailCampaigns";
import BannersPromotions from "./BannersPromotions";

const MarketingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<any>(0);

  return (
    <div className="marketing-dashboard-extension container-fluid p-4">
      {/* 1. Header Information Panel Title Area Block */}
      <div className="marketing-section-header mb-4">
        <h1 className="main-dashboard-title mb-1">Marketing</h1>
        <p className="subtitle-desc text-muted mb-0">
          Manage promotions, coupons and campaigns
        </p>
      </div>

      {/* 2. Top Navigation Sub-menu Tabs Strip */}
      <div className="dashboard-subnav-strip d-flex gap-2 align-items-center p-2 mb-4">
        {["Coupons", "Email Campaigns", "Banners & Promotions"].map(
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
      {activeTab === 0 && <Coupons />}
      {activeTab === 1 && <EmailCampaignsDashboard />}
      {activeTab === 2 && <BannersPromotions />}
    </div>
  );
};

export default MarketingDashboard;
