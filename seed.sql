-- Seed Initial Demo Data

INSERT INTO departments (id, department_name, description, icon) VALUES
(1, 'Cardiology', 'Heart and cardiovascular care with state-of-the-art diagnostics.', '❤️'),
(2, 'Neurology', 'Comprehensive brain, spinal cord, and nervous-system care.', '🧠'),
(3, 'Orthopedics', 'Advanced joint replacements, bone care, and sports injuries.', '🦴'),
(4, 'General Medicine', 'Primary care, diagnostic health evaluations, and wellness.', '🩺'),
(5, 'Pediatrics', 'Specialized, compassionate healthcare for children and infants.', '👶'),
(6, 'Gynecology & Obstetrics', 'Women’s comprehensive healthcare, prenatal, and maternity care.', '👩‍⚕️'),
(7, 'Dermatology', 'Expert skin, hair, and cosmetic medical procedures.', '✨'),
(8, 'Pulmonology', 'Specialized care for respiratory conditions and lung health.', '𫆁');

INSERT INTO doctors (id, doctor_id, name, specialization, department_id, qualification, experience, consultation_fee, available_days, available_time, photo_url) VALUES
(1, 'DOC-101', 'Dr. Sarah Jenkins', 'Interventional Cardiologist', 1, 'MD, FACC', '14 Years', 150.00, ARRAY['Monday', 'Wednesday', 'Friday'], '09:00 AM - 01:00 PM', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'),
(2, 'DOC-102', 'Dr. Robert Chen', 'Senior Neurologist', 2, 'MD, DM Neurology', '18 Years', 180.00, ARRAY['Tuesday', 'Thursday', 'Saturday'], '10:00 AM - 03:00 PM', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300'),
(3, 'DOC-103', 'Dr. Elena Rostova', 'Orthopedic Surgeon', 3, 'MS Ortho, FRCS', '11 Years', 130.00, ARRAY['Monday', 'Tuesday', 'Thursday'], '08:00 AM - 12:00 PM', 'https://images.unsplash.com/photo-1594824813566-78a0d4c8038d?auto=format&fit=crop&q=80&w=300'),
(4, 'DOC-104', 'Dr. Marcus Vance', 'General Physician', 4, 'MBBS, MD Internal Med', '9 Years', 90.00, ARRAY['Monday', 'Wednesday', 'Thursday', 'Friday'], '02:00 PM - 07:00 PM', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300');
