import React, { useState } from "react";
import { Form, Input, Select, Button, message } from "antd";
import { BellOutlined, SendOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

// TypeScript interfaces for form data
interface NotificationFormValues {
  type: string;
  audience: string;
  title: string;
  message: string;
  deliveryMethod: string;
  schedule: string;
}

const SendNotification = ({ messageApi }) => {
  const [form] = Form.useForm();
  //   const [messageApi, contextHolder] = message.useMessage();
  const [previewTitle, setPreviewTitle] =
    useState<string>("Notification Title");
  const [previewMessage, setPreviewMessage] = useState<string>(
    "Your message will appear here...",
  );

  // Form submit handler
  const onFinish = (values: NotificationFormValues) => {
    messageApi.open({
      type: "success",
      content: "Notification sent successfully!",
    });
    console.log("Submitted Data:", values);
  };

  const handleSaveDraft = () => {
    const currentValues = form.getFieldsValue();
    messageApi.open({
      type: "info",
      content: "Progress saved as draft.",
    });
    console.log("Draft Data Saved:", currentValues);
  };

  return (
    <div className="row g-4">
      {/* Main Form Creation Area */}
      <div className="col-12 col-lg-8">
        <div className="content-card">
          <h2>Create Notification</h2>

          <Form
            form={form}
            layout="vertical"
            className="custom-form"
            onFinish={onFinish}
            initialValues={{ deliveryMethod: "push", schedule: "now" }}
          >
            <div className="row">
              <div className="col-12 col-md-6">
                <Form.Item
                  name="type"
                  label="Notification Type"
                  rules={[{ required: true, message: "Please select a type" }]}
                >
                  <Select placeholder="Select type" size="large">
                    <Option value="marketing">Marketing Announcement</Option>
                    <Option value="transactional">Transactional Alert</Option>
                    <Option value="system">System Maintenance</Option>
                  </Select>
                </Form.Item>
              </div>

              <div className="col-12 col-md-6">
                <Form.Item
                  name="audience"
                  label="Target Audience"
                  rules={[
                    {
                      required: true,
                      message: "Please select an audience",
                    },
                  ]}
                >
                  <Select placeholder="Select audience" size="large">
                    <Option value="all">All Users</Option>
                    <Option value="active">Active Premium Users</Option>
                    <Option value="inactive">Inactive (30+ Days)</Option>
                  </Select>
                </Form.Item>
              </div>
            </div>

            <Form.Item
              name="title"
              label="Notification Title"
              rules={[{ required: true, message: "Please enter a title" }]}
            >
              <Input
                placeholder="Enter notification title"
                size="large"
                onChange={(e) =>
                  setPreviewTitle(e.target.value || "Notification Title")
                }
              />
            </Form.Item>

            <Form.Item
              name="message"
              label="Message"
              rules={[{ required: true, message: "Please enter a message" }]}
            >
              <TextArea
                rows={4}
                placeholder="Enter notification message"
                onChange={(e) =>
                  setPreviewMessage(
                    e.target.value || "Your message will appear here...",
                  )
                }
              />
            </Form.Item>

            <div className="row">
              <div className="col-12 col-md-6">
                <Form.Item name="deliveryMethod" label="Delivery Method">
                  <Select placeholder="Select method" size="large">
                    <Option value="push">Push Notification</Option>
                    <Option value="email">Email Campaign</Option>
                    <Option value="sms">SMS Text Message</Option>
                  </Select>
                </Form.Item>
              </div>

              <div className="col-12 col-md-6">
                <Form.Item name="schedule" label="Schedule">
                  <Select placeholder="Send now" size="large">
                    <Option value="now">Send now</Option>
                    <Option value="later">Schedule for later</Option>
                  </Select>
                </Form.Item>
              </div>
            </div>

            <div className="d-flex gap-3 mt-3">
              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                className="btn-primary-purple d-flex align-items-center"
                size="large"
              >
                Send Notification
              </Button>
              <Button
                type="default"
                onClick={handleSaveDraft}
                className="btn-secondary-draft"
                size="large"
              >
                Save as Draft
              </Button>
            </div>
          </Form>
        </div>
      </div>

      {/* Sidebar Area (Live Preview & Summary Statistics) */}
      <div className="col-12 col-lg-4">
        <div className="row g-4">
          {/* Preview Panel Card */}
          <div className="col-12">
            <div className="content-card">
              <h2>Preview</h2>
              <div className="preview-box">
                <div className="preview-icon-wrapper">
                  <BellOutlined />
                </div>
                <div>
                  <div className="preview-title">{previewTitle}</div>
                  <div className="preview-msg">{previewMessage}</div>
                  <div className="preview-time">Just now</div>
                </div>
              </div>
            </div>
          </div>

          {/* Auxiliary Quick Stats Breakdown Panel */}
          <div className="col-12">
            <div className="content-card">
              <h2>Quick Stats</h2>
              <div className="quick-stats-list">
                <div className="quick-stat-item">
                  <span className="qs-label">Estimated Reach</span>{" "}
                  <span className="qs-value">3,842</span>
                </div>
                <div className="quick-stat-item">
                  <span className="qs-label">Push Enabled</span>{" "}
                  <span className="qs-value">2,845</span>
                </div>
                <div className="quick-stat-item">
                  <span className="qs-label">Email Subscribed</span>{" "}
                  <span className="qs-value">3,642</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendNotification;
