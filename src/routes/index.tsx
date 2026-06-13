// src/routes/index.tsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
// import ProductCollection from "../features/products/ProductCollection";
import Login from "../auth/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Layout from "../layout/AdminLayout";
import ProductsTable from "../pages/Product/ProductsTable";
import AddNewProduct from "../pages/Product/AddNewProduct";
import CategoriesManagement from "../pages/Categories/CategoriesManagement";
import InventoryManagement from "../pages/InventoryManagement";
import OrdersManagement from "../pages/Orders/OrdersManagement";
import CustomersSummary from "../pages/Customers/CustomersSummary";
import MarketingDashboard from "../pages/Marketing/Dashboard";
import ReturnsRefundsSummary from "../pages/Returns&Refunds/ReturnsRefundsSummary";
import RevenuePaymentsDashboard from "../pages/Revenue&Payments/RevenuePaymentsDashboard";
import AnalyticsDashboard from "../pages/Analytics/AnalyticsDashboard";
import StoreSettings from "../pages/Settings";
import { NotificationManagement } from "../pages/Notifications/NotificationManagement";
import ContentManagement from "../pages/ContentManagement/CMSManager";
// import ShoppingCart from "../features/cart/ShoppingCart";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Admin Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products/add-new-product" element={<AddNewProduct />} />
          <Route path="products/edit/:slug" element={<AddNewProduct />} />
          {/* <Route path="products" element={<ProductCollection />} /> */}
          <Route path="products" element={<ProductsTable />} />
          <Route path="categories" element={<CategoriesManagement />} />
          <Route path="orders" element={<OrdersManagement />} />
          <Route path="inventory" element={<InventoryManagement />} />
          <Route path="customers" element={<CustomersSummary />} />
          <Route path="marketing" element={<MarketingDashboard />} />
          <Route
            path="return-and-refunds"
            element={<ReturnsRefundsSummary />}
          />
          <Route
            path="revenue-and-payments"
            element={<RevenuePaymentsDashboard />}
          />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="settings" element={<StoreSettings />} />
          <Route path="notifications" element={<NotificationManagement />} />
          <Route path="content-management" element={<ContentManagement />} />
        </Route>
      </Route>
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}
