import React, { useState } from 'react';

interface Doctor {
  id: string;
  name: string;
  rating: number;
  specialization: string;
  department: string;
  experience: number;
  location: string;
  fee: number;
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

const initialDoctors: Doctor[] = [
  { id: '1', name: 'Dr. Elena Rostova', rating: 5.0, specialization: 'Cognitive Neurology & Memory Care', department: 'Neurology', experience: 15, location: 'Metro General Hospital', fee: 150 },
  { id: '2', name: 'Dr. Marcus Vance', rating: 4.8, specialization: 'Dermatology & Skin Surgery', department: 'Dermatology', experience: 12, location: 'City Skin Clinic', fee: 120 },
  { id: '3', name: 'Dr. Sarah Jenkins', rating: 4.9, specialization: 'Interventional Cardiology', department: 'Cardiology', experience: 18, location: 'Heart & Vascular Center', fee: 200 },
  { id: '4', name: 'Dr. Rajesh Patel', rating: 4.7, specialization: 'General Medicine & Diabetology', department: 'General Medicine', experience: 10, location: 'Community Care Health', fee: 100 },
  { id: '5', name: 'Dr. Aisha Al-Mansoori', rating: 4.9, specialization: 'Pediatric Pulmonology & Asthma Care', department: 'Pediatrics', experience: 14, location: 'St. Jude Children\'s Center', fee: 140 },
  { id: '6', name: 'Dr. David Chen', rating: 4.8, specialization: 'Orthopedic Surgery & Joint Replacement', department: 'Orthopedics', experience: 16, location: 'Apex Sports & Spine Institute', fee: 180 },
  { id: '7', name: 'Dr. Priya Nair', rating: 4.9, specialization: 'Surgical Oncology & Tumor Resection', department: 'Oncology', experience: 20, location: 'Comprehensive Cancer Care', fee: 220 },
  { id: '8', name: 'Dr. Robert Sterling', rating: 4.7, specialization: 'Adult Psychiatry & Psychotherapy', department: 'Psychiatry', experience: 11, location: 'MindCare Behavioral Health', fee: 130 },
  { id: '9', name: 'Dr. Sofia Gomez', rating: 4.8, specialization: 'Obstetrics & High-Risk Pregnancy', department: 'Gynecology', experience: 13, location: 'Women\'s Wellness Hospital', fee: 160 },
  { id: '10', name: 'Dr. Vikram Joshi', rating: 4.6, specialization: 'Gastroenterology & Endoscopy', department: 'Gastroenterology', experience: 9, location: 'Digestive Health Clinic', fee: 110 },
];

// Extract dynamic list of departments for filter dropdown
const departments = ['All Departments', ...Array.from(new Set(initialDoctors.map((doc) => doc.department)))];

export const DoctorSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');

  // Booking Modal State
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('10:00 AM');
  const [appointmentReason, setAppointmentReason] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const filteredDoctors = initialDoctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDepartment === 'All Departments' || doc.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentDate || !selectedDoctor) {
      alert('Please select an appointment date.');
      return;
    }

    const newAppointment: Appointment = {
      id: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
      doctorName: selectedDoctor.name,
      doctorInfo: `${selectedDoctor.specialization} specialist with ${selectedDoctor.experience} years of clinical experience at ${selectedDoctor.location}.`,
      department: selectedDoctor.department,
      departmentInfo: `Specialized diagnosis and treatment within the ${selectedDoctor.department} department.`,
      date: appointmentDate,
      time: appointmentTime,
      type: 'In-Person Consultation',
      reason: appointmentReason || 'General Consultation',
      status: 'Upcoming',
    };

    const saved = localStorage.getItem('patient_appointments');
    let existingAppointments: Appointment[] = [];
    if (saved) {
      try {
        existingAppointments = JSON.parse(saved);
      } catch (err) {
        console.error('Error parsing stored appointments:', err);
      }
    }

    const updatedAppointments = [newAppointment, ...existingAppointments];
    localStorage.setItem('patient_appointments', JSON.stringify(updatedAppointments));

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setSelectedDoctor(null);
      setAppointmentDate('');
      setAppointmentReason('');
    }, 2500);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', color: '#0f172a', margin: '0 0 8px 0' }}>🧑‍⚕️ Find & Book Doctors</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Search specialists by name, department, or specialization</p>
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Search by doctor name or specialization..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 2, minWidth: '260px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
        />
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          style={{ flex: 1, minWidth: '180px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '14px' }}
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
        Found <strong>{filteredDoctors.length}</strong> doctor(s) matching your criteria
      </p>

      {/* Doctor Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>{doc.name}</h3>
                <span style={{ fontSize: '12px', color: '#b45309', backgroundColor: '#fef3c7', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                  ★ {doc.rating}
                </span>
              </div>
              <p style={{ margin: '0 0 6px 0', color: '#00897b', fontWeight: 'bold', fontSize: '14px' }}>{doc.specialization}</p>
              <div style={{ display: 'flex', gap: '12px', color: '#64748b', fontSize: '13px' }}>
                <span>{doc.department}</span>
                <span>•</span>
                <span>{doc.experience} Yrs Experience</span>
                <span>•</span>
                <span>{doc.location}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>${doc.fee}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Fee</div>
              </div>
              <button
                onClick={() => setSelectedDoctor(doc)}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#00897b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                }}
              >
                Book Appointment
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Booking Modal */}
      {selectedDoctor && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '12px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            {bookingSuccess ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '8px' }}>✅</span>
                <h2 style={{ color: '#0f172a', margin: '0 0 8px 0', fontSize: '20px' }}>Appointment Confirmed!</h2>
                <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                  Scheduled with <strong>{selectedDoctor.name}</strong> for <strong>{appointmentDate}</strong> at <strong>{appointmentTime}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#0f172a' }}>Book with {selectedDoctor.name}</h3>
                <p style={{ color: '#00897b', margin: '0 0 16px 0', fontSize: '14px', fontWeight: 'bold' }}>{selectedDoctor.specialization}</p>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Select Date</label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Select Time Slot</label>
                  <select
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Reason for Visit (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Regular Checkup, Consultation"
                    value={appointmentReason}
                    onChange={(e) => setAppointmentReason(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedDoctor(null)}
                    style={{ padding: '10px 16px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '10px 20px', backgroundColor: '#00897b', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSearch;