import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RecordItem {
  id: string;
  title: string;
  category: string;
  date: string;
  doctor: string;
  description: string;
}

interface Appointment {
  id: string;
  doctorName: string;
  doctorInfo: string;
  department: string;
  departmentInfo: string;
  date: string;
  time: string;
  type: string;
  reason: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
}

// Default initial appointments if none are stored in localStorage
const initialAppointments: Appointment[] = [
  {
    id: 'APT-1001',
    doctorName: 'Dr. Sarah Jenkins',
    doctorInfo: 'Senior Cardiologist with 12+ years of experience in cardiovascular health.',
    department: 'Cardiology',
    departmentInfo: 'Specializes in diagnosing and treating heart conditions and blood vessel disorders.',
    date: '2026-10-05',
    time: '10:30 AM',
    type: 'In-Person Consultation',
    reason: 'Routine follow-up for mild blood pressure fluctuations.',
    status: 'Upcoming',
  },
  {
    id: 'APT-0982',
    doctorName: 'Dr. Robert Chen',
    doctorInfo: 'Consultant Dermatologist focusing on cosmetic and medical skin treatments.',
    department: 'Dermatology',
    departmentInfo: 'Provides comprehensive diagnosis and treatment for skin, hair, and nail diseases.',
    date: '2026-08-14',
    time: '02:15 PM',
    type: 'Video Consultation',
    reason: 'Skin rash inspection and preventive care routine.',
    status: 'Completed',
  },
  {
    id: 'APT-0941',
    doctorName: 'Dr. Emily Watson',
    doctorInfo: 'Neurologist specializing in migraine treatment and nervous system health.',
    department: 'Neurology',
    departmentInfo: 'Delivers specialized care for central and peripheral nervous system conditions.',
    date: '2026-07-02',
    time: '11:00 AM',
    type: 'In-Person Consultation',
    reason: 'Frequent tension headache assessment.',
    status: 'Cancelled',
  },
];

