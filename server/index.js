const express = require('express');
const cors = require('cors');
const jwt = require('jwt-simple');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'hospital_super_secret_jwt_key_2026';

// Mock DB Cache
const PATIENTS_DB = [];
const APPOINTMENTS_DB = [
  {
    id: 1,
    appointment_id: 'APT-2026-0001',
    patient_id: 'PAT-2026-0001',
    doctor_name: 'Dr. Sarah Jenkins',
    department: 'Cardiology',
    appointment_date: '2026-10-05',
    appointment_time: '10:00 AM',
    appointment_type: 'In-Person',
    reason: 'Routine Heart Checkup',
    status: 'Confirmed'
  }
];

// Helper: JWT Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token required' });

  try {
    const decoded = jwt.decode(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, dob, gender, blood_group, mobile, address, emergency_contact } = req.body;
  
  const existingUser = PATIENTS_DB.find(p => p.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'Patient email already registered.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const patientId = `PAT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const newPatient = {
    id: PATIENTS_DB.length + 1,
    patient_id: patientId,
    name,
    email,
    password: hashedPassword,
    dob,
    gender,
    blood_group,
    mobile,
    address,
    emergency_contact
  };

  PATIENTS_DB.push(newPatient);

  const token = jwt.encode({ id: newPatient.id, patient_id: patientId, email }, JWT_SECRET);
  
  const { password: _, ...patientData } = newPatient;
  res.status(201).json({ token, patient: patientData });
});

app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body; // email or mobile
  
  const patient = PATIENTS_DB.find(p => p.email === identifier || p.mobile === identifier);
  if (!patient) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const validPassword = await bcrypt.compare(password, patient.password);
  if (!validPassword) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.encode({ id: patient.id, patient_id: patient.patient_id, email: patient.email }, JWT_SECRET);
  const { password: _, ...patientData } = patient;
  
  res.json({ token, patient: patientData });
});

// Appointments API
app.get('/api/appointments', authenticateToken, (req, res) => {
  const userAppointments = APPOINTMENTS_DB.filter(a => a.patient_id === req.user.patient_id);
  res.json(userAppointments);
});

app.post('/api/appointments', authenticateToken, (req, res) => {
  const appointmentData = req.body;
  const newApt = {
    id: APPOINTMENTS_DB.length + 1,
    appointment_id: `APT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    patient_id: req.user.patient_id,
    ...appointmentData,
    status: 'Confirmed',
    created_at: new Date()
  };
  APPOINTMENTS_DB.push(newApt);
  res.status(201).json(newApt);
});

// AI Engine Endpoints
app.post('/api/ai/recommend-doctor', (req, res) => {
  const { symptoms } = req.body;
  const symLower = (symptoms || '').toLowerCase();

  let department = 'General Medicine';
  let suggestedDoctor = 'Dr. Marcus Vance';

  if (symLower.includes('chest') || symLower.includes('heart') || symLower.includes('breath')) {
    department = 'Cardiology';
    suggestedDoctor = 'Dr. Sarah Jenkins';
  } else if (symLower.includes('headache') || symLower.includes('dizzy') || symLower.includes('seizure')) {
    department = 'Neurology';
    suggestedDoctor = 'Dr. Robert Chen';
  } else if (symLower.includes('bone') || symLower.includes('fracture') || symLower.includes('joint')) {
    department = 'Orthopedics';
    suggestedDoctor = 'Dr. Elena Rostova';
  }

  res.json({
    recommended_department: department,
    suggested_doctor: suggestedDoctor,
    confidence_score: 0.94,
    disclaimer: 'This recommendation is AI-generated for guidance only and does not constitute a formal diagnosis.'
  });
});

app.post('/api/ai/analyze-report', (req, res) => {
  const { report_type } = req.body;
  
  const mockAnalysis = {
    summary: 'The uploaded report indicates stable general parameters with slight elevation in fasting glucose levels.',
    key_findings: [
      { parameter: 'Fasting Blood Sugar', value: '118 mg/dL', reference: '70-99 mg/dL', status: 'High' },
      { parameter: 'HbA1c', value: '5.8%', reference: '4.0-5.6%', status: 'Slightly Elevated' },
      { parameter: 'Total Cholesterol', value: '185 mg/dL', reference: '< 200 mg/dL', status: 'Normal' }
    ],
    explanation: 'Your blood sugar levels are slightly above the standard fasting reference range. This suggests pre-diabetic tendencies that can be managed with diet and physical activity.',
    suggested_questions: [
      'Should I undergo an Oral Glucose Tolerance Test (OGTT)?',
      'Are dietary modifications sufficient, or do I need medication?'
    ],
    disclaimer: 'AI report analysis is for educational understanding only. Always consult your attending physician.'
  };

  res.json(mockAnalysis);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Smart Hospital Backend running on port ${PORT}`));
