import React, { useState } from "react";
import { Button, Card, Switch, message } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
// Type declarations

interface BannerItem {
  id: string;
  title: string;
  category: string;
  views: number;
  isActive: boolean;
}

const initialBanners: BannerItem[] = [
  {
    id: "1",
    title: "Festival Sale 2026",
    category: "Homepage Hero",
    views: 12450,
    isActive: true,
  },
  {
    id: "2",
    title: "New Arrivals",
    category: "Category Page",
    views: 8920,
    isActive: true,
  },
  {
    id: "3",
    title: "Summer Collection",
    category: "Homepage Secondary",
    views: 4560,
    isActive: false,
  },
];

const HomepageBanners = () => {
  const [banners, setBanners] = useState<BannerItem[]>(initialBanners);

  // Dynamic Event Handlers
  const handleToggleActive = (id: string, checked: boolean) => {
    setBanners((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isActive: checked } : item,
      ),
    );
    message.info(`Banner status changed to ${checked ? "Active" : "Inactive"}`);
  };

  const handleEdit = (title: string) => {
    message.info(`Editing: ${title}`);
  };

  const handleDelete = (id: string, title: string) => {
    setBanners((prev) => prev.filter((item) => item.id !== id));
    message.error(`Deleted banner: ${title}`);
  };

  const handleAddBanner = () => {
    message.success("Open Add Banner wizard window");
  };
  return (
    <>
      {/* Action Row */}
      <div className="d-flex justify-content-end mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="btn-purple-action"
          onClick={handleAddBanner}
        >
          Add Banner
        </Button>
      </div>

      {/* Grid Layout Container */}
      <div className="row g-4">
        {banners.map((banner) => (
          <div key={banner.id} className="col-12 col-md-6 col-lg-4">
            <Card className="cms-card h-100 p-0" bordered={true}>
              {/* Aspect Ratio Image Placeholder matching layout gradient background */}
              <div className="card-image-placeholder d-flex align-items-center justify-content-center">
                <EyeOutlined className="placeholder-eye-icon" />
              </div>

              {/* Body Content Area */}
              <div className="p-4 card-body-section">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <h3 className="card-item-title m-0">{banner.title}</h3>
                  <Switch
                    checked={banner.isActive}
                    onChange={(checked) =>
                      handleToggleActive(banner.id, checked)
                    }
                    className="custom-toggle-switch"
                  />
                </div>
                <span className="card-item-category d-block mb-3 text-muted-custom">
                  {banner.category}
                </span>
                <span className="card-item-views text-muted-custom d-flex align-items-center gap-1">
                  <EyeOutlined className="meta-icon" />{" "}
                  {banner.views.toLocaleString()} views
                </span>
              </div>

              {/* Operational Footer Buttons Group */}
              <div className="card-actions-footer p-3 d-flex gap-2">
                <Button
                  icon={<EditOutlined />}
                  className="btn-action-edit flex-grow-1"
                  onClick={() => handleEdit(banner.title)}
                >
                  Edit
                </Button>
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  className="btn-action-delete"
                  onClick={() => handleDelete(banner.id, banner.title)}
                />
              </div>
            </Card>
          </div>
        ))}
      </div>
    </>
  );
};

export default HomepageBanners;
