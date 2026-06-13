import React, { useState } from "react";
import { Modal, Form, Input, Button, Row, Col, Divider, message } from "antd";
import { createPartner, type CreatePartnerPayload } from "../../services/partnerApi";

interface OnboardPartnerFormProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const OnboardPartnerForm: React.FC<OnboardPartnerFormProps> = ({ open, onClose, onCreated }) => {
  const [form] = Form.useForm<CreatePartnerPayload>();
  const [saving, setSaving] = useState(false);

  const handleFinish = async (values: CreatePartnerPayload) => {
    setSaving(true);
    try {
      const res = await createPartner(values);
      message.success(res.data.message || "Partner onboarded successfully");
      form.resetFields();
      onCreated?.();
      onClose();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to onboard partner");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      destroyOnClose
      width={680}
      title="Onboard Partner"
      className="onboard-partner-modal-override"
    >
      <Form form={form} layout="vertical" requiredMark={false} onFinish={handleFinish} autoComplete="off">
        <Divider orientation="left" plain>Account Details</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Contact Name"
              name="name"
              rules={[{ required: true, message: "Please enter the contact name" }]}
            >
              <Input size="large" placeholder="Full name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}
            >
              <Input size="large" placeholder="partner@example.com" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Phone"
              name="phone"
              rules={[{ required: true, message: "Please enter a phone number" }]}
            >
              <Input size="large" placeholder="Phone number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Alternate Phone" name="alternatePhone">
              <Input size="large" placeholder="Alternate phone (optional)" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" plain>Business Details</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Business Name"
              name="businessName"
              rules={[{ required: true, message: "Please enter the business name" }]}
            >
              <Input size="large" placeholder="Business / store name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="GST Number"
              name="gstNumber"
              rules={[{ required: true, len: 15, message: "GST number must be 15 characters" }]}
            >
              <Input size="large" placeholder="22AAAAA0000A1Z5" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          label="Business Address"
          name="businessAddress"
          rules={[{ required: true, message: "Please enter the business address" }]}
        >
          <Input.TextArea rows={2} placeholder="Business address" />
        </Form.Item>

        <Divider orientation="left" plain>Bank Details</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Account Holder Name"
              name={["bankDetails", "accountHolderName"]}
              rules={[{ required: true, message: "Please enter the account holder name" }]}
            >
              <Input size="large" placeholder="Account holder name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Account Number"
              name={["bankDetails", "accountNumber"]}
              rules={[{ required: true, message: "Please enter the account number" }]}
            >
              <Input size="large" placeholder="Bank account number" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          label="IFSC Code"
          name={["bankDetails", "ifscCode"]}
          rules={[{ required: true, len: 11, message: "IFSC code must be 11 characters" }]}
        >
          <Input size="large" placeholder="IFSC0001234" />
        </Form.Item>

        <div className="d-flex justify-content-end gap-2 mt-3">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={saving}>
            Onboard Partner
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default OnboardPartnerForm;
