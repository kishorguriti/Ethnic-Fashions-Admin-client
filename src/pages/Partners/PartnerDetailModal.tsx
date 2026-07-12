import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Row, Col, Tag, Skeleton, Divider, message } from "antd";
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  StopOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  ShopOutlined,
  IdcardOutlined,
  EnvironmentOutlined,
  BankOutlined,
} from "@ant-design/icons";
import {
  getPartnerById,
  updatePartner,
  togglePartnerStatus,
  type Partner,
  type UpdatePartnerPayload,
} from "../../services/partnerApi";

const getInitials = (name: string) => {
  const trimmed = name?.trim();
  if (!trimmed) return "??";
  const parts = trimmed.split(" ").filter(Boolean);
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : trimmed.slice(0, 2).toUpperCase();
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

interface PartnerDetailModalProps {
  open: boolean;
  partnerId: string | null;
  initialMode?: "view" | "edit";
  onClose: () => void;
  onUpdated?: () => void;
}

const PartnerDetailModal: React.FC<PartnerDetailModalProps> = ({
  open,
  partnerId,
  initialMode = "view",
  onClose,
  onUpdated,
}) => {
  const [form] = Form.useForm<UpdatePartnerPayload>();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"view" | "edit">(initialMode);

  useEffect(() => {
    if (!open || !partnerId) return;
    setMode(initialMode);
    setLoading(true);
    getPartnerById(partnerId)
      .then((res) => {
        const data = res.data.data.partner;
        setPartner(data);
        form.setFieldsValue({
          name: data.name,
          phone: data.phone,
          businessName: data.partnerProfile.businessName,
          businessAddress: data.partnerProfile.businessAddress,
          gstNumber: data.partnerProfile.gstNumber,
          alternatePhone: data.partnerProfile.alternatePhone,
          bankDetails: data.partnerProfile.bankDetails,
        });
      })
      .catch(() => {
        message.error("Failed to load partner details.");
      })
      .finally(() => setLoading(false));
  }, [open, partnerId, initialMode, form]);

  const handleSave = async (values: UpdatePartnerPayload) => {
    if (!partnerId) return;
    setSaving(true);
    try {
      const res = await updatePartner(partnerId, values);
      setPartner(res.data.data.partner);
      message.success(res.data.message || "Partner updated successfully");
      setMode("view");
      onUpdated?.();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to update partner");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setMode("view");
    onClose();
  };

  const handleToggleStatus = () => {
    if (!partner) return;
    const activating = !partner.isActive;
    Modal.confirm({
      title: activating ? "Activate partner account?" : "Deactivate partner account?",
      icon: <ExclamationCircleOutlined />,
      content: activating
        ? `${partner.name} will regain access to the admin portal.`
        : `${partner.name} will no longer be able to log in until reactivated.`,
      okText: activating ? "Activate" : "Deactivate",
      okButtonProps: { danger: !activating },
      onOk: async () => {
        try {
          const res = await togglePartnerStatus(partner._id);
          setPartner(res.data.data.partner);
          message.success(res.data.message);
          onUpdated?.();
        } catch (err: any) {
          message.error(err?.response?.data?.message || "Failed to update partner status");
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
      width={680}
      title={null}
      closeIcon={null}
      className="partner-detail-modal-override"
    >
      {loading || !partner ? (
        <Skeleton active avatar paragraph={{ rows: 6 }} className="p-2" />
      ) : mode === "view" ? (
        <div className="partner-detail-view">
          <Button type="text" className="modal-close-btn" onClick={handleClose} aria-label="Close">
            ×
          </Button>

          <div className="detail-header d-flex align-items-start justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="partner-avatar-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0">
                {getInitials(partner.partnerProfile.businessName || partner.name)}
              </div>
              <div>
                <h4 className="mb-0 detail-header-title">{partner.partnerProfile.businessName}</h4>
                <span className="text-muted small">{partner.name}</span>
                <span className="text-muted small d-block partner-since-lbl">
                  Partner since {new Date(partner.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
            <Tag className="status-pill" color={partner.isActive ? "green" : "red"}>
              {partner.isActive ? "ACTIVE" : "INACTIVE"}
            </Tag>
          </div>

          <div className="detail-section-card mt-4">
            <h6 className="detail-section-title">Contact Information</h6>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <DetailItem icon={<MailOutlined />} label="Email" value={partner.email} />
              </Col>
              <Col span={12}>
                <DetailItem icon={<PhoneOutlined />} label="Phone" value={partner.phone} />
              </Col>
              {partner.partnerProfile.alternatePhone && (
                <Col span={12}>
                  <DetailItem
                    icon={<PhoneOutlined />}
                    label="Alternate Phone"
                    value={partner.partnerProfile.alternatePhone}
                  />
                </Col>
              )}
            </Row>
          </div>

          <div className="detail-section-card mt-3">
            <h6 className="detail-section-title">Business Details</h6>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <DetailItem
                  icon={<ShopOutlined />}
                  label="Business Name"
                  value={partner.partnerProfile.businessName}
                />
              </Col>
              <Col span={12}>
                <DetailItem
                  icon={<IdcardOutlined />}
                  label="GST Number"
                  value={partner.partnerProfile.gstNumber}
                />
              </Col>
              <Col span={24}>
                <DetailItem
                  icon={<EnvironmentOutlined />}
                  label="Address"
                  value={partner.partnerProfile.businessAddress}
                />
              </Col>
            </Row>
          </div>

          <div className="detail-section-card mt-3">
            <h6 className="detail-section-title">Bank Details</h6>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <DetailItem
                  icon={<BankOutlined />}
                  label="Account Holder"
                  value={partner.partnerProfile.bankDetails.accountHolderName}
                />
              </Col>
              <Col span={12}>
                <DetailItem
                  icon={<BankOutlined />}
                  label="Account Number"
                  value={partner.partnerProfile.bankDetails.accountNumber}
                />
              </Col>
              <Col span={12}>
                <DetailItem
                  icon={<BankOutlined />}
                  label="IFSC Code"
                  value={partner.partnerProfile.bankDetails.ifscCode}
                />
              </Col>
            </Row>
          </div>

          <div className="detail-footer-actions d-flex justify-content-end gap-2 mt-4">
            <Button
              danger={partner.isActive}
              icon={partner.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
              onClick={handleToggleStatus}
            >
              {partner.isActive ? "Deactivate" : "Activate"}
            </Button>
            <Button type="primary" icon={<EditOutlined />} onClick={() => setMode("edit")}>
              Edit Details
            </Button>
          </div>
        </div>
      ) : (
        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSave} autoComplete="off">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Contact Name" name="name" rules={[{ required: true, message: "Please enter the contact name" }]}>
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Phone" name="phone" rules={[{ required: true, message: "Please enter a phone number" }]}>
                <Input size="large" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Alternate Phone" name="alternatePhone">
            <Input size="large" />
          </Form.Item>

          <Divider titlePlacement="start" plain>Business Details</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Business Name" name="businessName" rules={[{ required: true, message: "Please enter the business name" }]}>
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="GST Number" name="gstNumber" rules={[{ required: true, len: 15, message: "GST number must be 15 characters" }]}>
                <Input size="large" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Business Address" name="businessAddress" rules={[{ required: true, message: "Please enter the business address" }]}>
            <Input.TextArea rows={2} />
          </Form.Item>

          <Divider titlePlacement="start" plain>Bank Details</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Account Holder Name" name={["bankDetails", "accountHolderName"]} rules={[{ required: true, message: "Please enter the account holder name" }]}>
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Account Number" name={["bankDetails", "accountNumber"]} rules={[{ required: true, message: "Please enter the account number" }]}>
                <Input size="large" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="IFSC Code" name={["bankDetails", "ifscCode"]} rules={[{ required: true, len: 11, message: "IFSC code must be 11 characters" }]}>
            <Input size="large" />
          </Form.Item>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button icon={<CloseOutlined />} onClick={() => setMode("view")}>
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

export default PartnerDetailModal;
