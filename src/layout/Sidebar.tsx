// import React from 'react';
// import {
//   AppstoreOutlined, ShoppingOutlined, TagsOutlined,
//   ContainerOutlined, ShoppingCartOutlined, UsergroupAddOutlined,
//   BarChartOutlined, BellOutlined, SettingOutlined,
//   LogoutOutlined, LeftOutlined, RightOutlined
// } from '@ant-design/icons';

// interface SidebarProps {
//   collapsed: boolean;
//   setCollapsed: (collapsed: boolean) => void;
// }

// const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
//   const menuItems = [
//     { id: 'dashboard', label: 'Dashboard', icon: <AppstoreOutlined />, active: true },
//     { id: 'products', label: 'Products', icon: <ShoppingOutlined /> },
//     { id: 'categories', label: 'Categories', icon: <TagsOutlined /> },
//     { id: 'inventory', label: 'Inventory', icon: <ContainerOutlined /> },
//     { id: 'orders', label: 'Orders', icon: <ShoppingCartOutlined /> },
//     { id: 'customers', label: 'Customers', icon: <UsergroupAddOutlined /> },
//     { id: 'marketing', label: 'Marketing', icon: <SettingOutlined /> },
//     { id: 'returns', label: 'Returns & Refunds', icon: <ContainerOutlined /> },
//     { id: 'revenue', label: 'Revenue & Payments', icon: <BarChartOutlined /> },
//     { id: 'analytics', label: 'Analytics', icon: <BarChartOutlined /> },
//     { id: 'notifications', label: 'Notifications', icon: <BellOutlined /> },
//     { id: 'cms', label: 'CMS / Content', icon: <ContainerOutlined /> },
//     { id: 'settings', label: 'Settings', icon: <SettingOutlined /> },
//   ];

//   return (
//     <aside className={`dashboard-sidebar d-flex flex-column ${collapsed ? 'collapsed' : ''}`}>
//       {/* Brand header area matching gradient layout */}
//       <div className="sidebar-brand-header d-flex align-items-center justify-content-between px-3 py-4">
//         {!collapsed && (
//           <div className="brand-logo-group d-flex align-items-center gap-2">
//             <div className="brand-gradient-dot" />
//             <span className="brand-title-text">Ethnic Fashion</span>
//           </div>
//         )}
//         <button
//           className="collapse-toggle-btn d-flex align-items-center justify-content-center"
//           onClick={() => setCollapsed(!collapsed)}
//         >
//           {collapsed ? <RightOutlined /> : <LeftOutlined />}
//         </button>
//       </div>

//       {/* Main scrolling nav collection area */}
//       <nav className="sidebar-nav-links flex-grow-1 py-2 px-3 overflow-y-auto">
//         {menuItems.map((item) => (
//           <div
//             key={item.id}
//             className={`nav-item-link d-flex align-items-center gap-3 px-3 py-2.5 mb-1 ${item.active ? 'active' : ''}`}
//           >
//             <span className="nav-icon-span">{item.icon}</span>
//             {!collapsed && <span className="nav-text-label">{item.label}</span>}
//           </div>
//         ))}
//       </nav>

//       {/* Persistent logout block segment at structural base */}
//       <div className="sidebar-footer-action p-3 border-top">
//         <div className="logout-action-btn d-flex align-items-center gap-3 px-3 py-2 text-danger style-pointer">
//           <LogoutOutlined />
//           {!collapsed && <span className="logout-text font-weight-bold">Logout</span>}
//         </div>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;

