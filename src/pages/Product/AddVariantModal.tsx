import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Button, Upload, message } from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import {
  addVariant,
  updateVariant,
  type ProductVariant,
} from "../../services/productApi";
import { uploadImageAsset, type Asset } from "../../services/assetApi";

interface AddVariantModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (variant: ProductVariant) => void;
  productId: string;
  editingVariant?: ProductVariant | null;
}

interface FormValues {
  color: string;
  size?: string;
  mrp: number;
  sellingPrice: number;
  stock?: number;
}

const AddVariantModal: React.FC<AddVariantModalProps> = ({
  open,
  onClose,
  onSuccess,
  productId,
  editingVariant = null,
}) => {
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [media, setMedia] = useState<Asset[]>([]);

  const isEdit = !!editingVariant;

  useEffect(() => {
    if (!open) return;

    if (editingVariant) {
      form.setFieldsValue({
        color: editingVariant.color,
        size: editingVariant.size || undefined,
        mrp: editingVariant.mrp,
        sellingPrice: editingVariant.sellingPrice,
        stock: editingVariant.stock,
      });
      setMedia(editingVariant.media || []);
    } else {
      form.resetFields();
      setMedia([]);
    }
  }, [open, editingVariant, form]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadImageAsset(file, "products");
      setMedia((prev) => [...prev, res.data.data.asset]);
      message.success("Upload successful");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const uploadProps: UploadProps = {
    showUploadList: false,
    multiple: true,
    accept: "image/*",
    beforeUpload: (file) => {
      handleUpload(file);
      return false;
    },
  };

  const removeMedia = (id: string) => {
    setMedia((prev) => prev.filter((m) => m._id !== id));
  };

  const handleFinish = async (values: FormValues) => {
    if (values.sellingPrice > values.mrp) {
      message.error("Selling price cannot be greater than MRP");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        color: values.color,
        size: values.size,
        mrp: values.mrp,
        sellingPrice: values.sellingPrice,
        stock: values.stock,
        media: media.map((m) => m._id),
      };

      if (isEdit && editingVariant) {
        const res = await updateVariant(productId, editingVariant._id, payload);
        message.success(res.data.message);
        onSuccess(res.data.data.variant);
      } else {
        const res = await addVariant(productId, payload);
        message.success(res.data.message);
        onSuccess(res.data.data.variant);
      }
      onClose();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={600}
      destroyOnClose
    >
      <div className="modal-inner-content py-2">
        <h2 className="modal-headline mb-4">{isEdit ? "Edit Variant" : "Add Variant"}</h2>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          requiredMark={false}
          autoComplete="off"
        >
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <Form.Item
                label="Color"
                name="color"
                rules={[{ required: true, message: "Please enter a color" }]}
              >
                <Input placeholder="e.g., Red" size="large" />
              </Form.Item>
            </div>
            <div className="col-12 col-md-6">
              <Form.Item label="Size" name="size">
                <Input placeholder="e.g., M (leave blank for Free Size)" size="large" />
              </Form.Item>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-4">
              <Form.Item
                label="MRP"
                name="mrp"
                rules={[{ required: true, message: "Please enter MRP" }]}
              >
                <InputNumber className="w-100" size="large" min={1} />
              </Form.Item>
            </div>
            <div className="col-12 col-md-4">
              <Form.Item
                label="Selling Price"
                name="sellingPrice"
                rules={[{ required: true, message: "Please enter selling price" }]}
              >
                <InputNumber className="w-100" size="large" min={1} />
              </Form.Item>
            </div>
            <div className="col-12 col-md-4">
              <Form.Item label="Stock" name="stock">
                <InputNumber className="w-100" size="large" min={0} />
              </Form.Item>
            </div>
          </div>

          <Form.Item label="Images">
            <div className="d-flex flex-wrap gap-2">
              {media.map((m) => (
                <div
                  key={m._id}
                  style={{ position: "relative", width: 96, height: 96 }}
                >
                  <img
                    src={m.url}
                    alt="variant"
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
                  />
                  <Button
                    size="small"
                    danger
                    type="primary"
                    shape="circle"
                    style={{ position: "absolute", top: -8, right: -8 }}
                    onClick={() => removeMedia(m._id)}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Upload {...uploadProps} listType="picture-card">
                <div>
                  {uploading ? <LoadingOutlined /> : <PlusOutlined />}
                  <div className="mt-1">Upload</div>
                </div>
              </Upload>
            </div>
          </Form.Item>

          <Form.Item className="mb-0 mt-3">
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="brand-submit-action-btn w-100 d-flex align-items-center justify-content-center"
              size="large"
            >
              {isEdit ? "Save Changes" : "Add Variant"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default AddVariantModal;
