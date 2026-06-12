import React, { useState } from 'react';
import { Form, Input, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';

// TypeScript schema defining dynamic state parameters for the settings form
interface StoreSettingsFormValues {
  storeName: string;
  tagline?: string;
  contactEmail: string;
  contactPhone: string;
  storeAddress?: string;
}

const StoreSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('General');
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm<StoreSettingsFormValues>();
  
  // Local asset selection state tracker for custom store logo previewing mechanics
  const [logoFile, setLogoFile] = useState<UploadFile[]>([]);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>('');

  const handleLogoChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setLogoFile(newFileList);
    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      const targetUrl = URL.createObjectURL(newFileList[0].originFileObj);
      setLogoPreviewUrl(targetUrl);
    } else {
      setLogoPreviewUrl('');
    }
  };

  const onFinish = async (values: StoreSettingsFormValues) => {
    setLoading(true);
    try {
      console.log('Target Synced Workspace Payload:', { ...values, logo: logoFile });
      // Simulate asynchronous validation infrastructure saving lag times
      await new Promise((resolve) => setTimeout(resolve, 1500));
      message.success('Store configurations updated successfully!');
    } catch {
      message.error('Failed to sync store values. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="store-settings-container container-fluid p-4 min-vh-100">
      
      {/* 1. Main Page Description Title Layout Area Block */}
      <div className="settings-section-header mb-4">
        <h1 className="main-panel-title mb-1">Settings</h1>
        <p className="sub-panel-desc text-muted mb-0">Manage store settings and configuration</p>
      </div>

      {/* 2. Horizontal Sub-Navigation Tab Options Row Strip Wrapper */}
      <div className="settings-subnav-strip d-flex flex-wrap gap-2 align-items-center p-2 mb-4">
        {['General', 'Localization', 'Shipping', 'Payments', 'Social Media'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`subnav-pill border-0 px-3 py-1.5 fw-semibold ${activeTab === tab ? 'active' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. Core Store Information Panel Form Box Surface Layout */}
      <div className="settings-card-surface p-4 bg-white border">
        <h3 className="card-inner-headline mb-4">Store Information</h3>

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={onFinish}
          autoComplete="off"
          initialValues={{
            storeName: 'Ethnic Fashion',
            contactPhone: '+91 98765 43210'
          }}
        >
          {/* Store Name Field */}
          <Form.Item
            label="Store Name"
            name="storeName"
            rules={[{ required: true, message: 'Please specify the store name' }]}
          >
            <Input placeholder="Enter store name" className="custom-settings-field" size="large" />
          </Form.Item>

          {/* Tagline Field */}
          <Form.Item label="Tagline" name="tagline">
            <Input placeholder="Your store's tagline" className="custom-settings-field" size="large" />
          </Form.Item>

          {/* Contact Email Field */}
          <Form.Item
            label="Contact Email"
            name="contactEmail"
            rules={[
              { required: true, message: 'Please specify the contact email' },
              { type: 'email', message: 'Please provide a valid email structure' }
            ]}
          >
            <Input placeholder="contact@example.com" className="custom-settings-field" size="large" />
          </Form.Item>

          {/* Contact Phone Field */}
          <Form.Item
            label="Contact Phone"
            name="contactPhone"
            rules={[{ required: true, message: 'Please specify a phone number' }]}
          >
            <Input placeholder="Enter phone number" className="custom-settings-field" size="large" />
          </Form.Item>

          {/* Store Address Field */}
          <Form.Item label="Store Address" name="storeAddress">
            <Input placeholder="Enter store address" className="custom-settings-field" size="large" />
          </Form.Item>

          {/* Store Logo Interactive Upload Canvas Field Segment */}
          <Form.Item label="Store Logo" className="mb-4">
            <div className="logo-upload-wrapper d-flex align-items-center gap-4 flex-wrap flex-sm-nowrap">
              {/* Image Preview Box mirroring custom linear gradient found in design */}
              <div 
                className="logo-preview-box overflow-hidden d-flex align-items-center justify-content-center flex-shrink-0"
                style={!logoPreviewUrl ? { background: 'linear-gradient(135deg, #a800e6 0%, #ff007f 100%)' } : {}}
              >
                {logoPreviewUrl ? (
                  <img src={logoPreviewUrl} alt="Store Logo Preview" className="w-100 h-100 object-fit-cover" />
                ) : (
                  <div className="empty-filler-preview-tint" />
                )}
              </div>
              
              {/* Ant Design Upload button framework trigger */}
              <Upload
                name="storeLogo"
                fileList={logoFile}
                onChange={handleLogoChange}
                beforeUpload={() => false}
                maxCount={1}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />} className="custom-upload-action-btn fw-semibold" size="large">
                  Upload Logo
                </Button>
              </Upload>
            </div>
          </Form.Item>

          {/* Primary Save Changes Action Handler Button Block */}
          <Form.Item className="mb-0 mt-5">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="settings-save-brand-btn d-flex align-items-center justify-content-center fw-semibold"
              size="large"
            >
              Save Changes
            </Button>
          </Form.Item>

        </Form>
      </div>

    </div>
  );
};

export default StoreSettings;
