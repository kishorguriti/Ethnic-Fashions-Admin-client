import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Select, Button, message } from "antd";
import {
  createFaq,
  updateFaq,
  type Faq,
  type FaqCategory,
  type FaqStatus,
} from "../../services/faqApi";

interface AddFAQModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (faq: Faq) => void;
  editingFaq?: Faq | null;
}

interface FormValues {
  question: string;
  answer: string;
  category: FaqCategory;
  status: FaqStatus;
  displayOrder?: number;
}

const AddFAQModal: React.FC<AddFAQModalProps> = ({ open, onClose, onSuccess, editingFaq = null }) => {
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!editingFaq;

  useEffect(() => {
    if (!open) return;

    if (editingFaq) {
      form.setFieldsValue({
        question: editingFaq.question,
        answer: editingFaq.answer,
        category: editingFaq.category,
        status: editingFaq.status,
        displayOrder: editingFaq.displayOrder,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        category: "General",
        status: "published",
        displayOrder: 0,
      });
    }
  }, [open, editingFaq, form]);

  const handleFinish = async (values: FormValues) => {
    setSubmitting(true);
    try {
      if (isEdit && editingFaq) {
        const res = await updateFaq(editingFaq._id, values);
        message.success(res.data.message);
        onSuccess(res.data.data.faq);
      } else {
        const res = await createFaq(values);
        message.success(res.data.message);
        onSuccess(res.data.data.faq);
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
      title={isEdit ? "Edit FAQ" : "Add New FAQ"}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-3" requiredMark={false}>
        <Form.Item
          name="question"
          label="Question"
          rules={[{ required: true, message: "Please enter the question" }]}
        >
          <Input.TextArea rows={2} placeholder="e.g., What is your return policy?" />
        </Form.Item>

        <Form.Item
          name="answer"
          label="Answer"
          rules={[{ required: true, message: "Please enter the answer" }]}
        >
          <Input.TextArea rows={4} placeholder="Answer shown to customers" />
        </Form.Item>

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="General">General</Select.Option>
                <Select.Option value="Orders">Orders</Select.Option>
                <Select.Option value="Shipping">Shipping</Select.Option>
                <Select.Option value="Returns">Returns</Select.Option>
                <Select.Option value="Payments">Payments</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <div className="col-6 col-md-3">
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="published">Published</Select.Option>
                <Select.Option value="draft">Draft</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <div className="col-6 col-md-3">
            <Form.Item name="displayOrder" label="Order">
              <InputNumber className="w-100" min={0} />
            </Form.Item>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={submitting} className="btn-modal-submit">
            {isEdit ? "Save Changes" : "Save FAQ"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddFAQModal;
