import React, { useState } from 'react';
import { Button, Card, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';

// Define structure for our template items
interface NotificationTemplate {
  id: string;
  title: string;
  description: string;
}

const initialTemplates: NotificationTemplate[] = [
  {
    id: '1',
    title: 'Order Confirmation',
    description: 'Pre-configured template for order confirmation notifications',
  },
  {
    id: '2',
    title: 'Shipping Update',
    description: 'Pre-configured template for shipping update notifications',
  },
  {
    id: '3',
    title: 'Payment Success',
    description: 'Pre-configured template for payment success notifications',
  },
  {
    id: '4',
    title: 'Flash Sale',
    description: 'Pre-configured template for flash sale notifications',
  },
  {
    id: '5',
    title: 'New Arrival',
    description: 'Pre-configured template for new arrival notifications',
  },
  {
    id: '6',
    title: 'Abandoned Cart',
    description: 'Pre-configured template for abandoned cart notifications',
  },
];

const TemplateGrid: React.FC = () => {
  const [templates] = useState<NotificationTemplate[]>(initialTemplates);

  // Dynamic Event Handlers
  const handleCreateTemplate = () => {
    message.success('Create Template action triggered!');
  };

  const handleUseTemplate = (title: string) => {
    message.info(`Using template: ${title}`);
  };

  const handleEditTemplate = (title: string) => {
    message.info(`Editing template: ${title}`);
  };

  return (
    <div className="container-fliud py-2 template-dashboard">
      {/* Header Row with Top Action Button */}
      <div className="d-flex justify-content-end mb-4">
        <Button 
          type="primary" 
          icon={<SendOutlined />} 
          size="large"
          className="btn-create-template"
          onClick={handleCreateTemplate}
        >
          Create Template
        </Button>
      </div>

      {/* Grid of Dynamic Cards */}
      <div className="row g-4">
        {templates.map((template) => (
          <div key={template.id} className="col-12 col-md-6 col-lg-4">
            <Card className="template-card h-100 border-1" bordered={true}>
              <h3 className="card-title-text mb-2">{template.title}</h3>
              <p className="card-desc-text mb-4">{template.description}</p>
              
              {/* Action Buttons Footer matching layout */}
              <div className="d-flex gap-2">
                <Button 
                  className="btn-use-template flex-grow-1" 
                  onClick={() => handleUseTemplate(template.title)}
                >
                  Use Template
                </Button>
                <Button 
                  className="btn-edit-template" 
                  onClick={() => handleEditTemplate(template.title)}
                >
                  Edit
                </Button>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateGrid;
