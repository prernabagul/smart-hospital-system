import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Current Logged-in Patient Context (Mock Auth Session)
const CURRENT_PATIENT_ID = 'PAT-2026-8801';
const CURRENT_PATIENT_NAME = 'Eleanor Vance';

// Data Interfaces
export interface AppointmentRecord {
  patientId: string;
  appointmentId: string;
  doctorName: string;
  department: string;
  date: string;
  status: 'Completed' | 'Scheduled' | 'Cancelled' | 'In Progress';
  reason: string;
}

export interface MedicalReportRecord {
  patientId: string;
  reportId: string;
  reportName: string;
  reportType: string;
  reportDate: string;
  fileSize: string;
  doctorName: string;
}

export interface PrescriptionRecord {
  patientId: string;
  prescriptionId: string;
  doctorName: string;
  department: string;
  date: string;
  medicinesCount: number;
  status: 'Active' | 'Completed' | 'Refill Needed';
}

// Global Medical Database (Simulating Backend Storage)
const ALL_SYSTEM_RECORDS = {
  appointments: [
    { patientId: 'PAT-2026-8801', appointmentId: 'APT-1001', doctorName: 'Dr. Sarah Jenkins', department: 'Cardiology', date: '2026-09-15', status: 'Completed', reason: 'Annual Cardiac Evaluation' },
    { patientId: 'PAT-2026-8801', appointmentId: 'APT-1002', doctorName: 'Dr. Michael Chang', department: 'Orthopedics', date: '2026-09-28', status: 'Scheduled', reason: 'Knee Joint Checkup' },
    { patientId: 'PAT-2026-8801', appointmentId: 'APT-1003', doctorName: 'Dr. Emily Carter', department: 'Dermatology', date: '2026-08-10', status: 'Completed', reason: 'Skin Allergy Follow-up' },
    { patientId: 'PAT-2026-8801', appointmentId: 'APT-1004', doctorName: 'Dr. Robert Vance', department: 'Neurology', date: '2026-07-04', status: 'Cancelled', reason: 'Migraine Consultation' },
    
    // ANOTHER PATIENT'S DATA (Strictly Hidden by Security Policy)
    { patientId: 'PAT-2026-9999', appointmentId: 'APT-9999', doctorName: 'Dr. Alice Smith', department: 'Pediatrics', date: '2026-09-19', status: 'Completed', reason: 'Confidential Patient File' }
  ] as AppointmentRecord[],

  medicalReports: [
    { patientId: 'PAT-2026-8801', reportId: 'REP-501', reportName: 'Comprehensive Blood Panel & Lipid Profile', reportType: 'Laboratory', reportDate: '2026-09-16', fileSize: '2.4 MB', doctorName: 'Dr. Sarah Jenkins' },
    { patientId: 'PAT-2026-8801', reportId: 'REP-502', reportName: 'Chest X-Ray Digital Scan (AP/PA View)', reportType: 'Radiology', reportDate: '2026-09-15', fileSize: '18.1 MB', doctorName: 'Dr. Sarah Jenkins' },
    { patientId: 'PAT-2026-8801', reportId: 'REP-503', reportName: '12-Lead Electrocardiogram (ECG) Tracing', reportType: 'Diagnostic', reportDate: '2026-08-11', fileSize: '1.1 MB', doctorName: 'Dr. Emily Carter' },
    
    // ANOTHER PATIENT'S REPORT (Strictly Hidden)
    { patientId: 'PAT-2026-9999', reportId: 'REP-999', reportName: 'Private MRI Scan', reportType: 'Radiology', reportDate: '2026-09-01', fileSize: '45 MB', doctorName: 'Dr. Unknown' }
  ] as MedicalReportRecord[],

  prescriptions: [
    { patientId: 'PAT-2026-8801', prescriptionId: 'RX-8812', doctorName: 'Dr. Sarah Jenkins', department: 'Cardiology', date: '2026-09-15', medicinesCount: 3, status: 'Active' },
    { patientId: 'PAT-2026-8801', prescriptionId: 'RX-7410', doctorName: 'Dr. Emily Carter', department: 'Dermatology', date: '2026-08-10', medicinesCount: 2, status: 'Completed' },
    
    // ANOTHER PATIENT'S PRESCRIPTION (Strictly Hidden)
    { patientId: 'PAT-2026-9999', prescriptionId: 'RX-9999', doctorName: 'Dr. Alice Smith', department: 'Pediatrics', date: '2026-09-19', medicinesCount: 4, status: 'Active' }
  ] as PrescriptionRecord[]
};

