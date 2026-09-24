import React, { useState } from 'react';

// Renamed interface to avoid naming collision with the component
export interface HospitalServiceType {
  id: string;
  name: string;
  department: string;
  description: string;
  availableHours: string;
  contact: string;
}

// Sample mock data for Hospital Services
const mockServices: HospitalServiceType[] = [
  {
    id: '1',
    name: 'Emergency & Trauma Care',
    department: 'Critical Care',
    description: '24/7 immediate emergency medical treatment and trauma care unit.',
    availableHours: '24/7 Available',
    contact: '+1 (555) 019-2834',
  },
  {
    id: '2',
    name: 'Outpatient Consultation (OPD)',
    department: 'General Medicine',
    description: 'General doctor consultations, diagnosis, and prescription services.',
    availableHours: 'Mon - Sat (8:00 AM - 6:00 PM)',
    contact: '+1 (555) 019-5821',
  },
  {
    id: '3',
    name: 'Radiology & Imaging',
    department: 'Diagnostics',
    description: 'Advanced MRI, CT scans, Ultrasound, and X-ray imaging facilities.',
    availableHours: 'Mon - Sun (7:00 AM - 10:00 PM)',
    contact: '+1 (555) 019-9942',
  },
  {
    id: '4',
    name: 'Pathology & Lab Diagnostics',
    department: 'Laboratory',
    description: 'Blood tests, pathology examinations, and automated lab diagnostics.',
    availableHours: '24/7 Sample Collection',
    contact: '+1 (555) 019-3311',
  },
];

export const HospitalService: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = mockServices.filter(
    (service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', color: '#1e293b', marginBottom: '8px' }}>Hospital Services</h1>
        <p style={{ color: '#64748b' }}>Explore available departments, diagnostic services, and healthcare facilities.</p>
      </header>

      {/* Search Input */}
      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Search by service or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '14px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Services Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {filteredServices.map((service) => (
          <div
            key={service.id}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#2563eb',
                backgroundColor: '#eff6ff',
                padding: '4px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
              }}
            >
              {service.department}
            </span>
            <h3 style={{ fontSize: '18px', color: '#0f172a', margin: '12px 0 8px 0' }}>{service.name}</h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5', marginBottom: '16px' }}>
              {service.description}
            </p>
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', fontSize: '13px', color: '#64748b' }}>
              <div>⏱ <strong>Hours:</strong> {service.availableHours}</div>
              <div style={{ marginTop: '4px' }}>📞 <strong>Contact:</strong> {service.contact}</div>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          No hospital services found matching "{searchQuery}".
        </div>
      )}
    </div>
  );
};

export default HospitalService;