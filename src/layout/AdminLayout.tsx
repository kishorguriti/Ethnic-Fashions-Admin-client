import React, { useState } from "react";
import { Input, Badge, Avatar, Dropdown, type MenuProps } from "antd";
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import Sidebar from "./Sidebar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../auth/authSlice";
import { useAppDispatch, useAppSelector } from "../hooks";

const pageTitleMap: Record<string, string> = {
  products: "Products",
  categories: "Categories",
  orders: "Orders",
  inventory: "Inventory Management",
  customers: "Customers",
  marketing: "Marketing",
  "return-and-refunds": "Returns & Refunds",
  "revenue-and-payments": "Revenue & Payments",
  analytics: "Analytics",
  settings: "Settings",
  notifications: "Notifications",
  "content-management": "Content Management",
};

const getPageTitle = (pathname: string): string => {
  if (pathname.startsWith("/products/edit/")) return "Edit Product";
  if (pathname === "/products/add-new-product") return "Add New Product";

  const segment = pathname.split("/").filter(Boolean)[0] || "";
  return pageTitleMap[segment] || segment.replaceAll("-", " ") || "Dashboard";
};

const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const adminMenuProps: MenuProps = {
    items: [
      { key: "profile", label: "My Profile" },
      { key: "settings", label: "Account Settings" },
      { type: "divider" },
      { key: "logout", label: "Logout", danger: true },
    ],
    onClick: async ({ key }) => {
      if (key === "logout") {
        await dispatch(logoutUser());
        navigate("/login");
      } else if (key === "settings") {
        navigate("/settings");
      }
    },
  };

  return (
    <div className="dashboard-wrapper d-flex min-vh-100">
      {/* Dynamic Sidebar navigation element */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main UI layout stream container */}
      <div className="main-content-panel flex-grow-1 d-flex flex-column">
        {/* Top bar header controls mapping layout */}
        <header className="navbar-header d-flex align-items-center justify-content-between px-4 py-3">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-link d-lg-none p-0 border-0 text-dark fs-4"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <MenuOutlined />
            </button>
            <h2 className="page-heading mb-0">
              {getPageTitle(location?.pathname || "")}
            </h2>
          </div>

          <div className="header-actions d-flex align-items-center gap-4">
            <Input
              placeholder="Search..."
              prefix={<SearchOutlined className="text-muted" />}
              className="search-bar-input d-none d-sm-flex"
            />

            <Badge count={3} dot className="notification-badge-cursor">
              <div className="icon-bell-container d-flex align-items-center justify-content-center">
                <BellOutlined />
              </div>
            </Badge>

            <Dropdown
              menu={adminMenuProps}
              trigger={["click"]}
              placement="bottomRight"
            >
              <div className="admin-profile-pill d-flex align-items-center gap-2">
                <Avatar icon={<UserOutlined />} className="avatar-brand-bg" />
                <span className="profile-name-label d-none d-md-inline">
                  {user?.name || "Admin"}
                </span>
              </div>
            </Dropdown>
          </div>
        </header>

        {/* Inner dynamic content body area scrolling vertically independently */}
        <main className="dashboard-view-body p-4 flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
