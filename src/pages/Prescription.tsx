import React, { useState } from 'react';

// Renamed interface to avoid type collision with component name
export interface PrescriptionType {
  id: string;
  doctorName: string;
  patientName: string;
  date: string;
  medication: string;
  dosage: string;
  frequency: string;
  status: 'Active' | 'Completed' | 'Refill Required';
}

const mockPrescriptions: PrescriptionType[] = [
  {
    id: 'rx-101',
    doctorName: 'Dr. Sarah Jenkins',
    patientName: 'Alex Johnson',
    date: '2026-09-15',
    medication: 'Amoxicillin',
    dosage: '500mg',
    frequency: 'Twice daily for 7 days',
    status: 'Active',
  },
  {
    id: 'rx-102',
    doctorName: 'Dr. Michael Chen',
    patientName: 'Alex Johnson',
    date: '2026-08-20',
    medication: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily in the morning',
    status: 'Refill Required',
  },
  {
    id: 'rx-103',
    doctorName: 'Dr. Emily Watson',
    patientName: 'Alex Johnson',
    date: '2026-07-10',
    medication: 'Ibuprofen',
    dosage: '400mg',
    frequency: 'As needed for pain',
    status: 'Completed',
  },
];

export const Prescription: React.FC = () => {
  const [prescriptions] = useState<PrescriptionType[]>(mockPrescriptions);

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', color: '#1e293b', marginBottom: '8px' }}>Prescriptions</h1>
        <p style={{ color: '#64748b' }}>View and manage your active and past medical prescriptions.</p>
      </header>

      <div style={{ display: 'grid', gap: '16px' }}>
        {prescriptions.map((rx) => (
          <div
            key={rx.id}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor:
                    rx.status === 'Active'
                      ? '#dcfce7'
                      : rx.status === 'Refill Required'
                      ? '#fef3c7'
                      : '#f1f5f9',
                  color:
                    rx.status === 'Active'
                      ? '#166534'
                      : rx.status === 'Refill Required'
                      ? '#92400e'
                      : '#475569',
                }}
              >
                {rx.status}
              </span>
              <h3 style={{ fontSize: '18px', color: '#0f172a', margin: '8px 0 4px 0' }}>
                {rx.medication} - {rx.dosage}
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 8px 0' }}>
                Instruction: {rx.frequency}
              </p>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                Prescribed by {rx.doctorName} on {rx.date}
              </span>
            </div>

            <button
              style={{
                padding: '8px 16px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
              onClick={() => alert(`Downloading prescription details for ${rx.medication}...`)}
            >
              Download PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Prescription;