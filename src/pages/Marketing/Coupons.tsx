import React, { useState } from "react";
import { Table, Button, Tag, Form, Input, DatePicker, message } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TagOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

// TypeScript schema interfaces
interface CouponRecord {
  key: string;
  code: string;
  discount: string;
  type: "Percentage" | "Fixed";
  currentUsage: number;
  maxUsage: number;
  expiryDate: string;
  status: "Active" | "Expired";
}

interface QuickCouponFormValues {
  couponCode: string;
  discountValue: string;
  usageLimit: string;
  expiryDate: any;
}

const Coupons = () => {
  const [form] = Form.useForm<QuickCouponFormValues>();

  // Dynamic state list tracking dataset values from your uploaded image
  const [coupons, setCoupons] = useState<CouponRecord[]>([
    {
      key: "1",
      code: "WELCOME10",
      discount: "10%",
      type: "Percentage",
      currentUsage: 25,
      maxUsage: 100,
      expiryDate: "Mar 31, 2026",
      status: "Active",
    },
    {
      key: "2",
      code: "FESTIVAL25",
      discount: "25%",
      type: "Percentage",
      currentUsage: 142,
      maxUsage: 500,
      expiryDate: "Mar 20, 2026",
      status: "Active",
    },
    {
      key: "3",
      code: "FLAT500",
      discount: "₹500",
      type: "Fixed",
      currentUsage: 68,
      maxUsage: 200,
      expiryDate: "Mar 15, 2026",
      status: "Active",
    },
    {
      key: "4",
      code: "SUMMER20",
      discount: "20%",
      type: "Percentage",
      currentUsage: 200,
      maxUsage: 200,
      expiryDate: "Feb 28, 2026",
      status: "Expired",
    },
  ]);

  // Handle local data removal line actions
  const handleDeleteCoupon = (key: string, code: string) => {
    setCoupons((prev) => prev.filter((c) => c.key !== key));
    message.success(`Coupon code ${code} deleted.`);
  };

  // Quick form submittal validation processing routing
  const handleQuickCreateSubmit = (values: QuickCouponFormValues) => {
    const formattedExpiry = values.expiryDate
      ? dayjs(values.expiryDate).format("MMM DD, YYYY")
      : "No Expiry";

    // Auto calculate if status is active or expired based on limits/dates
    const isExpired = values.usageLimit
      ? parseInt(values.usageLimit) <= 0
      : false;

    const newCoupon: CouponRecord = {
      key: Date.now().toString(),
      code: values.couponCode.toUpperCase().trim(),
      discount:
        values.discountValue.includes("₹") || values.discountValue.includes("%")
          ? values.discountValue
          : `${values.discountValue}%`,
      type: values.discountValue.includes("₹") ? "Fixed" : "Percentage",
      currentUsage: 0,
      maxUsage: values.usageLimit ? parseInt(values.usageLimit) : 100,
      expiryDate: formattedExpiry,
      status: isExpired ? "Expired" : "Active",
    };

    setCoupons((prev) => [...prev, newCoupon]);
    form.resetFields();
    message.success(`Coupon ${newCoupon.code} created successfully!`);
  };

  // Ant Design Coupons Grid Columns Mapping Matrix
  const columns: ColumnsType<CouponRecord> = [
    {
      title: "Coupon Code",
      dataIndex: "code",
      key: "code",
      render: (text) => <span className="coupon-code-lbl fw-bold">{text}</span>,
    },
    {
      title: "Discount",
      dataIndex: "discount",
      key: "discount",
      render: (text) => (
        <span className="discount-value-lbl fw-bold">{text}</span>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (text) => (
        <span className="type-label-text text-muted">{text}</span>
      ),
    },
    {
      title: "Usage",
      key: "usage",
      render: (_, record) => (
        <span className="usage-fraction text-muted">
          {record.currentUsage}/{record.maxUsage}
        </span>
      ),
    },
    {
      title: "Expiry Date",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (text) => (
        <span className="expiry-date-text text-muted">{text}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: CouponRecord["status"]) => {
        const badgeStyle =
          status === "Active" ? "status-pill-active" : "status-pill-expired";
        return (
          <Tag className={`coupon-status-tag ${badgeStyle}`}>{status}</Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <div className="table-row-actions d-inline-flex gap-2 align-items-center">
          <Button
            type="text"
            icon={<EditOutlined />}
            className="action-edit-btn fw-semibold"
          >
            Edit
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            className="action-delete-btn p-1"
            onClick={() => handleDeleteCoupon(record.key, record.code)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      {/* 3. Outer Grid View Controls Layer Area */}
      <div className="d-flex justify-content-end mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="create-coupon-top-btn px-3 py-2 fw-semibold"
        >
          Create Coupon
        </Button>
      </div>

      {/* 4. Core Tabular Coupons Records Display Board Grid */}
      <div className="coupons-table-card-wrapper bg-white border mb-4">
        <Table
          columns={columns}
          dataSource={coupons}
          pagination={false}
          className="custom-coupons-data-grid"
        />
      </div>

      {/* 5. Quick Create Coupon Content Section Form Panel Card */}
      <div className="quick-create-form-surface p-4 bg-white border">
        <h3 className="form-inner-title mb-4">Quick Create Coupon</h3>

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleQuickCreateSubmit}
          autoComplete="off"
        >
          <div className="row g-4">
            <div className="col-12 col-md-6">
              <Form.Item
                label="Coupon Code"
                name="couponCode"
                rules={[
                  { required: true, message: "Please enter a coupon code" },
                ]}
              >
                <Input
                  placeholder="e.g., SUMMER20"
                  className="custom-form-field"
                  size="large"
                />
              </Form.Item>
            </div>
            <div className="col-12 col-md-6">
              <Form.Item
                label="Discount Value"
                name="discountValue"
                rules={[
                  { required: true, message: "Please specify discount value" },
                ]}
              >
                <Input
                  placeholder="e.g., 20"
                  className="custom-form-field"
                  size="large"
                />
              </Form.Item>
            </div>
          </div>

          <div className="row g-4 mt-1">
            <div className="col-12 col-md-6">
              <Form.Item label="Usage Limit" name="usageLimit">
                <Input
                  placeholder="e.g., 100"
                  className="custom-form-field"
                  size="large"
                />
              </Form.Item>
            </div>
            <div className="col-12 col-md-6">
              <Form.Item label="Expiry Date" name="expiryDate">
                <DatePicker
                  className="w-100 custom-form-field custom-datepicker"
                  size="large"
                  format="MMM DD, YYYY"
                />
              </Form.Item>
            </div>
          </div>

          <Form.Item className="mb-0 mt-4">
            <Button
              type="primary"
              htmlType="submit"
              icon={<TagOutlined />}
              className="quick-create-submit-btn d-flex align-items-center justify-content-center"
              size="large"
            >
              Create Coupon
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default Coupons;
