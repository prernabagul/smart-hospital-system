import React, { useState } from 'react';

export interface FeedbackRecord {
  id: string;
  appointmentId: string;
  doctorName: string;
  department: string;
  date: string;
  doctorRating: number; // 1 - 5
  hospitalRating: number; // 1 - 5
  consultationExperience: 'Excellent' | 'Good' | 'Average' | 'Poor';
  feedbackComments: string;
  submittedAt: string;
}

// Initial Mock Data for Previous Feedback
const INITIAL_FEEDBACK_HISTORY: FeedbackRecord[] = [
  {
    id: 'FB-101',
    appointmentId: 'APT-8821',
    doctorName: 'Dr. Sarah Jenkins',
    department: 'Cardiology',
    date: '2026-09-10',
    doctorRating: 5,
    hospitalRating: 5,
    consultationExperience: 'Excellent',
    feedbackComments: 'Dr. Jenkins was extremely thorough in explaining my ECG results. The hospital wait time was minimal.',
    submittedAt: '2026-09-10 04:30 PM'
  },
  {
    id: 'FB-102',
    appointmentId: 'APT-7412',
    doctorName: 'Dr. Michael Chang',
    department: 'Orthopedics',
    date: '2026-08-22',
    doctorRating: 4,
    hospitalRating: 4,
    consultationExperience: 'Good',
    feedbackComments: 'Good overall visit. Smooth X-ray process, though parking was a bit crowded.',
    submittedAt: '2026-08-22 02:15 PM'
  }
];

export const AppointmentFeedback: React.FC = () => {
  // Completed appointment ready for feedback submission
  const [completedAppointment] = useState({
    id: 'APT-9905',
    doctorName: 'Dr. Emily Carter',
    department: 'Dermatology',
    date: '2026-09-19',
    time: '11:00 AM'
  });

  // Form State
  const [doctorRating, setDoctorRating] = useState<number>(0);
  const [hospitalRating, setHospitalRating] = useState<number>(0);
  const [consultationExperience, setConsultationExperience] = useState<'Excellent' | 'Good' | 'Average' | 'Poor'>('Excellent');
  const [feedbackComments, setFeedbackComments] = useState<string>('');
  
  // History State
  const [feedbackList, setFeedbackList] = useState<FeedbackRecord[]>(INITIAL_FEEDBACK_HISTORY);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Form Submit Handler
  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();

    if (doctorRating === 0 || hospitalRating === 0) {
      alert('Please provide star ratings for both the doctor and the hospital.');
      return;
    }

    const newFeedback: FeedbackRecord = {
      id: `FB-${Math.floor(1000 + Math.random() * 9000)}`,
      appointmentId: completedAppointment.id,
      doctorName: completedAppointment.doctorName,
      department: completedAppointment.department,
      date: completedAppointment.date,
      doctorRating,
      hospitalRating,
      consultationExperience,
      feedbackComments,
      submittedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
    };

    setFeedbackList([newFeedback, ...feedbackList]);
    setIsSubmitted(true);
  };

  // Star Rating Helper Component
  const StarRating = ({ value, onChange }: { value: number; onChange: (rating: number) => void }) => {
    return (
      <div style={{ display: 'flex', gap: '6px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: star <= value ? '#f59e0b' : '#cbd5e1',
              padding: '0 2px',
              transition: 'color 0.15s ease'
            }}
          >
            ★
          </button>
        ))}
        <span style={{ fontSize: '13px', color: '#64748b', alignSelf: 'center', marginLeft: '6px', fontWeight: '600' }}>
          {value > 0 ? `${value} / 5` : 'Select rating'}
        </span>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
          ⭐ Patient Feedback & Reviews
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          Help us improve our clinical quality and patient experience by providing feedback on your recent consultations.
        </p>
      </div>

      {/* SECTION 1: Submit Feedback Form for Completed Appointment */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            Submit Feedback for Recent Appointment
          </h2>
          <span style={{ backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px' }}>
            Completed • {completedAppointment.date}
          </span>
        </div>

        {isSubmitted ? (
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
            <span style={{ fontSize: '32px' }}>🎉</span>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#166534', margin: '8px 0 4px 0' }}>Thank You for Your Feedback!</h3>
            <p style={{ fontSize: '13px', color: '#15803d', margin: 0 }}>
              Your responses have been successfully submitted and logged in your profile history below.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Appointment Context Details */}
            <div style={{ backgroundColor: '#f8fafc', padding: '14px 18px', borderRadius: '10px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', border: '1px solid #f1f5f9' }}>
              <div>👨‍⚕️ <strong>Doctor:</strong> {completedAppointment.doctorName} ({completedAppointment.department})</div>
              <div>📅 <strong>Date & Time:</strong> {completedAppointment.date} at {completedAppointment.time}</div>
              <div>🆔 <strong>Ref ID:</strong> {completedAppointment.id}</div>
            </div>

            {/* Doctor Rating */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                1. Doctor Rating
              </label>
              <StarRating value={doctorRating} onChange={setDoctorRating} />
            </div>

            {/* Hospital Rating */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                2. Hospital & Facilities Rating
              </label>
              <StarRating value={hospitalRating} onChange={setHospitalRating} />
            </div>

            {/* Consultation Experience Dropdown/Pills */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                3. Overall Consultation Experience
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {(['Excellent', 'Good', 'Average', 'Poor'] as const).map((exp) => (
                  <button
                    key={exp}
                    type="button"
                    onClick={() => setConsultationExperience(exp)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      border: consultationExperience === exp ? '2px solid #0d9488' : '1px solid #cbd5e1',
                      backgroundColor: consultationExperience === exp ? '#ccfbf1' : '#ffffff',
                      color: consultationExperience === exp ? '#0f766e' : '#475569'
                    }}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback / Comments Textarea */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                4. Feedback & Detailed Comments (Optional)
              </label>
              <textarea
                rows={4}
                placeholder="Share details about wait time, staff behavior, doctor explanations, or facility cleanliness..."
                value={feedbackComments}
                onChange={(e) => setFeedbackComments(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                style={{
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 28px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Submit Feedback
              </button>
            </div>

          </form>
        )}
      </div>

      {/* SECTION 2: Previous Submitted Feedback */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>
          📋 Previously Submitted Feedback ({feedbackList.length})
        </h2>

        {feedbackList.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', color: '#64748b', border: '1px solid #e2e8f0' }}>
            No previous feedback submitted yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {feedbackList.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 2px 0' }}>
                      {item.doctorName}
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {item.department} • Consultation Date: {item.date}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
                    Submitted on {item.submittedAt}
                  </span>
                </div>

                {/* Rating Badges Grid */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <div style={{ backgroundColor: '#fffbebfb', border: '1px solid #fef3c7', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', color: '#92400e' }}>
                    👨‍⚕️ Doctor: <strong>{'★'.repeat(item.doctorRating)}</strong> ({item.doctorRating}/5)
                  </div>
                  <div style={{ backgroundColor: '#fffbebfb', border: '1px solid #fef3c7', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', color: '#92400e' }}>
                    🏥 Hospital: <strong>{'★'.repeat(item.hospitalRating)}</strong> ({item.hospitalRating}/5)
                  </div>
                  <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', color: '#0369a1' }}>
                    Experience: <strong>{item.consultationExperience}</strong>
                  </div>
                </div>

                {/* Feedback Comments */}
                {item.feedbackComments && (
                  <p style={{ fontSize: '13px', color: '#334155', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', margin: 0, lineHeight: '1.5', border: '1px solid #f1f5f9' }}>
                    "{item.feedbackComments}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
export default AppointmentFeedback;