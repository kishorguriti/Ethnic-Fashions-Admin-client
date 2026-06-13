import React, { useEffect, useState } from "react";
import { Button, Input, Select, Table, Tag, Modal, InputNumber, message } from "antd";
import {
  SearchOutlined,
  MedicineBoxOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  getAdminVariants,
  updateVariantStock,
  type InventoryVariant,
} from "../services/productApi";

const LOW_STOCK_THRESHOLD = 5;
const PAGE_SIZE = 10;

type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

const getStockStatus = (available: number): StockStatus => {
  if (available === 0) return "Out of Stock";
  if (available <= LOW_STOCK_THRESHOLD) return "Low Stock";
  return "In Stock";
};

const InventoryManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "in" | "low" | "out">("all");
  const [inventory, setInventory] = useState<InventoryVariant[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ totalItemsCount: 0, lowStockCount: 0, outOfStockCount: 0 });

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await getAdminVariants({
        page,
        limit: PAGE_SIZE,
        search: searchQuery || undefined,
        status: selectedStatus === "all" ? undefined : selectedStatus,
      });
      setInventory(res.data.data.variants);
      setTotal(res.data.data.total);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadInventory, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedStatus, page]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedStatus]);

  const loadSummary = async () => {
    try {
      const [lowRes, outRes, allRes] = await Promise.all([
        getAdminVariants({ limit: 1, status: "low" }),
        getAdminVariants({ limit: 1, status: "out" }),
        getAdminVariants({ limit: 1 }),
      ]);
      setSummary({
        totalItemsCount: allRes.data.data.total,
        lowStockCount: lowRes.data.data.total,
        outOfStockCount: outRes.data.data.total,
      });
    } catch {
      // ignore summary load errors
    }
  };

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { totalItemsCount, lowStockCount, outOfStockCount } = summary;

  const handleUpdateStock = (record: InventoryVariant) => {
    let targetNewVal: number | null = record.stock;

    Modal.confirm({
      title: "Update Stock Level",
      icon: <EditOutlined className="text-primary" />,
      content: (
        <div className="pt-3">
          <p className="mb-2 text-muted">
            Specify the new stock count for {record.product.name} ({record.color}
            {record.size ? ` / ${record.size}` : ""}):
          </p>
          <InputNumber
            min={0}
            defaultValue={record.stock}
            onChange={(val) => {
              targetNewVal = val;
            }}
            className="w-100"
          />
        </div>
      ),
      okText: "Save Update",
      cancelText: "Cancel",
      onOk: async () => {
        if (targetNewVal === null) return;
        try {
          const res = await updateVariantStock(record.product._id, record._id, targetNewVal);
          setInventory((prev) =>
            prev.map((item) =>
              item._id === record._id
                ? {
                    ...item,
                    stock: res.data.data.variant.stock,
                    available: res.data.data.variant.available,
                  }
                : item,
            ),
          );
          message.success("Stock level updated successfully!");
          loadSummary();
        } catch (err: any) {
          message.error(err?.response?.data?.message || "Failed to update stock");
        }
      },
    });
  };

  const columns: ColumnsType<InventoryVariant> = [
    {
      title: "Product Name",
      key: "name",
      render: (_, record) => <span className="product-title-bold">{record.product.name}</span>,
    },
    {
      title: "Color / Size",
      key: "variant",
      render: (_, record) => (
        <span>
          {record.color}
          {record.size ? ` / ${record.size}` : ""}
        </span>
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      render: (text) => <span className="sku-code-label">{text}</span>,
    },
    {
      title: "Category",
      key: "category",
      render: (_, record) => <span className="category-text-label">{record.product.category?.name}</span>,
    },
    {
      title: "Current Stock",
      dataIndex: "available",
      key: "available",
      render: (available) => <span className="stock-counter-badge px-3 py-1.5">{available}</span>,
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const status = getStockStatus(record.available);
        const styleMap: Record<StockStatus, string> = {
          "In Stock": "status-instock",
          "Low Stock": "status-lowstock",
          "Out of Stock": "status-outofstock",
        };
        return <Tag className={`inventory-status-pill ${styleMap[status]}`}>{status}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          className="action-btn-update px-0"
          onClick={() => handleUpdateStock(record)}
        >
          Update
        </Button>
      ),
    },
  ];

  return (
    <div className="inventory-management-dashboard container-fluid p-4">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <h1 className="main-section-heading mb-1">Inventory Management</h1>
          <p className="sub-section-desc text-muted mb-0">Track and manage product stock levels</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-4">
          <div className="metric-kpi-surface-card p-3 d-flex align-items-center gap-3">
            <div className="kpi-icon-avatar bg-avatar-blue text-avatar-blue d-flex align-items-center justify-content-center">
              <MedicineBoxOutlined />
            </div>
            <div>
              <span className="kpi-lbl text-muted d-block mb-1">Total Variants</span>
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
              <span className="kpi-lbl text-muted d-block mb-1">Low Stock Items</span>
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
              <span className="kpi-lbl text-muted d-block mb-1">Out of Stock</span>
              <h2 className="kpi-numeric-value mb-0">{outOfStockCount}</h2>
            </div>
          </div>
        </div>
      </div>

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
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val)}
            className="toolbar-select-dropdown"
            options={[
              { value: "all", label: "All Status" },
              { value: "in", label: "In Stock" },
              { value: "low", label: "Low Stock" },
              { value: "out", label: "Out of Stock" },
            ]}
          />
        </div>
      </div>

      <div className="inventory-table-panel bg-white">
        <Table
          columns={columns}
          dataSource={inventory}
          rowKey="_id"
          loading={loading}
          scroll={{ x: "max-content" }}
          pagination={{
            position: ["bottomRight"],
            current: page,
            pageSize: PAGE_SIZE,
            total,
            showSizeChanger: false,
            onChange: (p) => setPage(p),
            itemRender: (_, type, originalElement) => {
              if (type === "prev") return <Button size="small" className="pagination-edge-btn">Previous</Button>;
              if (type === "next") return <Button size="small" className="pagination-edge-btn">Next</Button>;
              return originalElement;
            },
          }}
          className="custom-inventory-data-table"
          footer={() => (
            <span className="footer-counter-lbl text-muted">
              Showing {inventory.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to{" "}
              {Math.min(page * PAGE_SIZE, total)} of {total} items
            </span>
          )}
        />
      </div>
    </div>
  );
};
export default InventoryManagement;