export const MedicalRecords: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Dynamic Patient Info from Context
  const displayName = user?.name || user?.name || 'Prerna Bagul';
  const patientId = user?.patientId || 'PAT-2026-0001';
  const bloodGroup = user?.bloodGroup || 'O+';
  const allergies = user?.allergies || ['Penicillin', 'Dust Mites', 'Shellfish'];

  // State Management
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Upcoming' | 'Completed' | 'Cancelled'>('All');

  // Modal State
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [activeModal, setActiveModal] = useState<'details' | 'doctor' | 'department' | 'reschedule' | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  // Sample Records List
  const records: RecordItem[] = [
    {
      id: 'REC-01',
      title: 'Routine Cardiology Consultation',
      category: 'Appointment',
      date: '2026-08-14',
      doctor: 'Dr. Sarah Jenkins (Cardiology)',
      description: 'Follow-up consultation for mild blood pressure fluctuations.',
    },
    {
      id: 'REC-02',
      title: 'Comprehensive Blood Panel & Lipid Profile',
      category: 'Lab Result',
      date: '2026-07-20',
      doctor: 'Dr. Robert Chen (Pathology Lab)',
      description: 'Routine annual blood work and lipid screening.',
    },
  ];

  // Appointments List loaded directly from localStorage with fallback
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('patient_appointments');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Error loading saved appointments:', err);
      }
    }
    return initialAppointments;
  });

  // Keep localStorage updated whenever appointments state changes
  useEffect(() => {
    localStorage.setItem('patient_appointments', JSON.stringify(appointments));
  }, [appointments]);

  // Appointment Action Handlers
  const handleCancelAppointment = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: 'Cancelled' as const } : apt))
      );
    }
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newTime || !selectedAppointment) return;

    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === selectedAppointment.id
          ? { ...apt, date: newDate, time: newTime, status: 'Upcoming' as const }
          : apt
      )
    );
    setActiveModal(null);
    setSelectedAppointment(null);
    alert('Appointment rescheduled successfully!');
  };

  // Filtering Logic
  const filteredRecords = records
    .filter((record) => {
      const matchesCategory = filterCategory === 'All' || record.category === filterCategory;
      const matchesSearch =
        record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const filteredAppointments = appointments.filter((apt) => {
    const matchesStatus = statusFilter === 'All' || apt.status === statusFilter;
    const matchesSearch =
      apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'Upcoming':
        return { bg: '#e0f2fe', color: '#0284c7', label: 'Upcoming' };
      case 'Completed':
        return { bg: '#d1fae5', color: '#059669', label: 'Completed' };
      case 'Cancelled':
        return { bg: '#fee2e2', color: '#dc2626', label: 'Cancelled' };
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '32px 16px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ maxWidth: '1050px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
              📁 My Medical Records & Appointments
            </h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
              Centralized repository for appointments, lab results, prescriptions, medical reports, and procedures.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e2e8f0',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              color: '#334155',
            }}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Dynamic Patient Info Box */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            marginBottom: '28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>👤</span> Patient Information
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Full Name</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>{displayName}</div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Patient ID</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#0d9488', marginTop: '2px' }}>{patientId}</div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Blood Group</div>
              <div style={{ marginTop: '2px' }}>
                <span style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '2px 8px', borderRadius: '12px', fontSize: '13px', fontWeight: '700' }}>
                  🩸 {bloodGroup}
                </span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Known Allergies</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                {allergies.map((allergy: string, idx: number) => (
                  <span key={idx} style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                    ⚠️ {allergy}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Unified Search, Filter, and Sort Bar */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            marginBottom: '28px',
            flexWrap: 'wrap',
          }}
        >
          <input
            type="text"
            placeholder="🔍 Search appointments, reports, doctors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: '240px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '14px',
              outline: 'none',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Filter:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px', fontSize: '13px', outline: 'none' }}
            >
              <option value="All">All Categories</option>
              <option value="Appointment">Appointments</option>
              <option value="Lab Result">Lab Results</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Sort:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px', fontSize: '13px', outline: 'none' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* SECTION 1: APPOINTMENTS MANAGEMENT */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Appointment Management
            </h2>

            <div style={{ display: 'flex', gap: '6px', backgroundColor: '#e2e8f0', padding: '4px', borderRadius: '10px' }}>
              {(['All', 'Upcoming', 'Completed', 'Cancelled'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    backgroundColor: statusFilter === status ? '#ffffff' : 'transparent',
                    color: statusFilter === status ? '#0f172a' : '#64748b',
                    boxShadow: statusFilter === status ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredAppointments.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', color: '#64748b', border: '1px dashed #cbd5e1' }}>
                No {statusFilter.toLowerCase()} appointments match your criteria.
              </div>
            ) : (
              filteredAppointments.map((apt) => {
                const statusBadge = getStatusBadge(apt.status);
                return (
                  <div
                    key={apt.id}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '20px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>
                          Appointment ID: {apt.id}
                        </span>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '2px 0 0 0' }}>
                          {apt.type}
                        </h3>
                      </div>
                      <span style={{ backgroundColor: statusBadge.bg, color: statusBadge.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                        {statusBadge.label}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Doctor</div>
                        <button
                          onClick={() => { setSelectedAppointment(apt); setActiveModal('doctor'); }}
                          style={{ background: 'none', border: 'none', padding: 0, color: '#0284c7', fontWeight: '700', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          👨‍⚕️ {apt.doctorName}
                        </button>
                      </div>

                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Department</div>
                        <button
                          onClick={() => { setSelectedAppointment(apt); setActiveModal('department'); }}
                          style={{ background: 'none', border: 'none', padding: 0, color: '#0284c7', fontWeight: '700', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          🏥 {apt.department}
                        </button>
                      </div>

                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Date & Time</div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                          📅 {apt.date} at {apt.time}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Reason</div>
                        <div style={{ fontSize: '13px', color: '#334155' }}>{apt.reason}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                      <button
                        onClick={() => { setSelectedAppointment(apt); setActiveModal('details'); }}
                        style={{ padding: '6px 12px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', color: '#0f172a', cursor: 'pointer' }}
                      >
                        View Details
                      </button>

                      {apt.status === 'Upcoming' && (
                        <>
                          <button
                            onClick={() => { setSelectedAppointment(apt); setActiveModal('reschedule'); }}
                            style={{ padding: '6px 12px', backgroundColor: '#e0f2fe', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', color: '#0284c7', cursor: 'pointer' }}
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleCancelAppointment(apt.id)}
                            style={{ padding: '6px 12px', backgroundColor: '#fef2f2', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', color: '#ef4444', cursor: 'pointer' }}
                          >
                            Cancel Appointment
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SECTION 2: MEDICAL & LAB RECORDS LIST */}
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
            Medical History & Reports
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredRecords.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', color: '#64748b', border: '1px dashed #cbd5e1' }}>
                No records matching criteria found.
              </div>
            ) : (
              filteredRecords.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                        {item.category}
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                        📅 {item.date}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>
                      {item.title}
                    </h3>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                      Doctor / Unit: {item.doctor}
                    </div>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                      {item.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ backgroundColor: '#0d9488', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                      View Details
                    </button>
                    <button style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                      📥 Download
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* MODALS */}
      {activeModal && selectedAppointment && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px', maxWidth: '500px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            {activeModal === 'details' && (
              <div>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#0f172a' }}>Appointment Details</h3>
                <p><strong>Appointment ID:</strong> {selectedAppointment.id}</p>
                <p><strong>Type:</strong> {selectedAppointment.type}</p>
                <p><strong>Doctor:</strong> {selectedAppointment.doctorName}</p>
                <p><strong>Department:</strong> {selectedAppointment.department}</p>
                <p><strong>Date & Time:</strong> {selectedAppointment.date} ({selectedAppointment.time})</p>
                <p><strong>Status:</strong> {selectedAppointment.status}</p>
                <p><strong>Reason for Visit:</strong> {selectedAppointment.reason}</p>
              </div>
            )}

            {activeModal === 'doctor' && (
              <div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#0f172a' }}>👨‍⚕️ Doctor Information</h3>
                <p style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 6px 0' }}>{selectedAppointment.doctorName}</p>
                <p style={{ fontSize: '13px', color: '#0284c7', fontWeight: '600', margin: '0 0 12px 0' }}>Department: {selectedAppointment.department}</p>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>{selectedAppointment.doctorInfo}</p>
              </div>
            )}

            {activeModal === 'department' && (
              <div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#0f172a' }}>🏥 Department Information</h3>
                <p style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0' }}>{selectedAppointment.department} Department</p>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>{selectedAppointment.departmentInfo}</p>
              </div>
            )}

            {activeModal === 'reschedule' && (
              <form onSubmit={handleRescheduleSubmit}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#0f172a' }}>Reschedule Appointment</h3>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>New Date</label>
                  <input type="date" required value={newDate} onChange={(e) => setNewDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>New Time</label>
                  <input type="time" required value={newTime} onChange={(e) => setNewTime(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', marginBottom: '8px' }}>
                  Confirm Reschedule
                </button>
              </form>
            )}

            <button
              onClick={() => { setActiveModal(null); setSelectedAppointment(null); }}
              style={{ width: '100%', padding: '10px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MedicalRecords;