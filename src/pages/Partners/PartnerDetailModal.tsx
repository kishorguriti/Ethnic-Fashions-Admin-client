import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Row, Col, Tag, Skeleton, Divider, message } from "antd";
import { EditOutlined, SaveOutlined, CloseOutlined, StopOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import {
  getPartnerById,
  updatePartner,
  togglePartnerStatus,
  type Partner,
  type UpdatePartnerPayload,
} from "../../services/partnerApi";

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
      title={mode === "edit" ? "Edit Partner" : "Partner Details"}
      className="partner-detail-modal-override"
    >
      {loading || !partner ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : mode === "view" ? (
        <div className="partner-detail-view">
          <div className="detail-row d-flex justify-content-between py-2">
            <span className="detail-label text-muted">Contact Name</span>
            <strong>{partner.name}</strong>
          </div>
          <div className="detail-row d-flex justify-content-between py-2">
            <span className="detail-label text-muted">Email</span>
            <strong>{partner.email}</strong>
          </div>
          <div className="detail-row d-flex justify-content-between py-2">
            <span className="detail-label text-muted">Phone</span>
            <strong>{partner.phone}</strong>
          </div>
          {partner.partnerProfile.alternatePhone && (
            <div className="detail-row d-flex justify-content-between py-2">
              <span className="detail-label text-muted">Alternate Phone</span>
              <strong>{partner.partnerProfile.alternatePhone}</strong>
            </div>
          )}
          <div className="detail-row d-flex justify-content-between py-2">
            <span className="detail-label text-muted">Status</span>
            <Tag color={partner.isActive ? "green" : "red"}>
              {partner.isActive ? "ACTIVE" : "INACTIVE"}
            </Tag>
          </div>

          <Divider orientation="left" plain>Business Details</Divider>
          <div className="detail-row d-flex justify-content-between py-2">
            <span className="detail-label text-muted">Business Name</span>
            <strong>{partner.partnerProfile.businessName}</strong>
          </div>
          <div className="detail-row d-flex justify-content-between py-2">
            <span className="detail-label text-muted">GST Number</span>
            <strong>{partner.partnerProfile.gstNumber}</strong>
          </div>
          <div className="detail-row d-flex justify-content-between py-2">
            <span className="detail-label text-muted">Address</span>
            <strong className="text-end">{partner.partnerProfile.businessAddress}</strong>
          </div>

          <Divider orientation="left" plain>Bank Details</Divider>
          <div className="detail-row d-flex justify-content-between py-2">
            <span className="detail-label text-muted">Account Holder</span>
            <strong>{partner.partnerProfile.bankDetails.accountHolderName}</strong>
          </div>
          <div className="detail-row d-flex justify-content-between py-2">
            <span className="detail-label text-muted">Account Number</span>
            <strong>{partner.partnerProfile.bankDetails.accountNumber}</strong>
          </div>
          <div className="detail-row d-flex justify-content-between py-2">
            <span className="detail-label text-muted">IFSC Code</span>
            <strong>{partner.partnerProfile.bankDetails.ifscCode}</strong>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
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

          <Divider orientation="left" plain>Business Details</Divider>
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

          <Divider orientation="left" plain>Bank Details</Divider>
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
