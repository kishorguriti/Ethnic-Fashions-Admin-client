import React, { useState } from 'react';
import { Table, Input, Button, Tag, Dropdown, type MenuProps, message } from 'antd';
import { SearchOutlined, FilterOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

// TypeScript schema interface defining customer database records
interface CustomerRecord {
  key: string;
  name: string;
  email: string;
  initials: string;
  avatarBg: string; // Hex color code specifically matching row profile colors
  contact: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  segment: 'VIP' | 'Regular' | 'New';
}

const CustomersDirectoryTable: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentSegmentFilter, setCurrentSegmentFilter] = useState<string>('All');

  // Dynamic state list pre-filled with explicit column values found in your image
  const [customers, setCustomers] = useState<CustomerRecord[]>([
    { key: '1', name: 'Priya Sharma', email: 'priya@example.com', initials: 'PS', avatarBg: '#bc00dd', contact: '+91 98765 43210', totalOrders: 12, totalSpent: 45680, lastOrder: 'Mar 5, 2026', segment: 'VIP' },
    { key: '2', name: 'Ananya Reddy', email: 'ananya@example.com', initials: 'AR', avatarBg: '#bc00dd', contact: '+91 98765 43211', totalOrders: 8, totalSpent: 32400, lastOrder: 'Mar 5, 2026', segment: 'Regular' },
    { key: '3', name: 'Meera Patel', email: 'meera@example.com', initials: 'MP', avatarBg: '#bc00dd', contact: '+91 98765 43212', totalOrders: 5, totalSpent: 18900, lastOrder: 'Mar 4, 2026', segment: 'Regular' },
    { key: '4', name: 'Kavita Singh', email: 'kavita@example.com', initials: 'KS', avatarBg: '#bc00dd', contact: '+91 98765 43213', totalOrders: 15, totalSpent: 67200, lastOrder: 'Mar 4, 2026', segment: 'VIP' },
    { key: '5', name: 'Deepa Kumar', email: 'deepa@example.com', initials: 'DK', avatarBg: '#bc00dd', contact: '+91 98765 43214', totalOrders: 3, totalSpent: 12500, lastOrder: 'Mar 3, 2026', segment: 'New' },
    { key: '6', name: 'Riya Kapoor', email: 'riya@example.com', initials: 'RK', avatarBg: '#bc00dd', contact: '+91 98765 43215', totalOrders: 1, totalSpent: 3200, lastOrder: 'Mar 3, 2026', segment: 'New' },
        { key: '7', name: 'Priya Sharma', email: 'priya@example.com', initials: 'PS', avatarBg: '#bc00dd', contact: '+91 98765 43210', totalOrders: 12, totalSpent: 45680, lastOrder: 'Mar 5, 2026', segment: 'VIP' },
    { key: '8', name: 'Ananya Reddy', email: 'ananya@example.com', initials: 'AR', avatarBg: '#bc00dd', contact: '+91 98765 43211', totalOrders: 8, totalSpent: 32400, lastOrder: 'Mar 5, 2026', segment: 'Regular' },
    { key: '9', name: 'Meera Patel', email: 'meera@example.com', initials: 'MP', avatarBg: '#bc00dd', contact: '+91 98765 43212', totalOrders: 5, totalSpent: 18900, lastOrder: 'Mar 4, 2026', segment: 'Regular' },
    { key: '10', name: 'Kavita Singh', email: 'kavita@example.com', initials: 'KS', avatarBg: '#bc00dd', contact: '+91 98765 43213', totalOrders: 15, totalSpent: 67200, lastOrder: 'Mar 4, 2026', segment: 'VIP' },
    { key: '11', name: 'Deepa Kumar', email: 'deepa@example.com', initials: 'DK', avatarBg: '#bc00dd', contact: '+91 98765 43214', totalOrders: 3, totalSpent: 12500, lastOrder: 'Mar 3, 2026', segment: 'New' },
    { key: '12', name: 'Riya Kapoor', email: 'riya@example.com', initials: 'RK', avatarBg: '#bc00dd', contact: '+91 98765 43215', totalOrders: 1, totalSpent: 3200, lastOrder: 'Mar 3, 2026', segment: 'New' },
        { key: '13', name: 'Priya Sharma', email: 'priya@example.com', initials: 'PS', avatarBg: '#bc00dd', contact: '+91 98765 43210', totalOrders: 12, totalSpent: 45680, lastOrder: 'Mar 5, 2026', segment: 'VIP' },
    { key: '14', name: 'Ananya Reddy', email: 'ananya@example.com', initials: 'AR', avatarBg: '#bc00dd', contact: '+91 98765 43211', totalOrders: 8, totalSpent: 32400, lastOrder: 'Mar 5, 2026', segment: 'Regular' },
    { key: '15', name: 'Meera Patel', email: 'meera@example.com', initials: 'MP', avatarBg: '#bc00dd', contact: '+91 98765 43212', totalOrders: 5, totalSpent: 18900, lastOrder: 'Mar 4, 2026', segment: 'Regular' },
    { key: '16', name: 'Kavita Singh', email: 'kavita@example.com', initials: 'KS', avatarBg: '#bc00dd', contact: '+91 98765 43213', totalOrders: 15, totalSpent: 67200, lastOrder: 'Mar 4, 2026', segment: 'VIP' },
    { key: '17', name: 'Deepa Kumar', email: 'deepa@example.com', initials: 'DK', avatarBg: '#bc00dd', contact: '+91 98765 43214', totalOrders: 3, totalSpent: 12500, lastOrder: 'Mar 3, 2026', segment: 'New' },
    { key: '18', name: 'Riya Kapoor', email: 'riya@example.com', initials: 'RK', avatarBg: '#bc00dd', contact: '+91 98765 43215', totalOrders: 1, totalSpent: 3200, lastOrder: 'Mar 3, 2026', segment: 'New' }
  ]);

  // Ant Design Row Context Action Menu setup
  const getActionMenu = (customerName: string): MenuProps => ({
    items: [
      { key: 'email', label: 'Send Direct Email' },
      { key: 'edit', label: 'Edit Account' },
      { type: 'divider' },
      { key: 'delete', label: 'Flag / Suspend Account', danger: true },
    ],
    onClick: ({ key }) => {
      message.info(`Action '${key}' triggered for ${customerName}`);
    }
  });

  // Ant Design Table Columns Configuration Matrix
  const columns: ColumnsType<CustomerRecord> = [
    {
      title: 'CUSTOMER',
      key: 'customer',
      render: (_, record) => (
        <div className="customer-meta-profile d-flex align-items-center gap-3">
          <div 
            className="avatar-initials-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
            style={{ backgroundColor: record.avatarBg }}
          >
            {record.initials}
          </div>
          <div className="name-details-stack">
            <h5 className="cust-fullname-lbl mb-0">{record.name}-{record?.key}</h5>
            <small className="cust-email-lbl text-muted d-block">{record.email}</small>
          </div>
        </div>
      )
    },
    {
      title: 'CONTACT',
      dataIndex: 'contact',
      key: 'contact',
      render: (phone) => <span className="contact-number-txt text-dark">{phone}</span>
    },
    {
      title: 'TOTAL ORDERS',
      dataIndex: 'totalOrders',
      key: 'totalOrders',
      align: 'center',
      render: (orders) => <span className="numeric-orders-lbl fw-bold">{orders}</span>
    },
    {
      title: 'TOTAL SPENT',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      render: (spent) => <strong className="currency-spent-lbl">₹{spent.toLocaleString('en-IN')}</strong>
    },
    {
      title: 'LAST ORDER',
      dataIndex: 'lastOrder',
      key: 'lastOrder',
      render: (date) => <span className="last-order-date text-muted">{date}</span>
    },
    {
      title: 'SEGMENT',
      dataIndex: 'segment',
      key: 'segment',
      render: (segment: CustomerRecord['segment']) => {
        const styleMap = {
          VIP: 'tag-vip-purple',
          Regular: 'tag-regular-slate',
          New: 'tag-new-outline-blue'
        };
        return <Tag className={`segment-pill ${styleMap[segment]}`}>{segment}</Tag>;
      }
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
            onClick={() => message.info(`Navigating to profile directory: ${record.name}`)}
          >
            View
          </Button>
          <Dropdown menu={getActionMenu(record.name)} trigger={['click']} placement="bottomRight">
            <Button icon={<MoreOutlined />} className="btn-more-dropdown-dots" type="text" />
          </Dropdown>
        </div>
      )
    }
  ];

  // Segment Selection Segment Filtering configuration rules
  const segmentMenuProps = {
    items: [
      { key: 'All', label: 'All Segments' },
      { key: 'VIP', label: 'VIP Spenders' },
      { key: 'Regular', label: 'Regular Buyers' },
      { key: 'New', label: 'New Registrations' },
    ],
    onClick: ({ key }: { key: string }) => {
      setCurrentSegmentFilter(key);
      message.info(`Filtered checklist target: ${key}`);
    }
  };

  // Data processing filtering execution logic
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.contact.includes(searchQuery);
    const matchesSegment = currentSegmentFilter === 'All' || c.segment === currentSegmentFilter;
    return matchesSearch && matchesSegment;
  });

  return (
    <div className="customers-directory-module p-1 mt-3">
      
      {/* 1. Control Filter Options Upper Toolbar Strip Component */}
      <div className="toolbar-filter-strip p-3 mb-4 d-flex flex-column flex-md-row justify-content-between gap-3 align-items-stretch align-items-md-center bg-white rounded-3 shadow-sm border">
        <Input
          placeholder="Search by name, email or phone..."
          prefix={<SearchOutlined className="search-icon-dimmed" />}
          className="search-input-field flex-grow-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="d-flex align-items-center gap-2 flex-wrap flex-sm-nowrap">
          <Dropdown menu={segmentMenuProps} trigger={['click']}>
            <Button icon={<FilterOutlined />} className="toolbar-action-btn">
              Segment {currentSegmentFilter !== 'All' && `: ${currentSegmentFilter}`}
            </Button>
          </Dropdown>
          <Button icon={<FilterOutlined />} className="toolbar-action-btn">
            More Filters
          </Button>
        </div>
      </div>

      {/* 2. Main Data Grid View Frame Card Area Container Layout */}
      <div className="table-surface-card bg-white border rounded-3 shadow-sm overflow-hidden pb-2">
        <Table
          columns={columns}
          dataSource={filteredCustomers}
          pagination={{
            position: ['bottomRight'],
            defaultPageSize: 6,
            showSizeChanger: false,
            itemRender: (_, type, originalElement) => {
              if (type === 'prev') return <Button size="small" className="pagination-edge-btn">Previous</Button>;
              if (type === 'next') return <Button size="small" className="pagination-edge-btn">Next</Button>;
              return originalElement;
            }
          }}
          className="custom-customers-data-table"
          footer={() => (
            <span className="footer-counter-lbl text-muted">
              Showing 1 to {filteredCustomers.length} of 3,842 customers
            </span>
          )}
        />
      </div>

    </div>
  );
};

export default CustomersDirectoryTable;
