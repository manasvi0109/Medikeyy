-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  patient_id VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create health metrics table
CREATE TABLE IF NOT EXISTS health_metrics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  metric_type VARCHAR(50) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Create medical records table
CREATE TABLE IF NOT EXISTS medical_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  record_type VARCHAR(100),
  record_date DATE NOT NULL,
  file_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create family members table
CREATE TABLE IF NOT EXISTS family_members (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  relationship VARCHAR(100),
  date_of_birth DATE,
  blood_type VARCHAR(10),
  allergies TEXT,
  emergency_contact BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create connected devices table
CREATE TABLE IF NOT EXISTS connected_devices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  device_name VARCHAR(255) NOT NULL,
  device_type VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo user if not exists
INSERT INTO users (id, username, email, password, full_name, patient_id)
VALUES (1, 'demo', 'demo@medikey.com', 'demo123', 'Demo User', 'MK-DEMO-2024')
ON CONFLICT (id) DO NOTHING;

-- Insert sample health metrics for demo user
INSERT INTO health_metrics (user_id, metric_type, value, unit, recorded_at)
VALUES 
  (1, 'heart_rate', 72, 'bpm', NOW() - INTERVAL '1 hour'),
  (1, 'blood_pressure', 120, 'mmHg', NOW() - INTERVAL '1 hour'),
  (1, 'blood_oxygen', 98, '%', NOW() - INTERVAL '1 hour'),
  (1, 'temperature', 36.6, '°C', NOW() - INTERVAL '1 hour'),
  (1, 'steps', 8547, 'steps', NOW() - INTERVAL '1 hour'),
  (1, 'sleep', 7.5, 'hours', NOW() - INTERVAL '1 day'),
  (1, 'weight', 70.5, 'kg', NOW() - INTERVAL '1 day'),
  (1, 'blood_glucose', 5.4, 'mmol/L', NOW() - INTERVAL '1 day'),
  (1, 'heart_rate', 75, 'bpm', NOW() - INTERVAL '2 hours'),
  (1, 'heart_rate', 68, 'bpm', NOW() - INTERVAL '3 hours'),
  (1, 'heart_rate', 72, 'bpm', NOW() - INTERVAL '4 hours'),
  (1, 'heart_rate', 80, 'bpm', NOW() - INTERVAL '5 hours'),
  (1, 'heart_rate', 76, 'bpm', NOW() - INTERVAL '6 hours'),
  (1, 'heart_rate', 70, 'bpm', NOW() - INTERVAL '7 hours'),
  (1, 'heart_rate', 65, 'bpm', NOW() - INTERVAL '8 hours'),
  (1, 'blood_oxygen', 97, '%', NOW() - INTERVAL '2 hours'),
  (1, 'blood_oxygen', 98, '%', NOW() - INTERVAL '3 hours'),
  (1, 'blood_oxygen', 99, '%', NOW() - INTERVAL '4 hours'),
  (1, 'blood_oxygen', 98, '%', NOW() - INTERVAL '5 hours'),
  (1, 'blood_oxygen', 97, '%', NOW() - INTERVAL '6 hours'),
  (1, 'steps', 2000, 'steps', NOW() - INTERVAL '2 hours'),
  (1, 'steps', 4000, 'steps', NOW() - INTERVAL '3 hours'),
  (1, 'steps', 6000, 'steps', NOW() - INTERVAL '4 hours'),
  (1, 'steps', 7500, 'steps', NOW() - INTERVAL '5 hours');

-- Insert sample medical records for demo user
INSERT INTO medical_records (user_id, title, description, record_type, record_date, file_url)
VALUES 
  (1, 'Annual Physical Examination', 'Complete health checkup with Dr. Johnson', 'Examination', '2023-06-15', '/records/physical-exam-2023.pdf'),
  (1, 'Blood Test Results', 'Complete blood count and metabolic panel', 'Lab Results', '2023-06-15', '/records/blood-test-2023.pdf'),
  (1, 'X-Ray Right Ankle', 'Following sports injury, no fractures detected', 'Imaging', '2023-05-22', '/records/ankle-xray-2023.pdf'),
  (1, 'COVID-19 Vaccination', 'Second dose of Pfizer vaccine', 'Vaccination', '2023-02-10', '/records/covid-vaccine-2023.pdf'),
  (1, 'Dental Cleaning', 'Regular 6-month dental checkup and cleaning', 'Dental', '2023-04-05', '/records/dental-2023.pdf');

-- Insert sample family members for demo user
INSERT INTO family_members (user_id, name, relationship, date_of_birth, blood_type, allergies)
VALUES 
  (1, 'Sarah Johnson', 'Spouse', '1989-05-12', 'A+', 'Peanuts'),
  (1, 'Michael Johnson', 'Son', '2016-03-22', 'O+', NULL);

-- Insert sample connected devices for demo user
INSERT INTO connected_devices (user_id, device_name, device_type, is_active, last_sync)
VALUES 
  (1, 'Apple Watch Series 8', 'Smartwatch', TRUE, NOW() - INTERVAL '30 minutes'),
  (1, 'Withings Blood Pressure Monitor', 'Blood Pressure', TRUE, NOW() - INTERVAL '2 days'),
  (1, 'Dexcom G6', 'Glucose Monitor', TRUE, NOW() - INTERVAL '1 hour');
