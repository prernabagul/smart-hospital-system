import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 1. Context Import
import { AuthProvider } from './context/AuthContext'; // Make sure useAuth is exported from AuthContext

// 2. Component Imports
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { PatientProfile } from './pages/PatientProfile';
import { AiHealthAssistant } from './pages/AiHealthAssistant';
import { AIChatbot } from './pages/AIChatbot';
import { AppointmentFeedback } from './pages/AppointmentFeedback';
import { DigitalPrescriptions } from './pages/DigitalPrescriptions';
import DoctorSearch from './pages/DoctorSearch';
import { DoctorRecommendation } from './pages/Doctors/DoctorRecommendation';
import { EmergencyHelp } from './pages/EmergencyHelp';
import { HospitalService } from './pages/HospitalService';
import * as MedicalRecords from './pages/MedicalRecords';
import { PatientRecordsSearch } from './pages/PatientRecordsSearch';
import { Prescription } from './pages/Prescription';
import { ReportAnalysis } from './pages/ReportAnalysis';

// Updated ProtectedRoute to check for authentication status
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  // Check localStorage or AuthContext for logged-in user session
  const isAuthenticated = !!localStorage.getItem('user') || !!localStorage.getItem('token'); 
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/patient-profile" element={<ProtectedRoute><PatientProfile /></ProtectedRoute>} />
          
          {/* Mapped both /chatbot and /ai-chatbot */}
          <Route path="/chatbot" element={<ProtectedRoute><AIChatbot /></ProtectedRoute>} />
          <Route path="/ai-chatbot" element={<ProtectedRoute><AIChatbot /></ProtectedRoute>} />
          <Route path="/ai-assistant" element={<ProtectedRoute><AiHealthAssistant /></ProtectedRoute>} />
          
          <Route path="/report-analysis" element={<ProtectedRoute><ReportAnalysis /></ProtectedRoute>} />
          
          {/* Mapped both /doctor-search and /doctors */}
          <Route path="/doctor-search" element={<ProtectedRoute><DoctorSearch /></ProtectedRoute>} />
          <Route path="/doctors" element={<ProtectedRoute><DoctorSearch /></ProtectedRoute>} />
          
          <Route path="/doctor-recommendations" element={<ProtectedRoute><DoctorRecommendation /></ProtectedRoute>} />
          <Route path="/hospital-services" element={<ProtectedRoute><HospitalService /></ProtectedRoute>} />
          <Route path="/medical-records" element={<ProtectedRoute><MedicalRecords.MedicalRecords /></ProtectedRoute>} />
          <Route path="/patient-records-search" element={<ProtectedRoute><PatientRecordsSearch /></ProtectedRoute>} />
          <Route path="/prescriptions" element={<ProtectedRoute><Prescription /></ProtectedRoute>} />
          <Route path="/digital-prescriptions" element={<ProtectedRoute><DigitalPrescriptions /></ProtectedRoute>} />
          <Route path="/appointment-feedback" element={<ProtectedRoute><AppointmentFeedback /></ProtectedRoute>} />
          <Route path="/emergency" element={<ProtectedRoute><EmergencyHelp /></ProtectedRoute>} />

          {/* Default and fallback routes now point to /login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;