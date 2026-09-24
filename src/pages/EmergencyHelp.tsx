import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface EmergencyRequest {
  id: string;
  patientName: string;
  patientId: string;
  contactNumber: string;
  emergencyType: string;
  currentLocation: string;
  description: string;
  status: 'Request Sent' | 'Received' | 'In Progress' | 'Resolved';
  timestamp: string;
}

export const EmergencyHelp: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Desktop Call Modal State
  const [callModal, setCallModal] = useState<{
    isOpen: boolean;
    title: string;
    phoneNumber: string;
    description: string;
  }>({
    isOpen: false,
    title: '',
    phoneNumber: '',
    description: '',
  });

  const [copied, setCopied] = useState(false);

  // Form State for Emergency Request
  const [patientName, setPatientName] = useState(user?.name || user?.fullName || 'Prerna Bagul');
  const [patientIdInput, setPatientIdInput] = useState(user?.patientId || 'PAT-2026-0001');
  const [contactNumber, setContactNumber] = useState(user?.phone || '+1 (555) 019-2834');
  const [emergencyType, setEmergencyType] = useState('Chest Pain / Cardiac Event');
  const [currentLocation, setCurrentLocation] = useState('Building 4, Sector 15, Metro City');
  const [description, setDescription] = useState('');

  // Request counter & submitted requests list
  const [requestCounter, setRequestCounter] = useState(1);
  const [submittedRequests, setSubmittedRequests] = useState<EmergencyRequest[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Handle Emergency Request Submission
  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedCounter = String(requestCounter).padStart(4, '0');
    const generatedId = `EMG-2026-${formattedCounter}`;

    const newRequest: EmergencyRequest = {
      id: generatedId,
      patientName,
      patientId: patientIdInput,
      contactNumber,
      emergencyType,
      currentLocation,
      description: description || 'N/A',
      status: 'Request Sent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setSubmittedRequests([newRequest, ...submittedRequests]);
    setRequestCounter((prev) => prev + 1);
    setShowSuccessMessage(true);
    setDescription('');

    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  // Helper to change status in demo mode
  const handleUpdateStatus = (id: string, nextStatus: EmergencyRequest['status']) => {
    setSubmittedRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: nextStatus } : req))
    );
  };

  // Triggered when user clicks "Call Emergency"
  const handleInitiateCall = (title: string, phoneNumber: string, desc: string) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      setCallModal({
        isOpen: true,
        title,
        phoneNumber,
        description: desc,
      });
      setCopied(false);
    }
  };

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: EmergencyRequest['status']) => {
    switch (status) {
      case 'Request Sent':
        return { bg: '#fef3c7', color: '#d97706' };
      case 'Received':
        return { bg: '#e0f2fe', color: '#0284c7' };
      case 'In Progress':
        return { bg: '#fed7aa', color: '#ea580c' };
      case 'Resolved':
        return { bg: '#d1fae5', color: '#059669' };
    }
  };

  return (
    <div style={{ backgroundColor: '#fef2f2', minHeight: '100vh', padding: '32px 16px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* DEMO SYSTEM DISCLAIMER BANNER */}
        <div style={{ backgroundColor: '#fef2f2', border: '2px dashed #ef4444', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', textAlign: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#dc2626' }}>
            ⚠️ DEMONSTRATION SYSTEM NOTICE: This application is a prototype / demonstration system and DOES NOT replace real emergency services. In a true life-threatening medical emergency, call 102/108 or your local national emergency hotline immediately.
          </span>
        </div>

        {/* Navigation & Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ffffff',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              color: '#991b1b',
            }}
          >
            ← Back to Dashboard
          </button>
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#dc2626', letterSpacing: '0.05em' }}>
            🚨 24/7 CRITICAL CARE RESPONDER
          </span>
        </div>

        {/* Emergency Call Quick Buttons */}
        <div style={{ backgroundColor: '#ffffff', border: '2px solid #ef4444', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#991b1b', margin: '0 0 6px 0' }}>
            Emergency Assistance Center
          </h1>
          <p style={{ color: '#7f1d1d', margin: '0 0 20px 0', fontSize: '14px' }}>
            Immediate dispatch response team & emergency services.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <button
              onClick={() => handleInitiateCall('Central Medical SOS', '102', 'Central Emergency Line')}
              style={{ padding: '14px 18px', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              📞 Call Emergency (102)
            </button>
            <button
              onClick={() => handleInitiateCall('Ambulance Hotline', '108', 'Free Emergency Medical & Ambulance Service')}
              style={{ padding: '14px 18px', backgroundColor: '#1e293b', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              🚑 Dispatch Ambulance (108)
            </button>
          </div>
        </div>

        {/* SECTION: SUBMIT EMERGENCY REQUEST FORM */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #fecaca', padding: '24px', marginBottom: '28px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '22px' }}>📝</span>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Submit Emergency Request
            </h2>
          </div>

          {showSuccessMessage && (
            <div style={{ backgroundColor: '#d1fae5', border: '1px solid #6ee7b7', color: '#065f46', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', marginBottom: '16px' }}>
              ✓ Emergency request submitted successfully! Generated Tracking ID: {submittedRequests[0]?.id}
            </div>
          )}

          <form onSubmit={handleSubmitRequest} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Patient Name *</label>
              <input type="text" required value={patientName} onChange={(e) => setPatientName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Patient ID *</label>
              <input type="text" required value={patientIdInput} onChange={(e) => setPatientIdInput(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Contact Number *</label>
              <input type="tel" required value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Emergency Type *</label>
              <select value={emergencyType} onChange={(e) => setEmergencyType(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                <option value="Chest Pain / Cardiac Event">🫀 Chest Pain / Cardiac Event</option>
                <option value="Breathing Difficulty">🫁 Breathing Difficulty</option>
                <option value="Heavy Bleeding / Severe Wounds">🩸 Heavy Bleeding / Severe Wounds</option>
                <option value="Unconsciousness / Fainting">🧠 Unconsciousness / Fainting</option>
                <option value="Severe Physical Trauma / Fracture">🦴 Severe Physical Trauma / Fracture</option>
                <option value="Other Medical Emergency">❓ Other Medical Emergency</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Current Location *</label>
              <input type="text" required value={currentLocation} onChange={(e) => setCurrentLocation(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} placeholder="Provide exact address or GPS location..." />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Emergency Description</label>
              <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe symptoms, patient condition, or special notes..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>

            <button type="submit" style={{ gridColumn: '1 / -1', padding: '14px', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 6px rgba(220, 38, 38, 0.2)' }}>
              🚀 Send Emergency Request
            </button>
          </form>
        </div>

        {/* ACTIVE REQUEST TRACKER (STATUS DISPLAY) */}
        {submittedRequests.length > 0 && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #cbd5e1', padding: '24px', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0' }}>
              📡 Live Emergency Request Tracker
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {submittedRequests.map((req) => {
                const badge = getStatusBadge(req.status);
                return (
                  <div key={req.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Request ID: {req.id}</span>
                        <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '12px' }}>🕒 {req.timestamp}</span>
                      </div>
                      <span style={{ backgroundColor: badge.bg, color: badge.color, padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: '800' }}>
                        ● {req.status}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '12px', color: '#334155', marginBottom: '12px' }}>
                      <div><strong>Patient:</strong> {req.patientName} ({req.patientId})</div>
                      <div><strong>Contact:</strong> {req.contactNumber}</div>
                      <div><strong>Type:</strong> {req.emergencyType}</div>
                      <div><strong>Location:</strong> {req.currentLocation}</div>
                    </div>

                    {/* Demo Status Switch Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Simulation Controls:</span>
                      {(['Request Sent', 'Received', 'In Progress', 'Resolved'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleUpdateStatus(req.id, st)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            backgroundColor: req.status === st ? '#0f172a' : '#ffffff',
                            color: req.status === st ? '#ffffff' : '#475569',
                          }}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DEMO HOSPITAL INFORMATION GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          
          {/* Emergency Department & Address / Location */}
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '20px' }}>🏥</span>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Emergency Department Details
              </h2>
            </div>
            
            <p style={{ margin: '0 0 6px 0', fontWeight: '800', fontSize: '14px', color: '#1e293b' }}>
              Smart Health Central Hospital - Emergency Department
            </p>
            <p style={{ margin: '0 0 2px 0', fontSize: '12px', fontWeight: '700', color: '#64748b' }}>
              Hospital Address:
            </p>
            <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#475569' }}>
              Building 4, Health Science Park, Medical Center Drive, Metro City, 10001
            </p>
            
            <p style={{ margin: '0 0 2px 0', fontSize: '12px', fontWeight: '700', color: '#64748b' }}>
              Hospital Location:
            </p>
            <p style={{ margin: '0 0 18px 0', fontSize: '13px', color: '#475569' }}>
              Metro Central Wing, Main Level ER entrance via Gate 2
            </p>

            <button
              onClick={() => window.open('https://maps.google.com', '_blank')}
              style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
            >
              🗺️ Start GPS Navigation to Hospital
            </button>
          </div>

          {/* Ambulance Info & Hospital Emergency Contact */}
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '20px', color: '#dc2626' }}>📞</span>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Hospital Emergency Contacts
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: '500' }}>Ambulance Information Hotline:</span>
                <button onClick={() => handleInitiateCall('Ambulance Hotline', '108', 'Emergency Ambulance Service')} style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>
                  108
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: '500' }}>Central Medical SOS:</span>
                <button onClick={() => handleInitiateCall('Central Medical SOS', '102', 'Central Medical Line')} style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>
                  102
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: '500' }}>Emergency Room Desk:</span>
                <button onClick={() => handleInitiateCall('Emergency Room Desk', '+1800555EMERGENCY', 'ER Direct Line')} style={{ background: 'none', border: 'none', color: '#0f172a', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}>
                  +1 (800) 555-EMERGENCY
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontWeight: '500' }}>Poison Control Helpline:</span>
                <button onClick={() => handleInitiateCall('Poison Control Helpline', '+18002221222', 'Poison Helpline')} style={{ background: 'none', border: 'none', color: '#0f172a', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}>
                  +1 (800) 222-1222
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* EMERGENCY INSTRUCTIONS CARD */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <span style={{ fontSize: '20px' }}>📋</span>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Emergency Instructions & First Aid
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #ef4444' }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#dc2626', marginBottom: '8px' }}>🫀 Chest Pain / Cardiac Event</div>
              <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                Sit the patient comfortably in an upright position. Keep them calm, loosen tight clothing around the neck, and call emergency immediately.
              </p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#2563eb', marginBottom: '8px' }}>🫁 Breathing Difficulty</div>
              <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                Ensure adequate air ventilation. Sit the person upright. Do not give liquid/food. Prepare inhalers if available.
              </p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#d97706', marginBottom: '8px' }}>🩸 Heavy Bleeding / Wounds</div>
              <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                Apply firm, direct pressure with a sterile cloth or clean towel over the bleeding area. Elevate the wounded limb if possible.
              </p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#059669', marginBottom: '8px' }}>🧠 Unconsciousness / Fainting</div>
              <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                Lay the person flat on their back and elevate their legs slightly. Check for clear breathing pathways. Do not leave the person unattended.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* IN-APP CALL MODAL */}
      {callModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 10000 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '28px', maxWidth: '420px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚨</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>{callModal.title}</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>{callModal.description}</p>

            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#991b1b', fontWeight: '600', marginBottom: '4px' }}>Emergency Contact Number</div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#dc2626' }}>{callModal.phoneNumber}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => handleCopyNumber(callModal.phoneNumber)} style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                {copied ? '✓ Number Copied!' : '📋 Copy Emergency Number'}
              </button>
              <button onClick={() => { window.location.href = `tel:${callModal.phoneNumber}`; }} style={{ width: '100%', padding: '12px', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                📞 Launch Phone Call
              </button>
              <button onClick={() => setCallModal({ isOpen: false, title: '', phoneNumber: '', description: '' })} style={{ width: '100%', padding: '10px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmergencyHelp;