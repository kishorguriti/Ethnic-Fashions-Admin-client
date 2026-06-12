import React, { useState } from "react";

import HomepageBanners from "./HomepageBanners";
import ArticleTable from "./Articles";
import FAQTable from "./FAQTable";
import StaticPagesTable from "./StaticPagesTable";
// Type declarations

const CMSManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<any>(0);
  return (
    <div className="container cms-dashboard">
      {/* Header Info Block */}
      <header className="mb-4">
        <h1 className="cms-title">CMS / Content Management</h1>
        <p className="cms-subtitle text-muted-custom">
          Manage website content and pages
        </p>
      </header>

      <div className="dashboard-subnav-strip d-flex gap-2 align-items-center p-2 mb-4">
        {["Homepage Banners", "Blog Articles", "FAQs", "Static Pages"].map(
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
      {activeTab === 0 && <HomepageBanners />}
      {activeTab === 1 && <ArticleTable />}
      {activeTab === 2 && <FAQTable />}
      {activeTab === 3 && <StaticPagesTable />}

    </div>
  );
};

export default CMSManager;
