import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export interface PatientProfileData {
  fullName: string;
  patientId: string;
  dateOfBirth: string;
  age: number | string;
  gender: string;
  bloodGroup: string;
  email: string;
  mobileNumber: string;
  address: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
}

// Utility function to export patient details for booking appointments
export const getPatientDetailsForBooking = (user: any): Partial<PatientProfileData> => {
  const savedProfile = localStorage.getItem('patientProfile');
  const parsedProfile = savedProfile ? JSON.parse(savedProfile) : {};

  return {
    fullName: parsedProfile.fullName || user?.name || user?.fullName || 'Prerna Sharma',
    patientId: parsedProfile.patientId || user?.patientId || 'PAT-2026-0001',
    email: parsedProfile.email || user?.email || 'prerna@gmail.com',
    mobileNumber: parsedProfile.mobileNumber || user?.mobileNumber || '+91 98765 43210',
    bloodGroup: parsedProfile.bloodGroup || user?.bloodGroup || 'O+',
    gender: parsedProfile.gender || user?.gender || 'Female',
    age: parsedProfile.age || user?.age || 28,
  };
};

export const PatientProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load existing profile from localStorage or fall back to defaults/AuthContext
  const getInitialData = (): PatientProfileData => {
    const saved = localStorage.getItem('patientProfile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse patientProfile', e);
      }
    }
    return {
      fullName: user?.name || user?.fullName || 'Prerna Sharma',
      patientId: user?.patientId || 'PAT-2026-0001',
      dateOfBirth: user?.dateOfBirth || '1998-05-14',
      age: user?.age || 28,
      gender: user?.gender || 'Female',
      bloodGroup: user?.bloodGroup || 'O+',
      email: user?.email || 'prerna@gmail.com',
      mobileNumber: user?.mobileNumber || '+91 98765 43210',
      address: user?.address || '102, Green Park Society, Sector 15, Navi Mumbai, Maharashtra - 400703',
      emergencyContactName: user?.emergencyContactName || 'Rajesh Sharma',
      emergencyContactRelation: user?.emergencyContactRelation || 'Father',
      emergencyContactPhone: user?.emergencyContactPhone || '+91 98111 22233',
    };
  };

  const [formData, setFormData] = useState<PatientProfileData>(getInitialData);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Auto-calculate age from date of birth
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dob = e.target.value;
    let calculatedAge = formData.age;
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      calculatedAge = age > 0 ? age : 0;
    }

    setFormData((prev) => ({
      ...prev,
      dateOfBirth: dob,
      age: calculatedAge,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Persist to localStorage
    localStorage.setItem('patientProfile', JSON.stringify(formData));

    // Update AuthContext session user state
    const updatedUser = {
  ...user,
  name: formData.fullName,
  fullName: formData.fullName,
  email: formData.email,
  bloodGroup: formData.bloodGroup,
  patientId: formData.patientId,
};
// Use updatedUser here:
localStorage.setItem('active_user_session', JSON.stringify(updatedUser)); 

    setIsEditing(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '32px 16px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Top Header & Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            ← Back to Dashboard
          </button>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
              }}
            >
              ✏️ Edit Profile
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          )}
        </div>

        {/* Success Alert Banner */}
        {isSaved && (
          <div
            style={{
              padding: '14px 20px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #6ee7b7',
              borderRadius: '12px',
              color: '#065f46',
              fontWeight: '600',
              fontSize: '14px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>✅</span>
            <span>Profile information saved successfully! Updates will automatically apply when booking appointments.</span>
          </div>
        )}

        {/* Profile Card Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            borderRadius: '20px 20px 0 0',
            padding: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: '#38bdf8',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: '800',
              }}
            >
              {formData.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 6px 0' }}>{formData.fullName}</h1>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '16px', fontSize: '13px', color: '#38bdf8' }}>
                  🆔 {formData.patientId}
                </span>
                <span style={{ backgroundColor: '#ef4444', color: '#fff', padding: '4px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: '700' }}>
                  🩸 Blood Group: {formData.bloodGroup}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Body Form */}
        <form
          onSubmit={handleSave}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '0 0 20px 20px',
            border: '1px solid #e2e8f0',
            borderTop: 'none',
            padding: '32px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
          }}
        >
          {/* Section 1: Personal Details */}
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '20px', paddingBottom: '8px', borderBottom: '2px solid #f1f5f9' }}>
            👤 Personal Details
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '28px' }}>
            {/* Patient Name */}
            <div>
              <label style={labelStyle}>Patient Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  style={inputStyle(focusedInput === 'fullName')}
                  onFocus={() => setFocusedInput('fullName')}
                  onBlur={() => setFocusedInput(null)}
                />
              ) : (
                <div style={readOnlyStyle}>{formData.fullName}</div>
              )}
            </div>

            {/* Patient ID (Read-only System Key) */}
            <div>
              <label style={labelStyle}>Patient ID (Read-Only)</label>
              <div style={{ ...readOnlyStyle, backgroundColor: '#f1f5f9', color: '#64748b' }}>{formData.patientId}</div>
            </div>

            {/* Date of Birth */}
            <div>
              <label style={labelStyle}>Date of Birth</label>
              {isEditing ? (
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleDobChange}
                  style={inputStyle(focusedInput === 'dateOfBirth')}
                  onFocus={() => setFocusedInput('dateOfBirth')}
                  onBlur={() => setFocusedInput(null)}
                />
              ) : (
                <div style={readOnlyStyle}>{formData.dateOfBirth}</div>
              )}
            </div>

            {/* Age */}
            <div>
              <label style={labelStyle}>Age</label>
              <div style={readOnlyStyle}>{formData.age} years old</div>
            </div>

            {/* Gender */}
            <div>
              <label style={labelStyle}>Gender</label>
              {isEditing ? (
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  style={inputStyle(focusedInput === 'gender')}
                  onFocus={() => setFocusedInput('gender')}
                  onBlur={() => setFocusedInput(null)}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              ) : (
                <div style={readOnlyStyle}>{formData.gender}</div>
              )}
            </div>

            {/* Blood Group */}
            <div>
              <label style={labelStyle}>Blood Group</label>
              {isEditing ? (
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  style={inputStyle(focusedInput === 'bloodGroup')}
                  onFocus={() => setFocusedInput('bloodGroup')}
                  onBlur={() => setFocusedInput(null)}
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              ) : (
                <div style={readOnlyStyle}>{formData.bloodGroup}</div>
              )}
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '20px', paddingBottom: '8px', borderBottom: '2px solid #f1f5f9' }}>
            📞 Contact Information
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '28px' }}>
            {/* Email ID */}
            <div>
              <label style={labelStyle}>Email ID</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  style={inputStyle(focusedInput === 'email')}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              ) : (
                <div style={readOnlyStyle}>{formData.email}</div>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label style={labelStyle}>Mobile Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="mobileNumber"
                  required
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  style={inputStyle(focusedInput === 'mobileNumber')}
                  onFocus={() => setFocusedInput('mobileNumber')}
                  onBlur={() => setFocusedInput(null)}
                />
              ) : (
                <div style={readOnlyStyle}>{formData.mobileNumber}</div>
              )}
            </div>

            {/* Address */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Residential Address</label>
              {isEditing ? (
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  style={{ ...inputStyle(focusedInput === 'address'), resize: 'vertical' }}
                  onFocus={() => setFocusedInput('address')}
                  onBlur={() => setFocusedInput(null)}
                />
              ) : (
                <div style={readOnlyStyle}>{formData.address}</div>
              )}
            </div>
          </div>

          {/* Section 3: Emergency Contact */}
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#dc2626', marginBottom: '20px', paddingBottom: '8px', borderBottom: '2px solid #fef2f2' }}>
            🚨 Emergency Contact
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '28px' }}>
            {/* Contact Person Name */}
            <div>
              <label style={labelStyle}>Contact Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  style={inputStyle(focusedInput === 'emergencyContactName')}
                  onFocus={() => setFocusedInput('emergencyContactName')}
                  onBlur={() => setFocusedInput(null)}
                />
              ) : (
                <div style={readOnlyStyle}>{formData.emergencyContactName}</div>
              )}
            </div>

            {/* Relationship */}
            <div>
              <label style={labelStyle}>Relationship</label>
              {isEditing ? (
                <input
                  type="text"
                  name="emergencyContactRelation"
                  value={formData.emergencyContactRelation}
                  onChange={handleChange}
                  style={inputStyle(focusedInput === 'emergencyContactRelation')}
                  onFocus={() => setFocusedInput('emergencyContactRelation')}
                  onBlur={() => setFocusedInput(null)}
                />
              ) : (
                <div style={readOnlyStyle}>{formData.emergencyContactRelation}</div>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label style={labelStyle}>Emergency Phone</label>
              {isEditing ? (
                <input
                  type="text"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  style={inputStyle(focusedInput === 'emergencyContactPhone')}
                  onFocus={() => setFocusedInput('emergencyContactPhone')}
                  onBlur={() => setFocusedInput(null)}
                />
              ) : (
                <div style={readOnlyStyle}>{formData.emergencyContactPhone}</div>
              )}
            </div>
          </div>

          {/* Form Actions (Only shown when editing) */}
          {isEditing && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '12px 28px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                }}
              >
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

// Reusable inline style object generators
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '700',
  color: '#475569',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
};

const readOnlyStyle: React.CSSProperties = {
  padding: '12px 16px',
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  fontSize: '14px',
  color: '#0f172a',
  fontWeight: '500',
  minHeight: '20px',
};

const inputStyle = (isFocused: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '12px 16px',
  borderRadius: '10px',
  border: isFocused ? '2px solid #0284c7' : '1px solid #cbd5e1',
  backgroundColor: '#ffffff',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
  color: '#0f172a',
});

export default PatientProfile;