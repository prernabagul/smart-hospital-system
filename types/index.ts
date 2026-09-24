export interface Patient {
  id: number;
  patient_id: string;
  name: string;
  email: string;
  dob: string;
  gender: string;
  blood_group: string;
  mobile: string;
  address: string;
  emergency_contact: string;
}

export interface Doctor {
  id: number;
  doctor_id: string;
  name: string;
  specialization: string;
  department: string;
  qualification: string;
  experience: string;
  consultation_fee: number;
  available_days: string[];
  available_time: string;
  photo_url: string;
}

export interface Appointment {
  id: number;
  appointment_id: string;
  patient_id: string;
  doctor_name: string;
  department: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: 'In-Person' | 'Online Consultation';
  reason: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
}

export interface MedicalReport {
  id: string;
  report_type: string;
  date: string;
  file_name: string;
  analysis?: {
    summary: string;
    key_findings: Array<{ parameter: string; value: string; reference: string; status: string }>;
    explanation: string;
    suggested_questions: string[];
  };
}
