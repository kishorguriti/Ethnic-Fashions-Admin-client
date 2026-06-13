import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Button, message } from "antd";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import {
  BoldOutlined,
  ItalicOutlined,
  StrikethroughOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import {
  getStaticPageById,
  updateStaticPage,
  type StaticPage,
  type PageStatus,
} from "../../services/staticPageApi";

interface EditStaticPageModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (page: StaticPage) => void;
  pageId: string | null;
}

interface FormValues {
  title: string;
  status: PageStatus;
  metaTitle?: string;
  metaDescription?: string;
}

const EditStaticPageModal: React.FC<EditStaticPageModalProps> = ({
  open,
  onClose,
  onSuccess,
  pageId,
}) => {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [slug, setSlug] = React.useState("");

  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false })],
    content: "",
  });

  useEffect(() => {
    if (!open || !pageId) return;

    const loadPage = async () => {
      setLoading(true);
      try {
        const res = await getStaticPageById(pageId);
        const page = res.data.data.page;
        form.setFieldsValue({
          title: page.title,
          status: page.status,
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
        });
        setSlug(page.slug);
        editor?.commands.setContent(page.content || "");
      } catch (err: any) {
        message.error(err?.response?.data?.message || "Failed to load page");
      } finally {
        setLoading(false);
      }
    };

    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pageId]);

  const handleFinish = async (values: FormValues) => {
    if (!pageId) return;
    setSubmitting(true);
    try {
      const payload = {
        title: values.title,
        status: values.status,
        metaTitle: values.metaTitle,
        metaDescription: values.metaDescription,
        content: editor?.getHTML() ?? "",
      };
      const res = await updateStaticPage(pageId, payload);
      message.success(res.data.message || "Page updated");
      onSuccess(res.data.data.page);
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
      className="edit-static-page-modal-override"
      width="min(900px, 95vw)"
      destroyOnClose
    >
      <div className="modal-inner-content py-2">
        <h2 className="modal-headline mb-1">Edit Page</h2>
        <p className="text-muted mb-4">
          URL: <span className="purple-slug-link fw-medium">/{slug}</span>
        </p>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          requiredMark={false}
          autoComplete="off"
          disabled={loading}
        >
          <div className="row g-3">
            <div className="col-12 col-md-8">
              <Form.Item
                label="Page Title"
                name="title"
                rules={[{ required: true, message: "Please enter a page title" }]}
              >
                <Input placeholder="Page title" size="large" />
              </Form.Item>
            </div>
            <div className="col-12 col-md-4">
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: "Please select a status" }]}
              >
                <Select size="large">
                  <Select.Option value="published">Published</Select.Option>
                  <Select.Option value="draft">Draft</Select.Option>
                </Select>
              </Form.Item>
            </div>
          </div>

          <Form.Item label="Content">
            <div className="rich-text-editor-wrapper">
              <div className="rich-text-toolbar">
                <Button
                  type="text"
                  icon={<BoldOutlined />}
                  className={editor?.isActive("bold") ? "is-active" : ""}
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                />
                <Button
                  type="text"
                  icon={<ItalicOutlined />}
                  className={editor?.isActive("italic") ? "is-active" : ""}
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                />
                <Button
                  type="text"
                  icon={<StrikethroughOutlined />}
                  className={editor?.isActive("strike") ? "is-active" : ""}
                  onClick={() => editor?.chain().focus().toggleStrike().run()}
                />
                <Button
                  type="text"
                  className={editor?.isActive("heading", { level: 2 }) ? "is-active" : ""}
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                  H2
                </Button>
                <Button
                  type="text"
                  className={editor?.isActive("heading", { level: 3 }) ? "is-active" : ""}
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                >
                  H3
                </Button>
                <Button
                  type="text"
                  icon={<UnorderedListOutlined />}
                  className={editor?.isActive("bulletList") ? "is-active" : ""}
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                />
                <Button
                  type="text"
                  icon={<OrderedListOutlined />}
                  className={editor?.isActive("orderedList") ? "is-active" : ""}
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                />
                <Button
                  type="text"
                  icon={<LinkOutlined />}
                  className={editor?.isActive("link") ? "is-active" : ""}
                  onClick={() => {
                    const url = window.prompt("Enter URL");
                    if (url === null) return;
                    if (url === "") {
                      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
                    } else {
                      editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
                    }
                  }}
                />
              </div>
              <EditorContent editor={editor} className="rich-text-editor-content" />
            </div>
          </Form.Item>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <Form.Item label="Meta Title" name="metaTitle">
                <Input placeholder="SEO title (optional)" size="large" />
              </Form.Item>
            </div>
            <div className="col-12 col-md-6">
              <Form.Item label="Meta Description" name="metaDescription">
                <Input.TextArea placeholder="SEO description (optional)" rows={1} />
              </Form.Item>
            </div>
          </div>

          <Form.Item className="mb-0 mt-3">
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="brand-submit-action-btn w-100 d-flex align-items-center justify-content-center"
              size="large"
            >
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default EditStaticPageModal;
