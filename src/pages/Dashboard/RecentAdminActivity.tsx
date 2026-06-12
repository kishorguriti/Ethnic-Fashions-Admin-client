import React from "react";
import { List, Avatar } from "antd";

// TypeScript schema interface defining an activity element entry
interface AdminActivityItem {
  id: number;
  adminInitial: string;
  actionText: string;
  targetItem: string;
  timestamp: string;
}

const RecentAdminActivity: React.FC = () => {
  // Dynamic system mockup array mimicking data records found in your image
  const activities: AdminActivityItem[] = [
    {
      id: 1,
      adminInitial: "A",
      actionText: "Admin Updated product:",
      targetItem: "Kanjivaram Saree",
      timestamp: "10 min ago",
    },
    {
      id: 2,
      adminInitial: "A",
      actionText: "Admin Added new category:",
      targetItem: "Temple Jewellery",
      timestamp: "1 hour ago",
    },
    {
      id: 3,
      adminInitial: "A",
      actionText: "Admin Processed refund for order",
      targetItem: "#2443",
      timestamp: "2 hours ago",
    },
    {
      id: 4,
      adminInitial: "A",
      actionText: "Admin Created promotional",
      targetItem: "campaign",
      timestamp: "3 hours ago",
    },
  ];

  return (
    <div className="row g-4">
      <div className="col-12 col-xl-8"></div>
      <div className="col-12 col-xl-4">
        <div className="recent-admin-activity-card w-100">
          {/* Visual Header Block containing custom tinted pink header background strip */}
          <div className="activity-card-header px-4 py-3">
            <h3 className="header-title-text mb-0">Recent Admin Activity</h3>
          </div>

          {/* Dynamic item stream body wrapper area */}
          <div className="activity-card-body px-4 py-3">
            <List
              itemLayout="horizontal"
              dataSource={activities}
              renderItem={(item) => (
                <List.Item className="activity-list-item border-0 py-3 px-0">
                  <List.Item.Meta
                    avatar={
                      <Avatar className="admin-avatar-pink d-flex align-items-center justify-content-center fw-bold">
                        {item.adminInitial}
                      </Avatar>
                    }
                    title={
                      <div className="activity-text-wrapper">
                        <span className="action-base-text">
                          {item.actionText}{" "}
                        </span>
                        <span className="action-target-bold">
                          {item.targetItem}
                        </span>
                      </div>
                    }
                    description={
                      <span className="activity-timestamp-lbl d-block mt-1">
                        {item.timestamp}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentAdminActivity;
