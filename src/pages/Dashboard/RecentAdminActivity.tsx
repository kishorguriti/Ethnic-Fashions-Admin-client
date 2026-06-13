import React, { useEffect, useState } from "react";
import { List, Avatar, message } from "antd";
import { getRecentActivity, type ActivityLogEntry } from "../../services/adminApi";

const getRelativeTime = (dateString: string): string => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
};

const RecentAdminActivity: React.FC = () => {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await getRecentActivity(10);
        setActivities(res.data.data);
      } catch {
        message.error("Failed to load recent admin activity.");
      }
    };
    fetchActivity();
  }, []);

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
              locale={{ emptyText: "No recent activity yet." }}
              renderItem={(item) => (
                <List.Item className="activity-list-item border-0 py-3 px-0">
                  <List.Item.Meta
                    avatar={
                      <Avatar className="admin-avatar-pink d-flex align-items-center justify-content-center fw-bold">
                        {item.adminName?.charAt(0).toUpperCase() || "A"}
                      </Avatar>
                    }
                    title={
                      <div className="activity-text-wrapper">
                        <span className="action-base-text">
                          {item.adminName} {item.action}:{" "}
                        </span>
                        <span className="action-target-bold">
                          {item.targetName}
                        </span>
                      </div>
                    }
                    description={
                      <span className="activity-timestamp-lbl d-block mt-1">
                        {getRelativeTime(item.createdAt)}
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
