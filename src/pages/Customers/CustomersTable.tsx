import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Tag, Dropdown, Modal, Tooltip, type MenuProps, message } from 'antd';
import { SearchOutlined, FilterOutlined, EyeOutlined, MoreOutlined, ExclamationCircleOutlined, CheckCircleFilled } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getAdminCustomers, setCustomerSuspension, type AdminCustomer } from '../../services/customerApi';
import CustomerDetailModal from './CustomerDetailModal';

const PAGE_SIZE = 6;

const CustomersDirectoryTable: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [verificationFilter, setVerificationFilter] = useState<string>('All');
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await getAdminCustomers({ search: searchQuery, page, limit: PAGE_SIZE });
      setCustomers(res.data.data.customers);
      setTotal(res.data.data.total);
    } catch {
      message.error('Failed to load customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, page]);

  const openCustomer = (id: string, mode: 'view' | 'edit') => {
    setActiveCustomerId(id);
    setModalMode(mode);
    setModalOpen(true);
  };

  const handleToggleSuspension = (record: AdminCustomer) => {
    const suspending = !record.isSuspended;
    Modal.confirm({
      title: suspending ? 'Suspend customer account?' : 'Reinstate customer account?',
      icon: <ExclamationCircleOutlined />,
      content: suspending
        ? `${record.name || record.phone} will no longer be able to sign in or place orders until reinstated.`
        : `${record.name || record.phone} will regain access to their account.`,
      okText: suspending ? 'Suspend' : 'Reinstate',
      okButtonProps: { danger: suspending },
      onOk: async () => {
        try {
          const res = await setCustomerSuspension(record._id, suspending);
          message.success(res.data.message);
          fetchCustomers();
        } catch (err: any) {
          message.error(err?.response?.data?.message || 'Failed to update account status');
        }
      }
    });
  };

  // Ant Design Row Context Action Menu setup
  const getActionMenu = (record: AdminCustomer): MenuProps => ({
    items: [
      { key: 'email', label: 'Send Direct Email' },
      { key: 'edit', label: 'Edit Account' },
      { type: 'divider' },
      record.isSuspended
        ? { key: 'reinstate', label: 'Reinstate Account' }
        : { key: 'suspend', label: 'Flag / Suspend Account', danger: true },
    ],
    onClick: ({ key }) => {
      if (key === 'edit') {
        openCustomer(record._id, 'edit');
        return;
      }
      if (key === 'suspend' || key === 'reinstate') {
        handleToggleSuspension(record);
        return;
      }
      message.info(`Action '${key}' triggered for ${record.name || record.phone}`);
    }
  });

  const getInitials = (name: string, phone: string) => {
    const trimmed = name?.trim();
    if (!trimmed) return phone?.slice(-2) || '??';
    const parts = trimmed.split(' ').filter(Boolean);
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : trimmed.slice(0, 2).toUpperCase();
  };

  // Ant Design Table Columns Configuration Matrix
  const columns: ColumnsType<AdminCustomer> = [
    {
      title: 'CUSTOMER',
      key: 'customer',
      render: (_, record) => (
        <div className="customer-meta-profile d-flex align-items-center gap-3">
          <div
            className="avatar-initials-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
            style={{ backgroundColor: '#bc00dd' }}
          >
            {getInitials(record.name, record.phone)}
          </div>
          <div className="name-details-stack">
            <h5 className="cust-fullname-lbl mb-0 d-flex align-items-center gap-1">
              {record.name || 'Unnamed Customer'}
              {record.isPhoneVerified && (
                <Tooltip title="Phone verified">
                  <CheckCircleFilled className="verified-tick-icon" />
                </Tooltip>
              )}
            </h5>
            <small className="cust-email-lbl text-muted d-block">{record.email || '—'}</small>
          </div>
        </div>
      )
    },
    {
      title: 'CONTACT',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => <span className="contact-number-txt text-dark">{phone}</span>
    },
    {
      title: 'REGISTERED ON',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <span className="last-order-date text-muted">
          {new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      )
    },
    {
      title: 'ADDRESSES',
      dataIndex: 'addressCount',
      key: 'addressCount',
      align: 'center',
      render: (count) => <span className="numeric-orders-lbl fw-bold">{count}</span>
    },
    {
      title: 'STATUS',
      dataIndex: 'isSuspended',
      key: 'isSuspended',
      render: (suspended: boolean) => (
        <Tag className={`segment-pill ${suspended ? 'tag-suspended-red' : 'tag-active-green'}`}>
          {suspended ? 'Suspended' : 'Active'}
        </Tag>
      )
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <div className="row-actions-strip d-inline-flex align-items-center gap-2">
          <Button
            icon={<EyeOutlined />}
            className="btn-action-view d-inline-flex align-items-center justify-content-center"
            onClick={() => openCustomer(record._id, 'view')}
          >
            View
          </Button>
          <Dropdown menu={getActionMenu(record)} trigger={['click']} placement="bottomRight">
            <Button icon={<MoreOutlined />} className="btn-more-dropdown-dots" type="text" />
          </Dropdown>
        </div>
      )
    }
  ];

  // Verification filter configuration
  const verificationMenuProps = {
    items: [
      { key: 'All', label: 'All Customers' },
      { key: 'Verified', label: 'Verified' },
      { key: 'Unverified', label: 'Unverified' },
    ],
    onClick: ({ key }: { key: string }) => {
      setVerificationFilter(key);
      setPage(1);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    if (verificationFilter === 'Verified') return c.isPhoneVerified;
    if (verificationFilter === 'Unverified') return !c.isPhoneVerified;
    return true;
  });

  const showingFrom = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="customers-directory-module p-1 mt-3">

      {/* 1. Control Filter Options Upper Toolbar Strip Component */}
      <div className="toolbar-filter-strip p-3 mb-4 d-flex flex-column flex-md-row justify-content-between gap-3 align-items-stretch align-items-md-center bg-white rounded-3 shadow-sm border">
        <Input
          placeholder="Search by name, email or phone..."
          prefix={<SearchOutlined className="search-icon-dimmed" />}
          className="search-input-field flex-grow-1"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
        />
        <div className="d-flex align-items-center gap-2 flex-wrap flex-sm-nowrap">
          <Dropdown menu={verificationMenuProps} trigger={['click']}>
            <Button icon={<FilterOutlined />} className="toolbar-action-btn">
              Verification {verificationFilter !== 'All' && `: ${verificationFilter}`}
            </Button>
          </Dropdown>
        </div>
      </div>

      {/* 2. Main Data Grid View Frame Card Area Container Layout */}
      <div className="table-surface-card bg-white border rounded-3 shadow-sm overflow-hidden pb-2">
        <Table
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="_id"
          loading={loading}
          scroll={{ x: "max-content" }}
          pagination={{
            position: ['bottomRight'],
            current: page,
            pageSize: PAGE_SIZE,
            total,
            showSizeChanger: false,
            onChange: (p) => setPage(p),
            itemRender: (_, type, originalElement) => {
              if (type === 'prev') return <Button size="small" className="pagination-edge-btn">Previous</Button>;
              if (type === 'next') return <Button size="small" className="pagination-edge-btn">Next</Button>;
              return originalElement;
            }
          }}
          className="custom-customers-data-table"
          footer={() => (
            <span className="footer-counter-lbl text-muted">
              Showing {showingFrom} to {showingTo} of {total} customers
            </span>
          )}
        />
      </div>

      <CustomerDetailModal
        open={modalOpen}
        customerId={activeCustomerId}
        initialMode={modalMode}
        onClose={() => setModalOpen(false)}
        onUpdated={fetchCustomers}
      />

    </div>
  );
};

export default CustomersDirectoryTable;
