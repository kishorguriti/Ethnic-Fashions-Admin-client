import React, { useState } from "react";
import { Segmented } from "antd";
import {
  ArrowRightOutlined,
  StarFilled,
  ShoppingOutlined,
  DesktopOutlined,
  MobileOutlined,
} from "@ant-design/icons";
import type { BannerPlacement, BannerMediaType } from "../../services/bannerApi";

interface BannerLivePreviewProps {
  placement: BannerPlacement;
  mediaType: BannerMediaType;
  desktopImageUrl?: string | null;
  mobileImageUrl?: string | null;
  desktopVideoUrl?: string | null;
  mobileVideoUrl?: string | null;
  title?: string;
  subtitle?: string;
  badge?: string;
  textColor?: string;
  overlayOpacity?: number;
  ctaText?: string;
  secondaryCtaText?: string;
}

const placementLabels: Record<BannerPlacement, string> = {
  hero: "Homepage Hero",
  promotional: "Promotional Section",
  sub_banner: "Sub Banner",
};

const BannerLivePreview: React.FC<BannerLivePreviewProps> = ({
  placement,
  mediaType,
  desktopImageUrl,
  mobileImageUrl,
  desktopVideoUrl,
  mobileVideoUrl,
  title,
  subtitle,
  badge,
  textColor,
  overlayOpacity = 0,
  ctaText,
  secondaryCtaText,
}) => {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const isVideo = mediaType === "video";
  const imageUrl = device === "desktop" ? desktopImageUrl : mobileImageUrl || desktopImageUrl;
  const videoUrl = device === "desktop" ? desktopVideoUrl : mobileVideoUrl || desktopVideoUrl;
  const hasMedia = isVideo ? !!videoUrl : !!imageUrl;
  const color = textColor || "#ffffff";

  const frameStyle: React.CSSProperties = {
    backgroundImage: !isVideo && imageUrl ? `url(${imageUrl})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <div className="banner-live-preview">
      <div className="preview-toolbar d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="preview-heading mb-0">Live Preview</h4>
          <span className="preview-sub-label text-muted">
            {placementLabels[placement]}
          </span>
        </div>
        <Segmented
          value={device}
          onChange={(val) => setDevice(val as "desktop" | "mobile")}
          options={[
            { label: <DesktopOutlined />, value: "desktop" },
            { label: <MobileOutlined />, value: "mobile" },
          ]}
        />
      </div>

      <div className={`preview-viewport preview-${device}`}>
        <div
          className={`preview-frame preview-${placement}`}
          style={placement !== "sub_banner" ? frameStyle : undefined}
        >
          {placement === "sub_banner" && (
            <div className="preview-frame-bg" style={frameStyle} />
          )}

          {isVideo && videoUrl && (
            <video
              key={videoUrl}
              src={videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="preview-video"
            />
          )}

          {overlayOpacity > 0 && (
            <div
              className="preview-overlay"
              style={{ background: `rgba(0,0,0,${overlayOpacity})` }}
            />
          )}

          {placement === "hero" && (
            <div className="preview-content preview-content-hero" style={{ color }}>
              {badge && (
                <span className="preview-badge" style={{ color, borderColor: color }}>
                  {badge}
                </span>
              )}
              <h1 className="preview-title" style={{ color }}>
                {title || "Your banner title"}
              </h1>
              {subtitle && (
                <p className="preview-subtitle" style={{ color }}>
                  {subtitle}
                </p>
              )}
              <div className="preview-cta-row">
                {ctaText && (
                  <span className="preview-btn preview-btn-primary">
                    {ctaText} <ArrowRightOutlined />
                  </span>
                )}
                {secondaryCtaText && (
                  <span className="preview-btn preview-btn-ghost" style={{ borderColor: color, color }}>
                    {secondaryCtaText}
                  </span>
                )}
              </div>
            </div>
          )}

          {placement === "promotional" && (
            <div
              className="preview-content preview-content-promo"
              style={{ color, background: hasMedia ? "transparent" : undefined }}
            >
              <div className="preview-icon-wrapper">
                <ShoppingOutlined />
              </div>
              {badge && (
                <div className="preview-badge-offer">
                  <StarFilled className="preview-sparkle" />
                  <span>{badge}</span>
                </div>
              )}
              <h1 className="preview-title-serif" style={{ color }}>
                {title || "Your banner title"}
              </h1>
              {subtitle && (
                <p className="preview-description" style={{ color }}>
                  {subtitle}
                </p>
              )}
              {ctaText && (
                <span className="preview-btn preview-btn-white">
                  {ctaText} <ArrowRightOutlined />
                </span>
              )}
            </div>
          )}

          {placement === "sub_banner" && (
            <div className="preview-content preview-content-sub" style={{ color }}>
              {badge && (
                <span className="preview-badge" style={{ color, borderColor: color }}>
                  {badge}
                </span>
              )}
              <h2 className="preview-title-sub" style={{ color }}>
                {title || "Your banner title"}
              </h2>
              {subtitle && (
                <p className="preview-subtitle" style={{ color }}>
                  {subtitle}
                </p>
              )}
              {ctaText && (
                <span className="preview-btn preview-btn-primary">
                  {ctaText} <ArrowRightOutlined />
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BannerLivePreview;
