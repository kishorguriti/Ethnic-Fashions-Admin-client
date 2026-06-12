import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';

// TypeScript schema interfaces defining properties passed to the modal
interface AddCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newCategory: { name: string; description: string }) => void;
}

interface FormValues {
  categoryName: string;
  description?: string;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm<FormValues>();
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  // Handle local form submission lifecycle
  const handleFinish = async (values: FormValues) => {
    setConfirmLoading(true);
    try {
      // Simulate network request verification
      await new Promise((resolve) => setTimeout(resolve, 1200));
      
      onSuccess({
        name: values.categoryName,
        description: values.description || '',
      });

      form.resetFields();
      message.success('Category created successfully!');
      onClose();
    } catch (error) {
      message.error('An error occurred. Please try again.');
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered={true}
      className="add-category-modal-override"
      width={520}
      destroyOnClose={true}
    >
      <div className="modal-inner-content py-2">
        {/* Header Block Section */}
        <h2 className="modal-headline mb-4">Add New Category</h2>

        {/* Ant Design Form Control Module */}
        <Form
          form={form}
          name="add_new_category_form"
          layout="vertical"
          onFinish={handleFinish}
          requiredMark={false}
          autoComplete="off"
        >
          {/* Category Name String Input Field */}
          <Form.Item
            label="Category Name"
            name="categoryName"
            rules={[
              { required: true, message: 'Please enter a category name!' },
              { min: 3, message: 'Category name must be at least 3 characters long!' }
            ]}
          >
            <Input 
              placeholder="Enter category name" 
              className="custom-capsule-input" 
              size="large"
            />
          </Form.Item>

          {/* Description Multi-line Paragraph Input Field */}
          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea 
              placeholder="Enter description" 
              className="custom-capsule-input custom-textarea" 
              rows={3}
            />
          </Form.Item>

          {/* Primary Submit Action Control Button Layer */}
          <Form.Item className="mb-0 mt-4">
            <Button
              type="primary"
              htmlType="submit"
              loading={confirmLoading}
              className="brand-submit-action-btn w-100 d-flex align-items-center justify-content-center"
              size="large"
            >
              Create Category
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default AddCategoryModal;
