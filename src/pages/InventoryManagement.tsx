import React, { useState } from "react";
import {
  Button,
  Input,
  Select,
  Table,
  Tag,
  Modal,
  InputNumber,
  message,
} from "antd";
import {
  SearchOutlined,
  MedicineBoxOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  EditOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

// TypeScript schema interfaces defining static product stock items
interface InventoryItem {
  key: string;
  name: string;
  sku: string;
  category: "Sarees" | "Churidars" | "Jewellery";
  currentStock: number;
  lowStockAlert: number;
}

const InventoryManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] =
    useState<string>("All Categories");
  const [selectedStatus, setSelectedStatus] = useState<string>("All Status");

  // Dynamic state list tracking data values present in your layout image
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      key: "1",
      name: "Banarasi Silk Saree",
      sku: "SAR-001",
      category: "Sarees",
      currentStock: 24,
      lowStockAlert: 10,
    },
    {
      key: "2",
      name: "Kanjivaram Wedding Saree",
      sku: "SAR-015",
      category: "Sarees",
      currentStock: 3,
      lowStockAlert: 10,
    },
    {
      key: "3",
      name: "Designer Anarkali Suit",
      sku: "CHU-008",
      category: "Churidars",
      currentStock: 15,
      lowStockAlert: 5,
    },
    {
      key: "4",
      name: "Pearl Earrings",
      sku: "JEW-023",
      category: "Jewellery",
      currentStock: 0,
      lowStockAlert: 5,
    },
    {
      key: "5",
      name: "Gold Plated Necklace",
      sku: "JEW-012",
      category: "Jewellery",
      currentStock: 8,
      lowStockAlert: 10,
    },
    {
      key: "6",
      name: "Cotton Churidar",
      sku: "CHU-004",
      category: "Churidars",
      currentStock: 2,
      lowStockAlert: 8,
    },
  ]);

  // Helper utility resolving stock state logic matching design specifications
  const getStockStatus = (
    current: number,
    threshold: number,
  ): "In Stock" | "Low Stock" | "Out of Stock" => {
    if (current === 0) return "Out of Stock";
    if (current <= threshold) return "Low Stock";
    return "In Stock";
  };

  // Metrics KPI calculations
  const totalItemsCount = inventory.length;
  const lowStockCount = inventory.filter(
    (item) => item.currentStock > 0 && item.currentStock <= item.lowStockAlert,
  ).length;
  const outOfStockCount = inventory.filter(
    (item) => item.currentStock === 0,
  ).length;

  // Handle local dynamic stock level inline modification updates
  const handleUpdateStock = (key: string, currentVal: number) => {
    let targetNewVal: number | null = currentVal;

    Modal.confirm({
      title: "Update Stock Level",
      icon: <EditOutlined className="text-primary" />,
      content: (
        <div className="pt-3">
          <p className="mb-2 text-muted">
            Specify the target count for this product item entry:
          </p>
          <InputNumber
            min={0}
            defaultValue={currentVal}
            onChange={(val) => {
              targetNewVal = val;
            }}
            className="w-100"
          />
        </div>
      ),
      okText: "Save Update",
      cancelText: "Cancel",
      onOk() {
        if (targetNewVal !== null) {
          setInventory((prev) =>
            prev.map((item) =>
              item.key === key
                ? { ...item, currentStock: targetNewVal as number }
                : item,
            ),
          );
          message.success("Stock level variable synced successfully!");
        }
      },
    });
  };

  // Ant Design Inventory Layout Table Columns
  const columns: ColumnsType<InventoryItem> = [
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="product-title-bold">{text}</span>,
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      render: (text) => <span className="sku-code-label">{text}</span>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (text) => <span className="category-text-label">{text}</span>,
    },
    {
      title: "Current Stock",
      dataIndex: "currentStock",
      key: "currentStock",
      render: (stock) => (
        <span className="stock-counter-badge px-3 py-1.5">{stock}</span>
      ),
    },
    {
      title: "Low Stock Alert",
      dataIndex: "lowStockAlert",
      key: "lowStockAlert",
      render: (alert) => <span className="alert-threshold-label">{alert}</span>,
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const status = getStockStatus(
          record.currentStock,
          record.lowStockAlert,
        );
        const styleMap = {
          "In Stock": "status-instock",
          "Low Stock": "status-lowstock",
          "Out of Stock": "status-outofstock",
        };
        return (
          <Tag className={`inventory-status-pill ${styleMap[status]}`}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="action-buttons-group d-flex align-items-center gap-3">
          <Button
            type="text"
            icon={<EditOutlined />}
            className="action-btn-update px-0"
            onClick={() => handleUpdateStock(record.key, record.currentStock)}
          >
            Update
          </Button>
          <Button
            type="text"
            icon={<HistoryOutlined />}
            className="action-btn-history px-0"
          >
            History
          </Button>
        </div>
      ),
    },
  ];

  // Filtering Core Mechanism Data pipeline layout logic
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Categories" ||
      item.category === selectedCategory;

    const status = getStockStatus(item.currentStock, item.lowStockAlert);
    const matchesStatus =
      selectedStatus === "All Status" || status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="inventory-management-dashboard container-fluid p-4">
      {/* Top Main Heading Line Action Block */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <h1 className="main-section-heading mb-1">Inventory Management</h1>
          <p className="sub-section-desc text-muted mb-0">
            Track and manage product stock levels
          </p>
        </div>
        <Button type="primary" className="bulk-update-brand-btn">
          Bulk Stock Update
        </Button>
      </div>

      {/* KPI Numerical Counters Summary Cards Panel Wrapper */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-4">
          <div className="metric-kpi-surface-card p-3 d-flex align-items-center gap-3">
            <div className="kpi-icon-avatar bg-avatar-blue text-avatar-blue d-flex align-items-center justify-content-center">
              <MedicineBoxOutlined />
            </div>
            <div>
              <span className="kpi-lbl text-muted d-block mb-1">
                Total Items
              </span>
              <h2 className="kpi-numeric-value mb-0">{totalItemsCount}</h2>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="metric-kpi-surface-card p-3 d-flex align-items-center gap-3">
            <div className="kpi-icon-avatar bg-avatar-orange text-avatar-orange d-flex align-items-center justify-content-center">
              <WarningOutlined />
            </div>
            <div>
              <span className="kpi-lbl text-muted d-block mb-1">
                Low Stock Items
              </span>
              <h2 className="kpi-numeric-value mb-0">{lowStockCount}</h2>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="metric-kpi-surface-card p-3 d-flex align-items-center gap-3">
            <div className="kpi-icon-avatar bg-avatar-red text-avatar-red d-flex align-items-center justify-content-center">
              <CloseCircleOutlined />
            </div>
            <div>
              <span className="kpi-lbl text-muted d-block mb-1">
                Out of Stock
              </span>
              <h2 className="kpi-numeric-value mb-0">{outOfStockCount}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Control Options Toolbar Strip Wrapper Block */}
      <div className="filter-controls-card p-3 mb-4 d-flex flex-column flex-md-row justify-content-between gap-3 align-items-stretch align-items-md-center">
        <Input
          placeholder="Search by product name or SKU..."
          prefix={<SearchOutlined className="search-icon-dimmed" />}
          className="search-input-field flex-grow-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="d-flex align-items-center gap-2 flex-wrap flex-sm-nowrap">
          <Select
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val)}
            className="toolbar-select-dropdown"
            options={[
              { value: "All Categories", label: "All Categories" },
              { value: "Sarees", label: "Sarees" },
              { value: "Churidars", label: "Churidars" },
              { value: "Jewellery", label: "Jewellery" },
            ]}
          />
          <Select
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val)}
            className="toolbar-select-dropdown"
            options={[
              { value: "All Status", label: "All Status" },
              { value: "In Stock", label: "In Stock" },
              { value: "Low Stock", label: "Low Stock" },
              { value: "Out of Stock", label: "Out of Stock" },
            ]}
          />
        </div>
      </div>

      {/* Main Core Inventory Table Panel Screen Container */}
      <div className="inventory-table-panel bg-white">
        <Table
          columns={columns}
          dataSource={filteredInventory}
          pagination={false}
          className="custom-inventory-data-table"
        />
      </div>
    </div>
  );
};
export default InventoryManagement;
