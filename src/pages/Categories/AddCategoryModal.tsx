import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Button, message } from "antd";
import {
  createCategory,
  updateCategory,
  type Category,
} from "../../services/categoryApi";

interface AddCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (category: Category) => void;
  /** Category being edited, or null when creating a new one */
  editingCategory?: Category | null;
  /** Parent category id when creating a subcategory */
  parentId?: string | null;
  parentName?: string;
}

interface FormValues {
  name: string;
  displayOrder?: number;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  open,
  onClose,
  onSuccess,
  editingCategory = null,
  parentId = null,
  parentName,
}) => {
  const [form] = Form.useForm<FormValues>();
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const isEdit = !!editingCategory;

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        name: editingCategory?.name ?? "",
        displayOrder: editingCategory?.displayOrder ?? undefined,
      });
    }
  }, [open, editingCategory, form]);

  const handleFinish = async (values: FormValues) => {
    setConfirmLoading(true);
    try {
      if (isEdit && editingCategory) {
        const res = await updateCategory(editingCategory._id, {
          name: values.name,
          displayOrder: values.displayOrder,
        });
        message.success(res.data.message);
        onSuccess(res.data.data.category);
      } else {
        const res = await createCategory({
          name: values.name,
          displayOrder: values.displayOrder,
          ...(parentId ? { parent: parentId } : {}),
        });
        message.success(res.data.message);
        onSuccess(res.data.data.category);
      }
      form.resetFields();
      onClose();
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ||
          "An error occurred. Please try again.",
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const title = isEdit
    ? `Edit ${parentId ? "Subcategory" : "Category"}`
    : parentId
      ? `Add Subcategory${parentName ? ` to ${parentName}` : ""}`
      : "Add New Category";

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
        <h2 className="modal-headline mb-4">{title}</h2>

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
            name="name"
            rules={[
              { required: true, message: "Please enter a category name!" },
              {
                min: 2,
                message: "Category name must be at least 2 characters long!",
              },
            ]}
          >
            <Input
              placeholder="Enter category name"
              className="custom-capsule-input"
              size="large"
            />
          </Form.Item>

          {/* Display Order Numeric Input Field */}
          <Form.Item label="Display Order" name="displayOrder">
            <InputNumber
              placeholder="0"
              className="custom-capsule-input w-100"
              size="large"
              min={0}
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
              {isEdit ? "Save Changes" : "Create Category"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default AddCategoryModal;
