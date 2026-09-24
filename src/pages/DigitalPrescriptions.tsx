import React, { useState, useMemo } from 'react';

export interface Medicine {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface DigitalPrescription {
  prescriptionId: string;
  doctorName: string;
  department: string;
  date: string;
  medicines: Medicine[];
  instructions: string;
  followUpDate: string;
}

// Sample Prescription Records
const INITIAL_PRESCRIPTIONS: DigitalPrescription[] = [
  {
    prescriptionId: 'RX-2026-0001',
    doctorName: 'Dr. Sarah Jenkins',
    department: 'Cardiology',
    date: '2026-08-14',
    medicines: [
      {
        medicineName: 'Amlodipine Besylate',
        dosage: '5 mg',
        frequency: 'Once daily (Morning)',
        duration: '30 Days'
      },
      {
        medicineName: 'Atorvastatin',
        dosage: '10 mg',
        frequency: 'Once daily (Bedtime)',
        duration: '30 Days'
      }
    ],
    instructions: 'Take medications with water after meals. Monitor blood pressure daily and maintain a log.',
    followUpDate: '2026-09-25'
  },
  {
    prescriptionId: 'RX-2026-0002',
    doctorName: 'Dr. Robert Chen',
    department: 'General Medicine',
    date: '2026-06-02',
    medicines: [
      {
        medicineName: 'Amoxicillin',
        dosage: '500 mg',
        frequency: 'Three times daily',
        duration: '7 Days'
      },
      {
        medicineName: 'Cetirizine HCl',
        dosage: '10 mg',
        frequency: 'Once daily (As needed)',
        duration: '14 Days'
      }
    ],
    instructions: 'Complete the entire course of antibiotics. Drink plenty of fluids throughout the day.',
    followUpDate: '2026-06-16'
  }
];

export const DigitalPrescriptions: React.FC = () => {
  const [prescriptions] = useState<DigitalPrescription[]>(INITIAL_PRESCRIPTIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRx, setSelectedRx] = useState<DigitalPrescription | null>(null);

  // Search filter
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((rx) => {
      const query = searchTerm.toLowerCase();
      return (
        rx.prescriptionId.toLowerCase().includes(query) ||
        rx.doctorName.toLowerCase().includes(query) ||
        rx.department.toLowerCase().includes(query) ||
        rx.medicines.some((med) => med.medicineName.toLowerCase().includes(query))
      );
    });
  }, [prescriptions, searchTerm]);

  // Secure File Downloader
  const handleDownload = (rx: DigitalPrescription) => {
    const medicinesText = rx.medicines
      .map(
        (m, index) =>
          `  ${index + 1}. Medicine Name: ${m.medicineName}\n` +
          `     Dosage:        ${m.dosage}\n` +
          `     Frequency:     ${m.frequency}\n` +
          `     Duration:      ${m.duration}\n`
      )
      .join('\n');

    const content = `
============================================================
OFFICIAL DIGITAL MEDICAL PRESCRIPTION
============================================================
Prescription ID : ${rx.prescriptionId}
Date             : ${rx.date}

CLINICIAN INFORMATION:
Doctor Name      : ${rx.doctorName}
Department       : ${rx.department}

------------------------------------------------------------
PRESCRIBED MEDICATIONS:
${medicinesText}
------------------------------------------------------------
SPECIAL INSTRUCTIONS:
${rx.instructions}

FOLLOW-UP DATE:
${rx.followUpDate}
============================================================
Digitally Verified & Encrypted
Generated on: ${new Date().toLocaleDateString()}
`.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${rx.prescriptionId}_Prescription.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
            💊 Digital Prescriptions
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            View and download your digital medical prescriptions securely.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Search by Prescription ID, Doctor, Department, or Medicine..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Prescriptions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredPrescriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
            No prescriptions found matching your search.
          </div>
        ) : (
          filteredPrescriptions.map((rx) => (
            <div
              key={rx.prescriptionId}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '24px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
              }}
            >
              {/* Header Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div>
                  <span style={{ backgroundColor: '#f0fdf4', color: '#15803d', fontSize: '12px', fontWeight: '800', padding: '4px 10px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                    {rx.prescriptionId}
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '8px 0 2px 0' }}>
                    {rx.doctorName}
                  </h3>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                    Department: <strong>{rx.department}</strong>
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                    📅 Date: <strong>{rx.date}</strong>
                  </div>
                  <div style={{ fontSize: '13px', color: '#dc2626', fontWeight: '700', marginTop: '4px' }}>
                    📌 Follow-up: <strong>{rx.followUpDate}</strong>
                  </div>
                </div>
              </div>

              {/* Medicines Summary Table */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>
                  Prescribed Medicines ({rx.medicines.length})
                </h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left', color: '#475569' }}>
                        <th style={{ padding: '8px 12px', border: '1px solid #e2e8f0' }}>Medicine Name</th>
                        <th style={{ padding: '8px 12px', border: '1px solid #e2e8f0' }}>Dosage</th>
                        <th style={{ padding: '8px 12px', border: '1px solid #e2e8f0' }}>Frequency</th>
                        <th style={{ padding: '8px 12px', border: '1px solid #e2e8f0' }}>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rx.medicines.map((med, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '8px 12px', border: '1px solid #e2e8f0', fontWeight: '700', color: '#0f172a' }}>{med.medicineName}</td>
                          <td style={{ padding: '8px 12px', border: '1px solid #e2e8f0', color: '#0d9488', fontWeight: '600' }}>{med.dosage}</td>
                          <td style={{ padding: '8px 12px', border: '1px solid #e2e8f0' }}>{med.frequency}</td>
                          <td style={{ padding: '8px 12px', border: '1px solid #e2e8f0' }}>{med.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                <button
                  onClick={() => setSelectedRx(rx)}
                  style={{ backgroundColor: '#0d9488', color: '#ffffff', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                >
                  View Details
                </button>
                <button
                  onClick={() => handleDownload(rx)}
                  style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '9px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                >
                  🔒 Download Prescription
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Prescription Details Modal */}
      {selectedRx && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '650px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#0d9488', backgroundColor: '#ccfbf1', padding: '2px 8px', borderRadius: '4px' }}>
                  {selectedRx.prescriptionId}
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0 0' }}>
                  Prescription Details
                </h2>
              </div>
              <button
                onClick={() => setSelectedRx(null)}
                style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', fontSize: '13px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color: '#334155', marginBottom: '20px' }}>
              <div>👨‍⚕️ <strong>Doctor Name:</strong> {selectedRx.doctorName}</div>
              <div>🏥 <strong>Department:</strong> {selectedRx.department}</div>
              <div>📅 <strong>Date:</strong> {selectedRx.date}</div>
              <div>📌 <strong>Follow-up Date:</strong> {selectedRx.followUpDate}</div>
            </div>

            {/* Detailed Medicines */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: '0 0 10px 0' }}>💊 Medicine Schedule</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedRx.medicines.map((m, idx) => (
                  <div key={idx} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fafafa' }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#0d9488' }}>{m.medicineName}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px', fontSize: '12px', color: '#475569', marginTop: '6px' }}>
                      <div><strong>Dosage:</strong> {m.dosage}</div>
                      <div><strong>Frequency:</strong> {m.frequency}</div>
                      <div><strong>Duration:</strong> {m.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>📋 Instructions</h4>
              <p style={{ fontSize: '14px', color: '#334155', backgroundColor: '#fefce8', padding: '12px', borderRadius: '8px', border: '1px solid #fef08a', margin: 0, lineHeight: '1.5' }}>
                {selectedRx.instructions}
              </p>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <button
                onClick={() => handleDownload(selectedRx)}
                style={{ backgroundColor: '#0d9488', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
              >
                Download Prescription 🔒
              </button>
              <button
                onClick={() => setSelectedRx(null)}
                style={{ backgroundColor: '#e2e8f0', color: '#334155', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
