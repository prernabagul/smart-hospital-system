import React, { useState } from 'react';

interface Doctor {
  name: string;
  department: string;
  qualification: string;
  experience: string;
}

export const DoctorRecommendation: React.FC = () => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<{ department: string; doctor: Doctor; reason: string } | null>(null);
  
  // Booking state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const handleFindDoctor = () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setBookingSuccess(null);
    
    setTimeout(() => {
      setRecommendation({
        department: 'Neurology',
        doctor: {
          name: 'Dr. Robert Chen, MD',
          department: 'Neurology',
          qualification: 'Board Certified Neurologist',
          experience: '12 Years Experience'
        },
        reason: 'Based on your reported symptoms, our AI system recommends a consultation with a Neurologist for diagnostic evaluation.'
      });
      setLoading(false);
    }, 600);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate) {
      alert('Please select a preferred appointment date.');
      return;
    }
    setBookingSuccess(`Appointment successfully booked with ${recommendation?.doctor.name} on ${bookingDate} at ${bookingTime}! Confirmation sent.`);
    setShowBookingModal(false);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>🤖 AI Doctor & Department Finder</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>Enter your symptoms to receive an instant AI specialist recommendation.</p>
        
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Describe your symptoms (e.g., headache, dizziness)..."
          rows={4}
          style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box' }}
        />
        
        <button
          onClick={handleFindDoctor}
          disabled={loading}
          style={{ marginTop: '12px', backgroundColor: '#0d9488', color: '#ffffff', fontWeight: '600', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          {loading ? 'Analyzing Symptoms...' : 'Find Recommended Doctor'}
        </button>

        {bookingSuccess && (
          <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
            ✅ {bookingSuccess}
          </div>
        )}

        {recommendation && (
          <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#14532d', marginBottom: '8px' }}>Recommended Department: {recommendation.department}</h3>
            <p style={{ color: '#334155', marginBottom: '16px' }}>{recommendation.reason}</p>
            
            <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, fontWeight: 'bold', color: '#0f172a' }}>{recommendation.doctor.name}</h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>{recommendation.doctor.qualification} • {recommendation.doctor.experience}</p>
              </div>
              <button 
                onClick={() => setShowBookingModal(true)}
                style={{ backgroundColor: '#0d9488', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
              >
                Book Appointment
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', width: '90%', maxWidth: '400px', padding: '24px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, color: '#0f172a' }}>Book Appointment</h3>
            <p style={{ fontSize: '14px', color: '#64748b' }}>Select slot with {recommendation?.doctor.name}</p>
            
            <form onSubmit={handleConfirmBooking}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#334155' }}>Select Date:</label>
                <input 
                  type="date" 
                  required
                  value={bookingDate} 
                  onChange={(e) => setBookingDate(e.target.value)} 
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#334155' }}>Select Time Slot:</label>
                <select 
                  value={bookingTime} 
                  onChange={(e) => setBookingTime(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option>09:00 AM</option>
                  <option>10:00 AM</option>
                  <option>02:00 PM</option>
                  <option>04:00 PM</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowBookingModal(false)}
                  style={{ padding: '8px 16px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '8px 16px', backgroundColor: '#0d9488', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
