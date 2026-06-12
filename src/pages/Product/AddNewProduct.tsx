import React, { useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Upload,
  Button,
  Tabs,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  TagOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";

// TypeScript schema defining product payload structure
interface ProductFormValues {
  productName: string;
  category: string;
  sku: string;
  price: number;
  discount: number;
  stockQuantity: number;
  description: string;
  isActive: boolean;
  isFeatured: boolean;
}

const AddNewProduct: React.FC = () => {
  const [form] = Form.useForm<ProductFormValues>();
  const [loading, setLoading] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [tab, setTab] = useState<any>("1");

  // Controlled states for subordinate preview grid boxes
  const [previewImages, setPreviewImages] = useState<string[]>(
    Array(4).fill(""),
  );

  const handleUploadChange: UploadProps["onChange"] = ({
    fileList: newFileList,
  }) => {
    setFileList(newFileList);

    // Dynamically map up to 4 images to populate the small grid placeholders
    const updatedPreviews = Array(4).fill("");
    newFileList.slice(0, 4).forEach((file, index) => {
      if (file.url) {
        updatedPreviews[index] = file.url;
      } else if (file.originFileObj) {
        updatedPreviews[index] = URL.createObjectURL(file.originFileObj);
      }
    });
    setPreviewImages(updatedPreviews);
  };

  const onFinish = async (values: ProductFormValues) => {
    setLoading(true);
    try {
      console.log("Product Data Payload:", { ...values, images: fileList });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      message.success("Product created successfully!");
    } catch (error) {
      message.error("Failed to create product. Check input values.");
    } finally {
      setLoading(false);
    }
  };
  const onChange = (key: string) => {
    console.log(key);
    setTab(key);
  };

  return (
    <div className="add-product-container container-fluid p-4 min-vh-100">
      {/* Top Header Section with Back Action link */}
      <div className="header-navigation-row mb-4">
        <button className="back-btn d-inline-flex align-items-center gap-2 p-0 border-0 bg-transparent mb-2">
          <ArrowLeftOutlined /> Back
        </button>
        <h1 className="main-title mb-1">Add New Product</h1>
        <p className="subtitle-text text-muted mb-0">Create a new product</p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        initialValues={{
          price: 0,
          discount: 0,
          stockQuantity: 0,
          isActive: true,
          isFeatured: false,
        }}
      >
        {/* Main Split Layout Core Grid (Bootstrap 5 columns) */}
        <div className="row g-4">
          {/* LEFT PANEL: Core Textual and Numerical Data Forms */}
          <div className="col-12 col-lg-8">
            <div className="form-card-surface card-info-box p-4">
              {/* Tab headers mapping the specific layout tabs */}
              <Tabs
                defaultActiveKey="1"
                className="custom-form-tabs mb-4"
                items={[
                  { key: "1", label: "Basic Information" },
                  { key: "2", label: "Attributes" },
                  { key: "3", label: "SEO" },
                ]}
                onChange={onChange}
              />
              {tab === "1" && (
                <>
                  {/* Product Name String Field */}
                  <Form.Item
                    label="Product Name"
                    name="productName"
                    rules={[
                      {
                        required: true,
                        message: "Please enter the product name",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter product name"
                      className="custom-form-input"
                      size="large"
                    />
                  </Form.Item>

                  {/* Category and SKU Split Dynamic Fields row */}
                  <div className="row">
                    <div className="col-12 col-md-6">
                      <Form.Item
                        label="Category"
                        name="category"
                        rules={[
                          {
                            required: true,
                            message: "Please select a category",
                          },
                        ]}
                      >
                        <Select
                          placeholder="Select category"
                          className="custom-form-select"
                          size="large"
                          options={[
                            { value: "sarees", label: "Sarees" },
                            { value: "churidars", label: "Churidars" },
                            { value: "jewellery", label: "Jewellery" },
                          ]}
                        />
                      </Form.Item>
                    </div>
                    <div className="col-12 col-md-6">
                      <Form.Item
                        label="SKU"
                        name="sku"
                        rules={[
                          { required: true, message: "Please enter SKU code" },
                        ]}
                      >
                        <Input
                          placeholder="Enter SKU"
                          className="custom-form-input"
                          size="large"
                        />
                      </Form.Item>
                    </div>
                  </div>

                  {/* Triple Split Price, Discount, and Inventory Metric input rows */}
                  <div className="row">
                    <div className="col-12 col-md-4">
                      <Form.Item
                        label="Price (₹)"
                        name="price"
                        rules={[{ required: true }]}
                      >
                        <InputNumber
                          min={0}
                          className="w-100 custom-form-input"
                          size="large"
                        />
                      </Form.Item>
                    </div>
                    <div className="col-12 col-md-4">
                      <Form.Item label="Discount (%)" name="discount">
                        <InputNumber
                          min={0}
                          max={100}
                          className="w-100 custom-form-input"
                          size="large"
                        />
                      </Form.Item>
                    </div>
                    <div className="col-12 col-md-4">
                      <Form.Item
                        label="Stock Quantity"
                        name="stockQuantity"
                        rules={[{ required: true }]}
                      >
                        <InputNumber
                          min={0}
                          className="w-100 custom-form-input"
                          size="large"
                        />
                      </Form.Item>
                    </div>
                  </div>

                  {/* Rich Content Paragraph Box Field */}
                  <Form.Item label="Product Description" name="description">
                    <Input.TextArea
                      placeholder="Enter product description"
                      rows={4}
                      className="custom-form-input custom-textarea"
                    />
                  </Form.Item>
                </>
              )}
              {tab === "2" && (
                <div>
                  <div className="empty-state-dashed-box d-flex flex-column align-items-center justify-content-center text-center p-5">
                    <div className="icon-badge-circle d-flex align-items-center justify-content-center mb-4">
                      <TagOutlined className="badge-tag-icon" />
                    </div>
                    <h3 className="empty-state-main-msg mb-2">
                      Select a category to view attributes
                    </h3>
                    <p className="empty-state-sub-instruction mb-0 text-muted mx-auto">
                      Go to Basic Information tab and choose a category
                    </p>
                  </div>
                </div>
              )}
              {tab === "3" && (
                <div>
                  <Form.Item
                    label="Meta Title"
                    name="metaTitle"
                    rules={[
                      {
                        required: true,
                        message: "Please enter the Meta Title",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter Meta Title"
                      className="custom-form-input"
                      size="large"
                    />
                  </Form.Item>
                  <Form.Item label="Meta Description" name="metaDescription">
                    <Input.TextArea
                      placeholder="Enter Meta description"
                      rows={4}
                      className="custom-form-input custom-textarea"
                    />
                  </Form.Item>
                  <Form.Item
                    label="Keywords"
                    name="keywords"
                    rules={[
                      {
                        required: true,
                        message: "Please enter the Keywords",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter Keywords"
                      className="custom-form-input"
                      size="large"
                    />
                  </Form.Item>
                  <Form.Item
                    label="URL Slug"
                    name="slug"
                    rules={[
                      {
                        required: true,
                        message: "Please enter the URL Slug",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter URL Slug"
                      className="custom-form-input"
                      size="large"
                    />
                  </Form.Item>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Product Images Upload and Conditional Toggles */}
          <div className="col-12 col-lg-4">
            <div className="d-flex flex-column gap-4">
              {/* Box Area A: Image Assets Collection Panel */}
              <div className="form-card-surface p-4">
                <h3 className="card-inner-heading mb-4">Product Images</h3>

                <Upload.Dragger
                  name="files"
                  multiple={true}
                  fileList={fileList}
                  onChange={handleUploadChange}
                  beforeUpload={() => false} // Halts auto remote submission triggering
                  showUploadList={false}
                  className="custom-drag-uploader"
                >
                  <div className="uploader-content py-4 text-center">
                    <UploadOutlined className="upload-icon-arrow mb-3" />
                    <p className="upload-main-text mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="upload-sub-text text-muted small mb-0">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                </Upload.Dragger>

                {/* Grid collection display mimicking image placeholder boxes */}
                <div className="row row-cols-2 g-3 mt-1">
                  {previewImages.map((src, i) => (
                    <div className="col" key={i}>
                      <div className="preview-placeholder-square overflow-hidden border d-flex align-items-center justify-content-center">
                        {src ? (
                          <img
                            src={src}
                            alt={`Preview ${i + 1}`}
                            className="w-100 h-100 object-fit-cover"
                          />
                        ) : (
                          <div className="empty-filler-box" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box Area B: System Level Status Switches */}
              <div className="form-card-surface p-4">
                <h3 className="card-inner-heading mb-4">Status</h3>

                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="toggle-label-text">Active</span>
                  <Form.Item name="isActive" valuePropName="checked" noStyle>
                    <Switch className="custom-form-switch" />
                  </Form.Item>
                </div>

                <div className="d-flex align-items-center justify-content-between">
                  <span className="toggle-label-text">Featured</span>
                  <Form.Item name="isFeatured" valuePropName="checked" noStyle>
                    <Switch className="custom-form-switch" />
                  </Form.Item>
                </div>
              </div>

              {/* Box Area C: Main Form Control Submission Layer Buttons */}
              <div className="action-button-stack d-flex flex-column gap-2 mt-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="brand-submit-btn w-100 btn-lg"
                  size="large"
                >
                  Create Product
                </Button>
                <Button className="brand-cancel-btn w-100 btn-lg" size="large">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default AddNewProduct;
