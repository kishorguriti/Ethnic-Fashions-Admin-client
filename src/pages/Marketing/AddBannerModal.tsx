import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Slider,
  DatePicker,
  Upload,
  message,
} from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import dayjs from "dayjs";
import {
  createBanner,
  updateBanner,
  type Banner,
  type BannerPlacement,
  type BannerMediaType,
} from "../../services/bannerApi";
import { uploadImageAsset, uploadVideoAsset } from "../../services/assetApi";
import BannerLivePreview from "./BannerLivePreview";

interface AddBannerModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (banner: Banner) => void;
  editingBanner?: Banner | null;
}

interface FormValues {
  title: string;
  subtitle?: string;
  badge?: string;
  placement: BannerPlacement;
  mediaType: BannerMediaType;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  textColor?: string;
  overlayOpacity?: number;
  campaign?: string;
  schedule?: [dayjs.Dayjs, dayjs.Dayjs];
  displayOrder?: number;
  isActive: boolean;
}

interface MediaState {
  id: string | null;
  url: string | null;
}

const emptyMedia: MediaState = { id: null, url: null };

const AddBannerModal: React.FC<AddBannerModalProps> = ({
  open,
  onClose,
  onSuccess,
  editingBanner = null,
}) => {
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [mediaType, setMediaType] = useState<BannerMediaType>("image");

  const [desktopImage, setDesktopImage] = useState<MediaState>(emptyMedia);
  const [mobileImage, setMobileImage] = useState<MediaState>(emptyMedia);
  const [desktopVideo, setDesktopVideo] = useState<MediaState>(emptyMedia);
  const [mobileVideo, setMobileVideo] = useState<MediaState>(emptyMedia);

  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const isEdit = !!editingBanner;

  const watchedPlacement = Form.useWatch("placement", form) || "hero";
  const watchedMediaType = Form.useWatch("mediaType", form) || "image";
  const watchedTitle = Form.useWatch("title", form);
  const watchedSubtitle = Form.useWatch("subtitle", form);
  const watchedBadge = Form.useWatch("badge", form);
  const watchedTextColor = Form.useWatch("textColor", form);
  const watchedOverlayOpacity = Form.useWatch("overlayOpacity", form);
  const watchedCtaText = Form.useWatch("ctaText", form);
  const watchedSecondaryCtaText = Form.useWatch("secondaryCtaText", form);

  useEffect(() => {
    if (!open) return;

    if (editingBanner) {
      form.setFieldsValue({
        title: editingBanner.title,
        subtitle: editingBanner.subtitle,
        badge: editingBanner.badge,
        placement: editingBanner.placement,
        mediaType: editingBanner.mediaType,
        ctaText: editingBanner.ctaText,
        ctaLink: editingBanner.ctaLink,
        secondaryCtaText: editingBanner.secondaryCtaText,
        secondaryCtaLink: editingBanner.secondaryCtaLink,
        textColor: editingBanner.textColor || "#ffffff",
        overlayOpacity: editingBanner.overlayOpacity ?? 0.3,
        campaign: editingBanner.campaign,
        schedule:
          editingBanner.startsAt && editingBanner.endsAt
            ? [dayjs(editingBanner.startsAt), dayjs(editingBanner.endsAt)]
            : undefined,
        displayOrder: editingBanner.displayOrder,
        isActive: editingBanner.isActive,
      });
      setMediaType(editingBanner.mediaType);
      setDesktopImage(
        editingBanner.desktopImage
          ? { id: editingBanner.desktopImage._id, url: editingBanner.desktopImage.url }
          : emptyMedia,
      );
      setMobileImage(
        editingBanner.mobileImage
          ? { id: editingBanner.mobileImage._id, url: editingBanner.mobileImage.url }
          : emptyMedia,
      );
      setDesktopVideo(
        editingBanner.desktopVideo
          ? { id: editingBanner.desktopVideo._id, url: editingBanner.desktopVideo.url }
          : emptyMedia,
      );
      setMobileVideo(
        editingBanner.mobileVideo
          ? { id: editingBanner.mobileVideo._id, url: editingBanner.mobileVideo.url }
          : emptyMedia,
      );
    } else {
      form.resetFields();
      form.setFieldsValue({
        placement: "hero",
        mediaType: "image",
        textColor: "#ffffff",
        overlayOpacity: 0.3,
        isActive: true,
      });
      setMediaType("image");
      setDesktopImage(emptyMedia);
      setMobileImage(emptyMedia);
      setDesktopVideo(emptyMedia);
      setMobileVideo(emptyMedia);
    }
  }, [open, editingBanner, form]);

  const handleUpload = async (
    file: File,
    kind: "desktopImage" | "mobileImage" | "desktopVideo" | "mobileVideo",
    folder: string,
  ) => {
    setUploading((prev) => ({ ...prev, [kind]: true }));
    try {
      const isVideo = kind === "desktopVideo" || kind === "mobileVideo";
      const res = isVideo
        ? await uploadVideoAsset(file, folder)
        : await uploadImageAsset(file, folder);
      const asset = res.data.data.asset;
      const setter = {
        desktopImage: setDesktopImage,
        mobileImage: setMobileImage,
        desktopVideo: setDesktopVideo,
        mobileVideo: setMobileVideo,
      }[kind];
      setter({ id: asset._id, url: asset.url });
      message.success("Upload successful");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading((prev) => ({ ...prev, [kind]: false }));
    }
  };

  const uploadProps = (
    kind: "desktopImage" | "mobileImage" | "desktopVideo" | "mobileVideo",
    folder: string,
  ): UploadProps => ({
    showUploadList: false,
    multiple: false,
    accept: kind.includes("Video") ? "video/*" : "image/*",
    beforeUpload: (file) => {
      handleUpload(file, kind, folder);
      return false;
    },
  });

  const renderMediaPicker = (
    label: string,
    kind: "desktopImage" | "mobileImage" | "desktopVideo" | "mobileVideo",
    media: MediaState,
    folder: string,
  ) => (
    <Form.Item label={label}>
      <Upload {...uploadProps(kind, folder)} listType="picture-card">
        {media.url ? (
          kind.includes("Video") ? (
            <video src={media.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
          ) : (
            <img src={media.url} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )
        ) : uploading[kind] ? (
          <LoadingOutlined />
        ) : (
          <div>
            <PlusOutlined />
            <div className="mt-1">Upload</div>
          </div>
        )}
      </Upload>
    </Form.Item>
  );

  const handleFinish = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        title: values.title,
        subtitle: values.subtitle,
        badge: values.badge,
        placement: values.placement,
        mediaType: values.mediaType,
        desktopImage: desktopImage.id,
        mobileImage: mobileImage.id,
        desktopVideo: desktopVideo.id,
        mobileVideo: mobileVideo.id,
        ctaText: values.ctaText,
        ctaLink: values.ctaLink,
        secondaryCtaText: values.secondaryCtaText,
        secondaryCtaLink: values.secondaryCtaLink,
        textColor: values.textColor,
        overlayOpacity: values.overlayOpacity,
        campaign: values.campaign,
        startsAt: values.schedule?.[0]?.toISOString() ?? null,
        endsAt: values.schedule?.[1]?.toISOString() ?? null,
        displayOrder: values.displayOrder,
        isActive: values.isActive,
      };

      if (isEdit && editingBanner) {
        const res = await updateBanner(editingBanner._id, payload);
        message.success(res.data.message);
        onSuccess(res.data.data.banner);
      } else {
        const res = await createBanner(payload);
        message.success(res.data.message);
        onSuccess(res.data.data.banner);
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
      className="add-banner-modal-override"
      width="min(1200px, 95vw)"
      destroyOnClose
    >
      <div className="modal-inner-content py-2">
        <h2 className="modal-headline mb-4">{isEdit ? "Edit Banner" : "Add New Banner"}</h2>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          requiredMark={false}
          autoComplete="off"
        >
        <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="row g-3">
            <div className="col-12 col-md-8">
              <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true, message: "Please enter a title" }]}
              >
                <Input placeholder="Banner title" size="large" />
              </Form.Item>
            </div>
            <div className="col-12 col-md-4">
              <Form.Item
                label="Placement"
                name="placement"
                rules={[{ required: true, message: "Please select a placement" }]}
              >
                <Select size="large">
                  <Select.Option value="hero">Hero</Select.Option>
                  <Select.Option value="promotional">Promotional</Select.Option>
                  <Select.Option value="sub_banner">Sub Banner</Select.Option>
                </Select>
              </Form.Item>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <Form.Item label="Subtitle" name="subtitle">
                <Input placeholder="Optional subtitle" size="large" />
              </Form.Item>
            </div>
            <div className="col-12 col-md-3">
              <Form.Item label="Badge" name="badge">
                <Input placeholder="e.g., New" size="large" />
              </Form.Item>
            </div>
            <div className="col-12 col-md-3">
              <Form.Item
                label="Media Type"
                name="mediaType"
                rules={[{ required: true }]}
              >
                <Select size="large" onChange={(v) => setMediaType(v)}>
                  <Select.Option value="image">Image</Select.Option>
                  <Select.Option value="video">Video</Select.Option>
                </Select>
              </Form.Item>
            </div>
          </div>

          <div className="row g-3">
            {mediaType === "image" ? (
              <>
                <div className="col-6 col-md-3">
                  {renderMediaPicker("Desktop Image", "desktopImage", desktopImage, "banners")}
                </div>
                <div className="col-6 col-md-3">
                  {renderMediaPicker("Mobile Image", "mobileImage", mobileImage, "banners")}
                </div>
              </>
            ) : (
              <>
                <div className="col-6 col-md-3">
                  {renderMediaPicker("Desktop Video", "desktopVideo", desktopVideo, "banners")}
                </div>
                <div className="col-6 col-md-3">
                  {renderMediaPicker("Mobile Video", "mobileVideo", mobileVideo, "banners")}
                </div>
              </>
            )}
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-3">
              <Form.Item label="CTA Text" name="ctaText">
                <Input placeholder="Shop Now" size="large" />
              </Form.Item>
            </div>
            <div className="col-12 col-md-3">
              <Form.Item label="CTA Link" name="ctaLink">
                <Input placeholder="/category/sarees" size="large" />
              </Form.Item>
            </div>
            <div className="col-12 col-md-3">
              <Form.Item label="Secondary CTA Text" name="secondaryCtaText">
                <Input placeholder="Optional" size="large" />
              </Form.Item>
            </div>
            <div className="col-12 col-md-3">
              <Form.Item label="Secondary CTA Link" name="secondaryCtaLink">
                <Input placeholder="Optional" size="large" />
              </Form.Item>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-3">
              <Form.Item label="Text Color" name="textColor">
                <Input type="color" size="large" style={{ height: 40, padding: 4 }} />
              </Form.Item>
            </div>
            <div className="col-12 col-md-3">
              <Form.Item label="Overlay Opacity" name="overlayOpacity">
                <Slider min={0} max={0.85} step={0.05} />
              </Form.Item>
            </div>
            <div className="col-12 col-md-3">
              <Form.Item label="Campaign" name="campaign">
                <Input placeholder="Optional campaign tag" size="large" />
              </Form.Item>
            </div>
            <div className="col-12 col-md-3">
              <Form.Item label="Display Order" name="displayOrder">
                <InputNumber className="w-100" size="large" min={0} />
              </Form.Item>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-8">
              <Form.Item label="Schedule (optional)" name="schedule">
                <DatePicker.RangePicker
                  className="w-100"
                  size="large"
                  showTime
                  format="MMM DD, YYYY HH:mm"
                />
              </Form.Item>
            </div>
            <div className="col-12 col-md-4">
              <Form.Item label="Active" name="isActive" valuePropName="checked">
                <Switch />
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
              {isEdit ? "Save Changes" : "Create Banner"}
            </Button>
          </Form.Item>
        </div>

        <div className="col-12 col-lg-5">
          <BannerLivePreview
            placement={watchedPlacement}
            mediaType={watchedMediaType}
            desktopImageUrl={desktopImage.url}
            mobileImageUrl={mobileImage.url}
            desktopVideoUrl={desktopVideo.url}
            mobileVideoUrl={mobileVideo.url}
            title={watchedTitle}
            subtitle={watchedSubtitle}
            badge={watchedBadge}
            textColor={watchedTextColor}
            overlayOpacity={watchedOverlayOpacity}
            ctaText={watchedCtaText}
            secondaryCtaText={watchedSecondaryCtaText}
          />
        </div>
        </div>
        </Form>
      </div>
    </Modal>
  );
};

export default AddBannerModal;
