import React, { useEffect, useState } from 'react';
import { Button, Switch, Modal, Spin, Alert, Empty, message, Tag } from 'antd';
import { PictureOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import {
  getAdminBanners,
  toggleBannerStatus,
  deleteBanner,
  type Banner,
} from '../../services/bannerApi';
import AddBannerModal from './AddBannerModal';

const placementLabels: Record<string, string> = {
  hero: 'Homepage Hero',
  promotional: 'Promotional',
  sub_banner: 'Sub Banner',
};

const BannersPromotions: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminBanners({ limit: 100 });
      setBanners(res.data.data.banners);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load banners. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleAddBanner = () => {
    setEditingBanner(null);
    setModalOpen(true);
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setModalOpen(true);
  };

  const handleModalSuccess = (banner: Banner) => {
    setBanners((prev) => {
      const exists = prev.some((b) => b._id === banner._id);
      return exists ? prev.map((b) => (b._id === banner._id ? banner : b)) : [banner, ...prev];
    });
  };

  const handleToggleStatus = async (banner: Banner) => {
    try {
      const res = await toggleBannerStatus(banner._id);
      message.success(res.data.message);
      setBanners((prev) => prev.map((b) => (b._id === banner._id ? res.data.data.banner : b)));
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to update banner status');
    }
  };

  const handleDeleteBanner = (banner: Banner) => {
    Modal.confirm({
      title: `Delete ${banner.title}?`,
      icon: <ExclamationCircleOutlined className="text-danger" />,
      content: 'This operation removes the banner from live views.',
      okText: 'Delete Banner',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        try {
          await deleteBanner(banner._id);
          message.success(`${banner.title} removed.`);
          setBanners((prev) => prev.filter((b) => b._id !== banner._id));
        } catch (err: any) {
          message.error(err?.response?.data?.message || 'Failed to delete banner');
        }
      },
    });
  };

  const previewStyle = (banner: Banner): React.CSSProperties => {
    const imageUrl = banner.desktopImage?.url || banner.mobileImage?.url;
    if (imageUrl) {
      return {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return { background: 'linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%)' };
  };

  return (
    <div className="banners-promotions-dashboard p-2">

      {/* Upper Core Control Action Trigger Header Bar */}
      <div className="d-flex justify-content-end mb-4">
        <Button
          type="primary"
          icon={<PictureOutlined />}
          onClick={handleAddBanner}
          className="add-banner-brand-btn px-4 py-2 d-inline-flex align-items-center justify-content-center fw-bold"
          size="large"
        >
          Add Banner
        </Button>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center p-5">
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert type="error" message={error} showIcon className="mb-3" />
      ) : banners.length === 0 ? (
        <Empty description="No banners created yet" className="p-5" />
      ) : (
        <div className="row g-4">
          {banners.map((banner) => (
            <div className="col-12 col-md-6 col-xl-4" key={banner._id}>
              <div className="banner-promotion-card border overflow-hidden bg-white">

                <div className="banner-preview-canvas" style={previewStyle(banner)} />

                <div className="banner-card-body p-4">

                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h4 className="banner-main-title text-dark mb-0 fw-bold">{banner.title}</h4>
                    <Switch
                      checked={banner.isActive}
                      onChange={() => handleToggleStatus(banner)}
                      className="custom-banner-toggle"
                    />
                  </div>

                  <div className="mb-4 d-flex align-items-center gap-2">
                    <span className="banner-placement-lbl text-muted">
                      {placementLabels[banner.placement] || banner.placement}
                    </span>
                    {banner.campaign && <Tag>{banner.campaign}</Tag>}
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <Button
                      icon={<EditOutlined />}
                      className="btn-action-edit flex-grow-1 fw-bold d-inline-flex align-items-center justify-content-center"
                      onClick={() => handleEditBanner(banner)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      className="btn-action-trash border d-inline-flex align-items-center justify-content-center"
                      onClick={() => handleDeleteBanner(banner)}
                    />
                  </div>

                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      <AddBannerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
        editingBanner={editingBanner}
      />

    </div>
  );
};

export default BannersPromotions;
