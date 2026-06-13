import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Tag,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Switch,
  Modal,
  Spin,
  Alert,
  Empty,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TagOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
  type Coupon,
  type CouponType,
} from "../../services/couponApi";

interface CouponFormValues {
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  maxDiscountCap?: number;
  minOrderValue?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  validity: [dayjs.Dayjs, dayjs.Dayjs];
  isActive: boolean;
}

const Coupons: React.FC = () => {
  const [form] = Form.useForm<CouponFormValues>();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCoupons({ limit: 100 });
      setCoupons(res.data.data.coupons);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to load coupons. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const resetForm = () => {
    setEditingCoupon(null);
    form.resetFields();
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    form.setFieldsValue({
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      maxDiscountCap: coupon.maxDiscountCap ?? undefined,
      minOrderValue: coupon.minOrderValue,
      usageLimit: coupon.usageLimit ?? undefined,
      usageLimitPerUser: coupon.usageLimitPerUser ?? undefined,
      validity: [dayjs(coupon.startsAt), dayjs(coupon.endsAt)],
      isActive: coupon.isActive,
    });
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      const res = await toggleCouponStatus(coupon._id);
      message.success(res.data.message);
      setCoupons((prev) =>
        prev.map((c) => (c._id === coupon._id ? res.data.data.coupon : c)),
      );
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to update coupon status");
    }
  };

  const handleDelete = (coupon: Coupon) => {
    Modal.confirm({
      title: `Delete ${coupon.code}?`,
      icon: <ExclamationCircleOutlined className="text-danger" />,
      content: "This will permanently remove this coupon code.",
      okText: "Delete Coupon",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        try {
          await deleteCoupon(coupon._id);
          message.success(`Coupon ${coupon.code} deleted.`);
          setCoupons((prev) => prev.filter((c) => c._id !== coupon._id));
          if (editingCoupon?._id === coupon._id) resetForm();
        } catch (err: any) {
          message.error(err?.response?.data?.message || "Failed to delete coupon");
        }
      },
    });
  };

  const handleSubmit = async (values: CouponFormValues) => {
    setSubmitting(true);
    try {
      const [startsAt, endsAt] = values.validity;
      if (editingCoupon) {
        const res = await updateCoupon(editingCoupon._id, {
          description: values.description,
          type: values.type,
          value: values.value,
          maxDiscountCap: values.maxDiscountCap ?? null,
          minOrderValue: values.minOrderValue,
          usageLimit: values.usageLimit ?? null,
          usageLimitPerUser: values.usageLimitPerUser ?? null,
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
          isActive: values.isActive,
        });
        message.success(res.data.message);
        setCoupons((prev) =>
          prev.map((c) => (c._id === editingCoupon._id ? res.data.data.coupon : c)),
        );
      } else {
        const res = await createCoupon({
          code: values.code,
          description: values.description,
          type: values.type,
          value: values.value,
          maxDiscountCap: values.maxDiscountCap ?? null,
          minOrderValue: values.minOrderValue ?? 0,
          usageLimit: values.usageLimit ?? null,
          usageLimitPerUser: values.usageLimitPerUser ?? null,
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
          isActive: values.isActive ?? true,
        });
        message.success(res.data.message);
        setCoupons((prev) => [res.data.data.coupon, ...prev]);
      }
      resetForm();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDiscount = (coupon: Coupon) =>
    coupon.type === "percentage" ? `${coupon.value}%` : `₹${coupon.value}`;

  const computeStatus = (coupon: Coupon): { label: string; cls: string } => {
    const now = dayjs();
    if (!coupon.isActive) return { label: "Inactive", cls: "status-pill-expired" };
    if (now.isBefore(dayjs(coupon.startsAt))) return { label: "Upcoming", cls: "status-pill-expired" };
    if (now.isAfter(dayjs(coupon.endsAt))) return { label: "Expired", cls: "status-pill-expired" };
    return { label: "Active", cls: "status-pill-active" };
  };

  const columns: ColumnsType<Coupon> = [
    {
      title: "Coupon Code",
      dataIndex: "code",
      key: "code",
      render: (text) => <span className="coupon-code-lbl fw-bold">{text}</span>,
    },
    {
      title: "Discount",
      key: "discount",
      render: (_, record) => (
        <span className="discount-value-lbl fw-bold">{formatDiscount(record)}</span>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (text: CouponType) => (
        <span className="type-label-text text-muted text-capitalize">{text}</span>
      ),
    },
    {
      title: "Usage",
      key: "usage",
      render: (_, record) => (
        <span className="usage-fraction text-muted">
          {record.usedCount}/{record.usageLimit ?? "∞"}
        </span>
      ),
    },
    {
      title: "Validity",
      key: "validity",
      render: (_, record) => (
        <span className="expiry-date-text text-muted">
          {dayjs(record.startsAt).format("MMM DD, YYYY")} – {dayjs(record.endsAt).format("MMM DD, YYYY")}
        </span>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const { label, cls } = computeStatus(record);
        return <Tag className={`coupon-status-tag ${cls}`}>{label}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <div className="table-row-actions d-inline-flex gap-2 align-items-center">
          <Switch
            size="small"
            checked={record.isActive}
            onChange={() => handleToggleStatus(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            className="action-edit-btn fw-semibold"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            className="action-delete-btn p-1"
            onClick={() => handleDelete(record)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="d-flex justify-content-end mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="create-coupon-top-btn px-3 py-2 fw-semibold"
          onClick={resetForm}
        >
          Create Coupon
        </Button>
      </div>

      <div className="coupons-table-card-wrapper bg-white border mb-4">
        {loading ? (
          <div className="d-flex justify-content-center p-5">
            <Spin size="large" />
          </div>
        ) : error ? (
          <Alert type="error" message={error} showIcon className="m-3" />
        ) : coupons.length === 0 ? (
          <Empty description="No coupons created yet" className="p-5" />
        ) : (
          <Table
            columns={columns}
            dataSource={coupons}
            rowKey="_id"
            pagination={false}
            className="custom-coupons-data-grid"
          />
        )}
      </div>

      <div className="quick-create-form-surface p-4 bg-white border">
        <h3 className="form-inner-title mb-4">
          {editingCoupon ? `Edit Coupon — ${editingCoupon.code}` : "Create Coupon"}
        </h3>

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
          autoComplete="off"
          initialValues={{ type: "percentage", minOrderValue: 0, isActive: true }}
        >
          <div className="row g-4">
            <div className="col-12 col-md-6">
              <Form.Item
                label="Coupon Code"
                name="code"
                rules={[
                  { required: true, message: "Please enter a coupon code" },
                  { min: 3, message: "Coupon code must be at least 3 characters" },
                ]}
              >
                <Input
                  placeholder="e.g., SUMMER20"
                  className="custom-form-field"
                  size="large"
                  disabled={!!editingCoupon}
                  style={{ textTransform: "uppercase" }}
                />
              </Form.Item>
            </div>
            <div className="col-12 col-md-6">
              <Form.Item label="Description" name="description">
                <Input
                  placeholder="Optional description"
                  className="custom-form-field"
                  size="large"
                />
              </Form.Item>
            </div>
          </div>

          <div className="row g-4 mt-1">
            <div className="col-12 col-md-3">
              <Form.Item
                label="Discount Type"
                name="type"
                rules={[{ required: true, message: "Please select discount type" }]}
              >
                <Select size="large" className="custom-form-field">
                  <Select.Option value="percentage">Percentage</Select.Option>
                  <Select.Option value="flat">Flat Amount</Select.Option>
                </Select>
              </Form.Item>
            </div>
            <div className="col-12 col-md-3">
              <Form.Item
                label="Discount Value"
                name="value"
                rules={[{ required: true, message: "Please specify discount value" }]}
              >
                <InputNumber
                  placeholder="e.g., 20"
                  className="custom-form-field w-100"
                  size="large"
                  min={0}
                />
              </Form.Item>
            </div>
            <div className="col-12 col-md-3">
              <Form.Item label="Max Discount Cap" name="maxDiscountCap">
                <InputNumber
                  placeholder="e.g., 500"
                  className="custom-form-field w-100"
                  size="large"
                  min={0}
                />
              </Form.Item>
            </div>
            <div className="col-12 col-md-3">
              <Form.Item label="Min Order Value" name="minOrderValue">
                <InputNumber
                  placeholder="0"
                  className="custom-form-field w-100"
                  size="large"
                  min={0}
                />
              </Form.Item>
            </div>
          </div>

          <div className="row g-4 mt-1">
            <div className="col-12 col-md-3">
              <Form.Item label="Total Usage Limit" name="usageLimit">
                <InputNumber
                  placeholder="Unlimited"
                  className="custom-form-field w-100"
                  size="large"
                  min={1}
                />
              </Form.Item>
            </div>
            <div className="col-12 col-md-3">
              <Form.Item label="Usage Limit Per User" name="usageLimitPerUser">
                <InputNumber
                  placeholder="e.g., 1"
                  className="custom-form-field w-100"
                  size="large"
                  min={1}
                />
              </Form.Item>
            </div>
            <div className="col-12 col-md-4">
              <Form.Item
                label="Validity"
                name="validity"
                rules={[{ required: true, message: "Please select the validity period" }]}
              >
                <DatePicker.RangePicker
                  className="w-100 custom-form-field custom-datepicker"
                  size="large"
                  format="MMM DD, YYYY"
                />
              </Form.Item>
            </div>
            <div className="col-12 col-md-2">
              <Form.Item label="Active" name="isActive" valuePropName="checked">
                <Switch />
              </Form.Item>
            </div>
          </div>

          <Form.Item className="mb-0 mt-4 d-flex gap-2">
            <Button
              type="primary"
              htmlType="submit"
              icon={<TagOutlined />}
              loading={submitting}
              className="quick-create-submit-btn d-flex align-items-center justify-content-center"
              size="large"
            >
              {editingCoupon ? "Save Changes" : "Create Coupon"}
            </Button>
            {editingCoupon && (
              <Button size="large" className="ms-2" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default Coupons;