import React from "react";
import {
  AppstoreOutlined,
  ShoppingOutlined,
  TagsOutlined,
  ContainerOutlined,
  ShoppingCartOutlined,
  UsergroupAddOutlined,
  BarChartOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  LeftOutlined,
  RightOutlined,
  TeamOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { logoutUser } from "../auth/authSlice";
import type { Role } from "../auth/types";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const ALL_STAFF: Role[] = ["super_admin", "admin", "partner"];
const ADMIN_ONLY: Role[] = ["super_admin", "admin"];
const SUPER_ADMIN_ONLY: Role[] = ["super_admin"];

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const naviagate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const role = useAppSelector((state) => state.auth.user?.role);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <AppstoreOutlined />,
      active: true,
      link: "/",
      visibleRoles: ALL_STAFF,
    },
    {
      id: "products",
      label: "Products",
      icon: <ShoppingOutlined />,
      link: "/products",
      visibleRoles: ALL_STAFF,
    },
    {
      id: "categories",
      label: "Categories",
      icon: <TagsOutlined />,
      link: "/categories",
      visibleRoles: ADMIN_ONLY,
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: <ContainerOutlined />,
      link: "/inventory",
      visibleRoles: ALL_STAFF,
    },
    {
      id: "orders",
      label: "Orders",
      icon: <ShoppingCartOutlined />,
      link: "/orders",
      visibleRoles: ALL_STAFF,
    },
    {
      id: "partners",
      label: "Partners",
      icon: <TeamOutlined />,
      link: "/partners",
      visibleRoles: SUPER_ADMIN_ONLY,
    },
    {
      id: "pending-approvals",
      label: "Pending Approvals",
      icon: <FileSearchOutlined />,
      link: "/pending-approvals",
      visibleRoles: ADMIN_ONLY,
    },
    {
      id: "customers",
      label: "Customers",
      icon: <UsergroupAddOutlined />,
      link: "/customers",
      visibleRoles: ADMIN_ONLY,
    },
    {
      id: "marketing",
      label: "Marketing",
      icon: <SettingOutlined />,
      link: "/marketing",
      visibleRoles: ADMIN_ONLY,
    },
    {
      id: "returns",
      label: "Returns & Refunds",
      icon: <ContainerOutlined />,
      link: "/return-and-refunds",
      visibleRoles: ADMIN_ONLY,
    },
    {
      id: "revenue",
      label: "Revenue & Payments",
      icon: <BarChartOutlined />,
      link: "/revenue-and-payments",
      visibleRoles: ADMIN_ONLY,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChartOutlined />,
      link: "/analytics",
      visibleRoles: ADMIN_ONLY,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <BellOutlined />,
      link: "/notifications",
      visibleRoles: ADMIN_ONLY,
    },
    {
      id: "cms",
      label: "CMS / Content",
      icon: <ContainerOutlined />,
      link: "/content-management",
      visibleRoles: ADMIN_ONLY,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <SettingOutlined />,
      link: "/settings",
      visibleRoles: ADMIN_ONLY,
    },
  ].filter((item) => !role || item.visibleRoles.includes(role));

  const handleNavigate = (link: any) => {
    if (link) {
      naviagate(link);
    }
  };
  const handleLogout = async () => {
    await dispatch(logoutUser());
    naviagate("/login");
  };

  return (
    // Added Bootstrap structure utility layout rules for absolute stickiness
    <aside
      className={`dashboard-sidebar d-flex flex-column vh-100 position-sticky top-0 ${collapsed ? "collapsed" : ""}`}
    >
      {/* Fixed Brand Header */}
      <div className="sidebar-brand-header d-flex align-items-center justify-content-between px-3 py-4 flex-shrink-0">
        {!collapsed && (
          <div className="brand-logo-group d-flex align-items-center gap-2">
            <div className="brand-gradient-dot" />
            <span className="brand-title-text">Ethnic Fashion</span>
          </div>
        )}
        <button
          className="collapse-toggle-btn d-flex align-items-center justify-content-center"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <RightOutlined /> : <LeftOutlined />}
        </button>
      </div>

      {/* Scrollable Navigation Area */}
      {/* <nav className="sidebar-nav-links flex-grow-1 py-2 px-3 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <div
            key={item?.id}
            // className={`nav-item-link d-flex align-items-center gap-3 px-3 py-2.5 mb-1 ${item?.active ? "active" : ""}`}
            className={`nav-item-link d-flex align-items-center gap-3 px-3 py-2.5 mb-1 ${item?.link === "/" ? "active" : item?.link?.length > 1 && item?.link && location?.pathname?.includes(item?.link) ? "active" : ""}`}
            onClick={() => handleNavigate(item?.link)}
          >
            <span className="nav-icon-span">{item.icon}</span>
            {!collapsed && <span className="nav-text-label">{item.label}</span>}
          </div>
        ))}
      </nav> */}
      <nav className="sidebar-nav-links flex-grow-1 py-2 px-3 overflow-y-auto custom-scrollbar">
        {menuItems?.map((item) => {
          // Determine the active link state based on current location router path
          const isActive =
            item?.link === "/"
              ? location?.pathname === "/"
              : !!item?.link &&
                item?.link?.length > 1 &&
                location?.pathname?.includes(item.link);

          return (
            <div
              key={item?.id}
              className={`nav-item-link d-flex align-items-center gap-3 px-3 py-2.5 mb-1 ${isActive ? "active" : ""}`}
              onClick={() => item?.link && handleNavigate(item.link)}
            >
              <span className="nav-icon-span">{item?.icon}</span>
              {!collapsed && (
                <span className="nav-text-label">{item?.label}</span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Fixed Footer Action Area */}
      <div className="sidebar-footer-action p-3 border-top flex-shrink-0">
        <div
          className="logout-action-btn d-flex align-items-center gap-3 px-3 py-2 text-danger style-pointer"
          onClick={() => handleLogout()}
          style={{ cursor: "pointer" }}
        >
          <LogoutOutlined />
          {!collapsed && (
            <span className="logout-text font-weight-bold">Logout</span>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
