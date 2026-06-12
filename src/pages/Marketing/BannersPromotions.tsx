import React, { useState } from 'react';
import { Button, Switch, Modal, message } from 'antd';
import { PictureOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

// TypeScript schema interface defining promotion banners
interface BannerRecord {
  id: string;
  title: string;
  placement: string;
  isActive: boolean;
  gradientStart: string;
  gradientEnd: string;
}

const BannersPromotions: React.FC = () => {
  // Pre-filled dynamic state matching your image cards exactly
  const [banners, setBanners] = useState<BannerRecord[]>([
    { id: '1', title: 'Festival Sale Banner 1', placement: 'Homepage Hero', isActive: true, gradientStart: '#f3e8ff', gradientEnd: '#fce7f3' },
    { id: '2', title: 'Festival Sale Banner 2', placement: 'Homepage Hero', isActive: true, gradientStart: '#f3e8ff', gradientEnd: '#fce7f3' },
    { id: '3', title: 'Festival Sale Banner 3', placement: 'Homepage Hero', isActive: false, gradientStart: '#f3e8ff', gradientEnd: '#fce7f3' },
  ]);

  // Handle addition of a new banner placeholder asset block
  const handleAddBanner = () => {
    const newId = (banners.length + 1).toString();
    const newBanner: BannerRecord = {
      id: newId,
      title: `Festival Sale Banner ${newId}`,
      placement: 'Homepage Hero',
      isActive: false,
      gradientStart: '#f3e8ff',
      gradientEnd: '#fce7f3'
    };
    setBanners(prev => [...prev, newBanner]);
    message.success('New promotion banner block generated.');
  };

  // Switch status change event toggles
  const handleToggleStatus = (id: string, checked: boolean) => {
    setBanners(prev => prev.map(banner => 
      banner.id === id ? { ...banner, isActive: checked } : banner
    ));
    message.info(`Banner status synced to: ${checked ? 'Active' : 'Inactive'}`);
  };

  // Safe item erasure dialog modal routine wrapper
  const handleDeleteBanner = (id: string, title: string) => {
    Modal.confirm({
      title: `Delete ${title}?`,
      icon: <ExclamationCircleOutlined className="text-danger" />,
      content: 'This operation eliminates the banner canvas configuration layout from live views.',
      okText: 'Delete Banner',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        setBanners(prev => prev.filter(b => b.id !== id));
        message.success(`${title} completely removed.`);
      }
    });
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

      {/* Grid Canvas Wrapper Set Layer */}
      <div className="row g-4">
        {banners.map((banner) => (
          <div className="col-12 col-md-6 col-xl-4" key={banner.id}>
            <div className="banner-promotion-card border overflow-hidden bg-white">
              
              {/* Dynamic Gradient Visual Placeholder Surface matching your design */}
              <div 
                className="banner-preview-canvas" 
                style={{ background: `linear-gradient(135deg, ${banner.gradientStart} 0%, ${banner.gradientEnd} 100%)` }}
              />

              {/* Lower Details Metadata Information Panel Block */}
              <div className="banner-card-body p-4">
                
                {/* Information Row Containing Title & Toggle Switch Component */}
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h4 className="banner-main-title text-dark mb-0 fw-bold">{banner.title}</h4>
                  <Switch 
                    checked={banner.isActive} 
                    onChange={(checked) => handleToggleStatus(banner.id, checked)}
                    className="custom-banner-toggle"
                  />
                </div>
                
                <span className="banner-placement-lbl text-muted d-block mb-4">{banner.placement}</span>

                {/* Card Action Controls Row Layout Blocks */}
                <div className="d-flex align-items-center gap-2">
                  <Button 
                    icon={<EditOutlined />} 
                    className="btn-action-edit flex-grow-1 fw-bold d-inline-flex align-items-center justify-content-center"
                    onClick={() => message.info(`Editing details configuration for card ${banner.id}`)}
                  >
                    Edit
                  </Button>
                  <Button 
                    type="text"
                    danger
                    icon={<DeleteOutlined />} 
                    className="btn-action-trash border d-inline-flex align-items-center justify-content-center"
                    onClick={() => handleDeleteBanner(banner.id, banner.title)}
                  />
                </div>

              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default BannersPromotions;