export const PatientRecordsSearch: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'appointments' | 'reports' | 'prescriptions'>('appointments');

  // Search Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedReportType, setSelectedReportType] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');

  // SECURE FILTER 1: Isolate data so ONLY records matching the current patient are retrieved
  const patientData = useMemo(() => {
    return {
      appointments: ALL_SYSTEM_RECORDS.appointments.filter((a) => a.patientId === CURRENT_PATIENT_ID),
      medicalReports: ALL_SYSTEM_RECORDS.medicalReports.filter((r) => r.patientId === CURRENT_PATIENT_ID),
      prescriptions: ALL_SYSTEM_RECORDS.prescriptions.filter((p) => p.patientId === CURRENT_PATIENT_ID)
    };
  }, []);

  // SECURE FILTER 2: Apply dynamic multi-criteria search filters across patient records
  const filteredAppointments = useMemo(() => {
    return patientData.appointments.filter((apt) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        apt.appointmentId.toLowerCase().includes(q) ||
        apt.doctorName.toLowerCase().includes(q) ||
        apt.department.toLowerCase().includes(q);

      const matchesDept = selectedDepartment === 'ALL' || apt.department === selectedDepartment;
      const matchesStatus = selectedStatus === 'ALL' || apt.status === selectedStatus;
      const matchesDate = !selectedDate || apt.date === selectedDate;

      return matchesSearch && matchesDept && matchesStatus && matchesDate;
    });
  }, [patientData.appointments, searchTerm, selectedDepartment, selectedStatus, selectedDate]);

  const filteredReports = useMemo(() => {
    return patientData.medicalReports.filter((rpt) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        rpt.reportName.toLowerCase().includes(q) ||
        rpt.reportType.toLowerCase().includes(q) ||
        rpt.reportId.toLowerCase().includes(q);

      const matchesType = selectedReportType === 'ALL' || rpt.reportType === selectedReportType;
      const matchesDate = !selectedDate || rpt.reportDate === selectedDate;

      return matchesSearch && matchesType && matchesDate;
    });
  }, [patientData.medicalReports, searchTerm, selectedReportType, selectedDate]);

  const filteredPrescriptions = useMemo(() => {
    return patientData.prescriptions.filter((rx) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        rx.prescriptionId.toLowerCase().includes(q) ||
        rx.doctorName.toLowerCase().includes(q) ||
        rx.department.toLowerCase().includes(q);

      const matchesDept = selectedDepartment === 'ALL' || rx.department === selectedDepartment;
      const matchesDate = !selectedDate || rx.date === selectedDate;

      return matchesSearch && matchesDept && matchesDate;
    });
  }, [patientData.prescriptions, searchTerm, selectedDepartment, selectedDate]);

  // Reset Filters when switching tabs
  const handleTabChange = (tab: 'appointments' | 'reports' | 'prescriptions') => {
    setActiveTab(tab);
    setSearchTerm('');
    setSelectedDepartment('ALL');
    setSelectedStatus('ALL');
    setSelectedReportType('ALL');
    setSelectedDate('');
  };

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Top Banner & Security Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
            📁 My Health Records & History
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Search your past appointments, diagnostic lab reports, and active medical prescriptions.
          </p>
        </div>

        {/* Patient Security Badge */}
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '8px 14px', fontSize: '12px', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🔒</span>
          <div>
            <strong>Secured Patient File:</strong> {CURRENT_PATIENT_NAME} ({CURRENT_PATIENT_ID})
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '24px' }}>
        <button
          onClick={() => handleTabChange('appointments')}
          style={{
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            color: activeTab === 'appointments' ? '#0d9488' : '#64748b',
            borderBottom: activeTab === 'appointments' ? '3px solid #0d9488' : '3px solid transparent',
            transition: 'all 0.15s ease'
          }}
        >
          📅 Appointments ({patientData.appointments.length})
        </button>

        <button
          onClick={() => handleTabChange('reports')}
          style={{
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            color: activeTab === 'reports' ? '#0d9488' : '#64748b',
            borderBottom: activeTab === 'reports' ? '3px solid #0d9488' : '3px solid transparent',
            transition: 'all 0.15s ease'
          }}
        >
          📊 Medical Reports ({patientData.medicalReports.length})
        </button>

        <button
          onClick={() => handleTabChange('prescriptions')}
          style={{
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            color: activeTab === 'prescriptions' ? '#0d9488' : '#64748b',
            borderBottom: activeTab === 'prescriptions' ? '3px solid #0d9488' : '3px solid transparent',
            transition: 'all 0.15s ease'
          }}
        >
          💊 Prescriptions ({patientData.prescriptions.length})
        </button>
      </div>

      {/* Search & Filter Controls Panel */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          
          {/* Universal Text Search */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
              Search {activeTab}
            </label>
            <input
              type="text"
              placeholder={
                activeTab === 'appointments'
                  ? 'Search ID, Doctor, Department...'
                  : activeTab === 'reports'
                  ? 'Search Report Name, Type...'
                  : 'Search Prescription ID, Doctor...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Department Filter (For Appointments & Prescriptions) */}
          {(activeTab === 'appointments' || activeTab === 'prescriptions') && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff' }}
              >
                <option value="ALL">All Departments</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Neurology">Neurology</option>
              </select>
            </div>
          )}

          {/* Status Filter (For Appointments Only) */}
          {activeTab === 'appointments' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                Appointment Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          )}

          {/* Report Type Filter (For Medical Reports Only) */}
          {activeTab === 'reports' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                Report Category
              </label>
              <select
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff' }}
              >
                <option value="ALL">All Report Types</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Radiology">Radiology</option>
                <option value="Diagnostic">Diagnostic</option>
              </select>
            </div>
          )}

          {/* Specific Date Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
              Filter by Exact Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
            />
          </div>

        </div>
      </div>

      {/* TAB 1: APPOINTMENTS VIEW */}
      {activeTab === 'appointments' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {filteredAppointments.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No matching appointment records found.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '14px 18px' }}>Appointment ID</th>
                  <th style={{ padding: '14px 18px' }}>Doctor</th>
                  <th style={{ padding: '14px 18px' }}>Department</th>
                  <th style={{ padding: '14px 18px' }}>Date</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((apt) => (
                  <tr key={apt.appointmentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', fontWeight: '700', color: '#0f172a' }}>{apt.appointmentId}</td>
                    <td style={{ padding: '14px 18px', color: '#334155', fontWeight: '600' }}>{apt.doctorName}</td>
                    <td style={{ padding: '14px 18px', color: '#64748b' }}>{apt.department}</td>
                    <td style={{ padding: '14px 18px', color: '#334155' }}>{apt.date}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '800',
                        backgroundColor: apt.status === 'Completed' ? '#f0fdf4' : apt.status === 'Scheduled' ? '#f0f9ff' : '#fef2f2',
                        color: apt.status === 'Completed' ? '#15803d' : apt.status === 'Scheduled' ? '#0369a1' : '#b91c1c',
                        border: `1px solid ${apt.status === 'Completed' ? '#bbf7d0' : apt.status === 'Scheduled' ? '#bae6fd' : '#fecaca'}`
                      }}>
                        {apt.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        onClick={() => alert(`Appointment Details for ${apt.appointmentId}:\nDoctor: ${apt.doctorName}\nReason: ${apt.reason}`)}
                        style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 2: MEDICAL REPORTS VIEW */}
      {activeTab === 'reports' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {filteredReports.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No matching medical reports found.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '14px 18px' }}>Report Name</th>
                  <th style={{ padding: '14px 18px' }}>Category</th>
                  <th style={{ padding: '14px 18px' }}>Report Date</th>
                  <th style={{ padding: '14px 18px' }}>Ref Doctor</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Download</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((rpt) => (
                  <tr key={rpt.reportId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{rpt.reportName}</div>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>ID: {rpt.reportId} • Size: {rpt.fileSize}</span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                        {rpt.reportType}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#334155' }}>{rpt.reportDate}</td>
                    <td style={{ padding: '14px 18px', color: '#64748b' }}>{rpt.doctorName}</td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        onClick={() => alert(`Downloading report document ${rpt.reportId} (${rpt.reportName})...`)}
                        style={{ backgroundColor: '#0d9488', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        📄 PDF Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 3: PRESCRIPTIONS VIEW */}
      {activeTab === 'prescriptions' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {filteredPrescriptions.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No matching prescriptions found.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '14px 18px' }}>Prescription ID</th>
                  <th style={{ padding: '14px 18px' }}>Prescribing Doctor</th>
                  <th style={{ padding: '14px 18px' }}>Department</th>
                  <th style={{ padding: '14px 18px' }}>Date</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.map((rx) => (
                  <tr key={rx.prescriptionId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', fontWeight: '700', color: '#0f172a' }}>{rx.prescriptionId}</td>
                    <td style={{ padding: '14px 18px', color: '#334155', fontWeight: '600' }}>{rx.doctorName}</td>
                    <td style={{ padding: '14px 18px', color: '#64748b' }}>{rx.department}</td>
                    <td style={{ padding: '14px 18px', color: '#334155' }}>{rx.date}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '800',
                        backgroundColor: rx.status === 'Active' ? '#f0fdf4' : '#f8fafc',
                        color: rx.status === 'Active' ? '#15803d' : '#64748b',
                        border: `1px solid ${rx.status === 'Active' ? '#bbf7d0' : '#cbd5e1'}`
                      }}>
                        {rx.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        onClick={() => navigate('/prescriptions')}
                        style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        View Medicines ({rx.medicinesCount})
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

    </div>
  );
};
export default PatientRecordsSearch;