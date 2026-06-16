import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Switch, Button, Tag, Skeleton, Row, Col, Empty, message } from 'antd';
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  CheckCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import {
  getAdminCustomerById,
  updateAdminCustomer,
  setCustomerSuspension,
  type AdminCustomerDetail,
} from '../../services/customerApi';

const getInitials = (name: string, phone: string) => {
  const trimmed = name?.trim();
  if (trimmed) {
    const parts = trimmed.split(' ').filter(Boolean);
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : trimmed.slice(0, 2).toUpperCase();
  }
  return phone ? phone.slice(-2) : 'C?';
};

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({
  icon,
  label,
  value,
}) => (
  <div className="detail-item d-flex align-items-start gap-2">
    <span className="detail-item-icon">{icon}</span>
    <div className="detail-item-body">
      <span className="detail-item-label text-muted d-block">{label}</span>
      <span className="detail-item-value">{value}</span>
    </div>
  </div>
);

interface CustomerDetailModalProps {
  open: boolean;
  customerId: string | null;
  initialMode?: 'view' | 'edit';
  onClose: () => void;
  onUpdated?: () => void;
}

interface EditFormValues {
  name: string;
  email?: string;
  phone: string;
  isPhoneVerified: boolean;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  open,
  customerId,
  initialMode = 'view',
  onClose,
  onUpdated,
}) => {
  const [form] = Form.useForm<EditFormValues>();
  const [customer, setCustomer] = useState<AdminCustomerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);

  useEffect(() => {
    if (!open || !customerId) return;
    setMode(initialMode);
    setLoading(true);
    getAdminCustomerById(customerId)
      .then((res) => {
        const data = res.data.data;
        setCustomer(data);
        form.setFieldsValue({
          name: data.name,
          email: data.email,
          phone: data.phone,
          isPhoneVerified: data.isPhoneVerified,
        });
      })
      .catch(() => {
        message.error('Failed to load customer details.');
      })
      .finally(() => setLoading(false));
  }, [open, customerId, initialMode, form]);

  const handleSave = async (values: EditFormValues) => {
    if (!customerId) return;
    setSaving(true);
    try {
      const res = await updateAdminCustomer(customerId, values);
      setCustomer(res.data.data);
      message.success(res.data.message || 'Customer updated successfully');
      setMode('view');
      onUpdated?.();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setMode('view');
    onClose();
  };

  const handleToggleSuspension = () => {
    if (!customer) return;
    const suspending = !customer.isSuspended;
    Modal.confirm({
      title: suspending ? 'Suspend customer account?' : 'Reinstate customer account?',
      icon: <ExclamationCircleOutlined />,
      content: suspending
        ? `${customer.name || customer.phone} will no longer be able to sign in or place orders until reinstated.`
        : `${customer.name || customer.phone} will regain access to their account.`,
      okText: suspending ? 'Suspend' : 'Reinstate',
      okButtonProps: { danger: suspending },
      onOk: async () => {
        try {
          const res = await setCustomerSuspension(customer._id, suspending);
          setCustomer(res.data.data);
          message.success(res.data.message);
          onUpdated?.();
        } catch (err: any) {
          message.error(err?.response?.data?.message || 'Failed to update account status');
        }
      },
    });
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      destroyOnClose
      width={640}
      title={null}
      closeIcon={null}
      className="customer-detail-modal-override"
    >
      {loading || !customer ? (
        <Skeleton active avatar paragraph={{ rows: 6 }} className="p-2" />
      ) : mode === 'view' ? (
        <div className="customer-detail-view">
          <Button type="text" className="modal-close-btn" onClick={handleClose} aria-label="Close">
            ×
          </Button>

          <div className="detail-header d-flex align-items-start justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="customer-avatar-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0">
                {getInitials(customer.name, customer.phone)}
              </div>
              <div>
                <h4 className="mb-0 detail-header-title">{customer.name || 'Unnamed Customer'}</h4>
                <span className="text-muted small d-block customer-since-lbl">
                  Customer since{' '}
                  {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
            <Tag className="status-pill" color={customer.isSuspended ? 'red' : 'green'}>
              {customer.isSuspended ? 'SUSPENDED' : 'ACTIVE'}
            </Tag>
          </div>

          <div className="detail-section-card mt-4">
            <h6 className="detail-section-title">Contact Information</h6>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <DetailItem
                  icon={<PhoneOutlined />}
                  label="Phone"
                  value={customer.phone}
                />
              </Col>
              {customer.email && (
                <Col span={12}>
                  <DetailItem
                    icon={<MailOutlined />}
                    label="Email"
                    value={customer.email}
                  />
                </Col>
              )}
              <Col span={12}>
                <DetailItem
                  icon={<SafetyCertificateOutlined />}
                  label="Verification"
                  value={
                    <Tag
                      className={`segment-pill ${customer.isPhoneVerified ? 'tag-vip-purple' : 'tag-regular-slate'}`}
                    >
                      {customer.isPhoneVerified ? 'Verified' : 'Unverified'}
                    </Tag>
                  }
                />
              </Col>
            </Row>
          </div>

          <div className="detail-section-card mt-3">
            <h6 className="detail-section-title">
              Saved Addresses ({customer.addresses.length})
            </h6>
            {customer.addresses.length === 0 ? (
              <Empty description="No saved addresses" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <div className="d-flex flex-column gap-2">
                {customer.addresses.map((addr) => (
                  <div key={addr._id} className="address-card">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <EnvironmentOutlined className="address-icon" />
                        <strong className="address-name">{addr.fullName}</strong>
                      </div>
                      {addr.isDefault && (
                        <Tag className="segment-pill tag-vip-purple">Default</Tag>
                      )}
                    </div>
                    <div className="text-muted small address-phone">{addr.phone}</div>
                    <div className="text-muted small address-text">
                      {addr.addressLine1}
                      {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city},{' '}
                      {addr.state} {addr.pincode}, {addr.country}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="detail-footer-actions d-flex justify-content-end gap-2 mt-4">
            <Button
              danger={!customer.isSuspended}
              icon={customer.isSuspended ? <CheckCircleOutlined /> : <StopOutlined />}
              onClick={handleToggleSuspension}
            >
              {customer.isSuspended ? 'Reinstate Account' : 'Suspend Account'}
            </Button>
            <Button type="primary" icon={<EditOutlined />} onClick={() => setMode('edit')}>
              Edit Details
            </Button>
          </div>
        </div>
      ) : (
        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSave} autoComplete="off">
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter the customer name' }]}
          >
            <Input size="large" placeholder="Customer name" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ type: 'email', message: 'Please enter a valid email' }]}
          >
            <Input size="large" placeholder="customer@example.com" />
          </Form.Item>
          <Form.Item
            label="Phone"
            name="phone"
            rules={[{ required: true, message: 'Please enter a phone number' }]}
          >
            <Input size="large" placeholder="Phone number" />
          </Form.Item>
          <Form.Item label="Phone Verified" name="isPhoneVerified" valuePropName="checked">
            <Switch />
          </Form.Item>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button icon={<CloseOutlined />} onClick={() => setMode('view')}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
              Save Changes
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  );
};

export default CustomerDetailModal;
