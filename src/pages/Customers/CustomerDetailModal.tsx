import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Switch, Button, Tag, Skeleton, message, Empty } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined, ExclamationCircleOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import {
  getAdminCustomerById,
  updateAdminCustomer,
  setCustomerSuspension,
  type AdminCustomerDetail,
} from '../../services/customerApi';

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
      }
    });
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      destroyOnClose
      title={mode === 'edit' ? 'Edit Customer' : 'Customer Details'}
      className="customer-detail-modal-override"
    >
      {loading || !customer ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : mode === 'view' ? (
        <div className="customer-detail-view">
          <div className="detail-row d-flex justify-content-between py-2">
            <span className="detail-label text-muted">Name</span>
            <strong>{customer.name || 'Unnamed Customer'}</strong>
          </div>
          <div className="detail-row d-flex justify-content-between py-2">
            <span className="detail-label text-muted">Email</span>
            <strong>{customer.email || '—'}</strong>
          </div>
          <div className="detail-row d-flex justify-content-between py-2">
            <span className="detail-label text-muted">Phone</span>
            <strong>{customer.phone}</strong>
          </div>
          <div className="detail-row d-flex justify-content-between py-2">
            <span className="detail-label text-muted">Verification</span>
            <Tag className={`segment-pill ${customer.isPhoneVerified ? 'tag-vip-purple' : 'tag-regular-slate'}`}>
              {customer.isPhoneVerified ? 'Verified' : 'Unverified'}
            </Tag>
          </div>
          <div className="detail-row d-flex justify-content-between py-2">
            <span className="detail-label text-muted">Registered On</span>
            <strong>
              {new Date(customer.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
            </strong>
          </div>
          <div className="detail-row d-flex justify-content-between py-2">
            <span className="detail-label text-muted">Account Status</span>
            <Tag className={`segment-pill ${customer.isSuspended ? 'tag-suspended-red' : 'tag-active-green'}`}>
              {customer.isSuspended ? 'Suspended' : 'Active'}
            </Tag>
          </div>

          <h5 className="mt-4 mb-2">Saved Addresses ({customer.addresses.length})</h5>
          {customer.addresses.length === 0 ? (
            <Empty description="No saved addresses" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <div className="d-flex flex-column gap-2">
              {customer.addresses.map((addr) => (
                <div key={addr._id} className="address-card border rounded-3 p-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <strong>{addr.fullName}</strong>
                    {addr.isDefault && <Tag className="segment-pill tag-vip-purple">Default</Tag>}
                  </div>
                  <div className="text-muted small">{addr.phone}</div>
                  <div className="text-muted small">
                    {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}, {addr.state} {addr.pincode}, {addr.country}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="d-flex justify-content-end gap-2 mt-4">
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
