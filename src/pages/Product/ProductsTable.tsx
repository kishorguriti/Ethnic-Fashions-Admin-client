import React, { useState } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Switch,
  Tag,
  Dropdown,
  type MenuProps,
  Checkbox,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  EditOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";

// TypeScript schema defining dynamic product records
interface ProductRecord {
  key: string;
  name: string;
  variant?: string;
  category: "Sarees" | "Churidars" | "Jewellery";
  price: number;
  stock: number;
  status: "Active" | "Low Stock";
  isActive: boolean;
  colorBlock: string; // Dynamic placeholder hex color code mapping the design
}

const ProductsTable: React.FC = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [categoryFilter, setCategoryFilter] =
    useState<string>("All Categories");
  const navigate = useNavigate();
  // Dynamic state list pre-filled with data values from the image
  const [products, setProducts] = useState<ProductRecord[]>([
    {
      key: "1",
      name: "Banarasi Silk Saree",
      variant: "Red",
      category: "Sarees",
      price: 8500,
      stock: 24,
      status: "Active",
      isActive: true,
      colorBlock: "#e62424",
    },
    {
      key: "2",
      name: "Designer Anarkali Suit",
      category: "Churidars",
      price: 4200,
      stock: 15,
      status: "Active",
      isActive: true,
      colorBlock: "#246ee6",
    },
    {
      key: "3",
      name: "Gold Plated Necklace Set",
      category: "Jewellery",
      price: 12000,
      stock: 8,
      status: "Active",
      isActive: true,
      colorBlock: "#e6b824",
    },
    {
      key: "4",
      name: "Kanjivaram Wedding Saree",
      category: "Sarees",
      price: 15000,
      stock: 3,
      status: "Low Stock",
      isActive: false,
      colorBlock: "#e67324",
    },
    {
      key: "5",
      name: "Cotton Churidar",
      variant: "Blue",
      category: "Churidars",
      price: 1800,
      stock: 42,
      status: "Active",
      isActive: true,
      colorBlock: "#b824e6",
    },
  ]);

  // Handle live toggle changes for user switches
  const handleToggleActive = (key: string, checked: boolean) => {
    setProducts((prev) =>
      prev.map((prod) =>
        prod.key === key
          ? {
              ...prod,
              isActive: checked,
              status: checked ? "Active" : prod.status,
            }
          : prod,
      ),
    );
  };

  // Ant Design Row Context Menu template setup
  const getActionMenu = (key: string): MenuProps => ({
    items: [
      { key: "view", label: "View Details" },
      { key: "delete", label: "Delete Product", danger: true },
    ],
    onClick: ({ key: actionKey }) => {
      if (actionKey === "delete") {
        setProducts((prev) => prev.filter((p) => p.key !== key));
      }
    },
  });

  // Ant Design Columns mapping the layout columns exactly
  const columns: ColumnsType<ProductRecord> = [
    {
      title: "PRODUCT",
      dataIndex: "name",
      key: "product",
      render: (_, record) => (
        <div className="product-info-cell d-flex align-items-center gap-3">
          <div
            className="color-block-avatar flex-shrink-0"
            style={{ backgroundColor: record.colorBlock }}
          />
          <div className="text-container">
            <h5 className="prod-title mb-0">
              {record.name} {record.variant && ` - ${record.variant}`}
            </h5>
          </div>
        </div>
      ),
    },
    {
      title: "CATEGORY",
      dataIndex: "category",
      key: "category",
      render: (cat) => (
        <span className={`category-tag tag-${cat.toLowerCase()}`}>{cat}</span>
      ),
    },
    {
      title: "PRICE",
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <span className="price-text">₹{price.toLocaleString("en-IN")}</span>
      ),
    },
    {
      title: "STOCK",
      dataIndex: "stock",
      key: "stock",
      render: (stock) => (
        <span className={`stock-text ${stock <= 5 ? "critical-alert" : ""}`}>
          {stock}
        </span>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const type = status === "Active" ? "active-pill" : "lowstock-pill";
        return <Tag className={`status-pill-tag ${type}`}>{status}</Tag>;
      },
    },
    {
      title: "ACTIVE",
      dataIndex: "isActive",
      key: "active",
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleToggleActive(record.key, checked)}
          className="custom-switch-toggle"
        />
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <div className="actions-wrapper d-inline-flex align-items-center gap-2">
          <Button icon={<EditOutlined />} className="btn-edit-action">
            Edit
          </Button>
          <Dropdown
            menu={getActionMenu(record.key)}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              icon={<MoreOutlined />}
              className="btn-more-dots"
              type="text"
            />
          </Dropdown>
        </div>
      ),
    },
  ];

  // Filtering implementation framework logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.category.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory =
      categoryFilter === "All Categories" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddNewProduct = () => {
    navigate("/products/add-new-product");
  };

  return (
    <div className="products-inventory-panel p-4">
      {/* Title Header Section Line Block */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <h1 className="inventory-view-title mb-1">Products</h1>
          <p className="inventory-view-desc text-muted mb-0">
            Manage your product inventory
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="add-product-btn-brand"
          onClick={() => handleAddNewProduct()}
        >
          Add Product
        </Button>
      </div>

      {/* Control Filter Options Toolbar Container Block */}
      <div className="filter-controls-strip p-3 mb-4 d-flex flex-column flex-md-row justify-content-between gap-3 align-items-stretch align-items-md-center">
        <Input
          placeholder="Search products by name, category..."
          prefix={<SearchOutlined className="search-icon-muted" />}
          className="search-input-field flex-grow-1"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Select
            value={categoryFilter}
            onChange={(val) => setCategoryFilter(val)}
            className="category-dropdown-select"
            suffixIcon={<FilterOutlined />}
            options={[
              { value: "All Categories", label: "All Categories" },
              { value: "Sarees", label: "Sarees" },
              { value: "Churidars", label: "Churidars" },
              { value: "Jewellery", label: "Jewellery" },
            ]}
          />
          <Button icon={<FilterOutlined />} className="more-filters-btn">
            More Filters
          </Button>
        </div>
      </div>

      {/* Main Framework Table Section Module Layout */}
      <div className="table-card-wrapper bg-white">
        <Table
          rowSelection={{ type: "checkbox" }}
          columns={columns}
          dataSource={filteredProducts}
          pagination={{
            position: ["bottomRight"],
            defaultPageSize: 5,
            showSizeChanger: false,
            itemRender: (_, type, originalElement) => {
              if (type === "prev")
                return (
                  <Button size="small" className="pag-btn">
                    Previous
                  </Button>
                );
              if (type === "next")
                return (
                  <Button size="small" className="pag-btn">
                    Next
                  </Button>
                );
              return originalElement;
            },
          }}
          className="custom-inventory-table"
          footer={() => (
            <span className="footer-counter-lbl text-muted">
              Showing 1 to {filteredProducts.length} of {products.length}{" "}
              products
            </span>
          )}
        />
      </div>
    </div>
  );
};

export default ProductsTable;
