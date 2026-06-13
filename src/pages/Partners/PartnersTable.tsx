import React, { useEffect, useState } from "react";
import { Table, Input, Button, Tag, message } from "antd";
import { SearchOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { getPartners, type Partner } from "../../services/partnerApi";
import OnboardPartnerForm from "./OnboardPartnerForm";
import PartnerDetailModal from "./PartnerDetailModal";

const PAGE_SIZE = 10;

const PartnersTable: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [onboardOpen, setOnboardOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await getPartners({ search: searchQuery, page, limit: PAGE_SIZE });
      setPartners(res.data.data.partners);
      setTotal(res.data.data.total);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to load partners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, page]);

  const openPartner = (id: string, mode: "view" | "edit") => {
    setActivePartnerId(id);
    setModalMode(mode);
    setModalOpen(true);
  };

  const columns: ColumnsType<Partner> = [
    {
      title: "BUSINESS",
      key: "business",
      render: (_, record) => (
        <div className="name-details-stack">
          <h5 className="cust-fullname-lbl mb-0">{record.partnerProfile.businessName}</h5>
          <small className="text-muted d-block">GST: {record.partnerProfile.gstNumber}</small>
        </div>
      ),
    },
    {
      title: "CONTACT",
      key: "contact",
      render: (_, record) => (
        <div>
          <div>{record.name}</div>
          <small className="text-muted">{record.email}</small>
          <div className="text-muted small">{record.phone}</div>
        </div>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>{isActive ? "ACTIVE" : "INACTIVE"}</Tag>
      ),
    },
    {
      title: "ONBOARDED",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }),
    },
    {
      title: "ACTIONS",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Button icon={<EyeOutlined />} onClick={() => openPartner(record._id, "view")}>
          View
        </Button>
      ),
    },
  ];

  const showingFrom = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="partners-module p-4">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div>
          <h1 className="inventory-view-title mb-1">Partners</h1>
          <p className="inventory-view-desc text-muted mb-0">Onboard and manage partner accounts</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOnboardOpen(true)}>
          Onboard Partner
        </Button>
      </div>

      <div className="filter-controls-strip p-3 mb-4 d-flex flex-column flex-md-row justify-content-between gap-3 align-items-stretch align-items-md-center">
        <Input
          placeholder="Search by name, email, or business name..."
          prefix={<SearchOutlined className="search-icon-muted" />}
          className="search-input-field flex-grow-1"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="table-card-wrapper bg-white">
        <Table
          columns={columns}
          dataSource={partners}
          rowKey="_id"
          loading={loading}
          pagination={{
            position: ["bottomRight"],
            current: page,
            pageSize: PAGE_SIZE,
            total,
            showSizeChanger: false,
            onChange: (p) => setPage(p),
          }}
          className="custom-inventory-table"
          footer={() => (
            <span className="footer-counter-lbl text-muted">
              Showing {showingFrom} to {showingTo} of {total} partners
            </span>
          )}
        />
      </div>

      <OnboardPartnerForm
        open={onboardOpen}
        onClose={() => setOnboardOpen(false)}
        onCreated={fetchPartners}
      />

      <PartnerDetailModal
        open={modalOpen}
        partnerId={activePartnerId}
        initialMode={modalMode}
        onClose={() => setModalOpen(false)}
        onUpdated={fetchPartners}
      />
    </div>
  );
};

export default PartnersTable;
