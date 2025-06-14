-- Drop all tables if they exist (in correct order to handle foreign keys)
DROP TABLE IF EXISTS ai_conversations CASCADE;
DROP TABLE IF EXISTS smartwatch_data CASCADE;
DROP TABLE IF EXISTS connected_devices CASCADE;
DROP TABLE IF EXISTS health_metrics CASCADE;
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with password column
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    patient_id VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_profiles table for additional user information
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender VARCHAR(20),
    blood_type VARCHAR(10),
    height_cm INTEGER,
    weight_kg DECIMAL(5,2),
    allergies TEXT,
    chronic_conditions TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create medical_records table
CREATE TABLE medical_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date_recorded DATE NOT NULL,
    doctor_name VARCHAR(100),
    hospital_name VARCHAR(100),
    record_type VARCHAR(50),
    file_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create family_members table
CREATE TABLE family_members (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    blood_type VARCHAR(10),
    allergies TEXT,
    conditions TEXT,
    emergency_contact BOOLEAN DEFAULT FALSE,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create health_metrics table
CREATE TABLE health_metrics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    recorded_at TIMESTAMP NOT NULL,
    device_source VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create connected_devices table
CREATE TABLE connected_devices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    device_name VARCHAR(100) NOT NULL,
    device_type VARCHAR(50) NOT NULL,
    device_id VARCHAR(100),
    last_sync TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create smartwatch_data table
CREATE TABLE smartwatch_data (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    heart_rate INTEGER,
    blood_oxygen INTEGER,
    steps INTEGER,
    calories_burned INTEGER,
    sleep_hours DECIMAL(4,2),
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ai_conversations table
CREATE TABLE ai_conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message_type VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo user
INSERT INTO users (username, email, password, full_name, patient_id) 
VALUES ('demo', 'demo@medikey.com', 'demo123', 'Demo User', 'MK-DEMO-2024');

-- Insert demo user profile
INSERT INTO user_profiles (user_id, date_of_birth, gender, blood_type, height_cm, weight_kg, allergies, chronic_conditions, emergency_contact_name, emergency_contact_phone)
VALUES (1, '1990-01-01', 'Other', 'O+', 175, 70.5, 'None known', 'None', 'Emergency Contact', '+1-555-0123');

-- Insert sample medical records for demo user
INSERT INTO medical_records (user_id, title, description, date_recorded, doctor_name, hospital_name, record_type) VALUES
(1, 'Annual Physical Exam', 'Routine annual physical examination. All vitals normal.', '2024-01-15', 'Dr. Smith', 'General Hospital', 'Checkup'),
(1, 'Blood Test Results', 'Complete blood count and metabolic panel. Results within normal range.', '2024-02-20', 'Dr. Johnson', 'Lab Center', 'Lab Results'),
(1, 'Vaccination Record', 'Annual flu vaccination administered.', '2024-03-10', 'Nurse Williams', 'Health Clinic', 'Vaccination');

-- Insert sample family members for demo user
INSERT INTO family_members (user_id, name, relationship, date_of_birth, gender, blood_type, allergies, conditions, emergency_contact, phone) VALUES
(1, 'Jane Doe', 'Spouse', '1992-05-15', 'Female', 'A+', 'Peanuts', 'None', true, '+1-555-0124'),
(1, 'John Doe Jr.', 'Child', '2015-08-20', 'Male', 'O+', 'None known', 'Asthma', false, NULL);

-- Insert sample health metrics for demo user
INSERT INTO health_metrics (user_id, metric_type, value, unit, recorded_at, device_source) VALUES
(1, 'heart_rate', 72, 'bpm', '2024-12-06 08:00:00', 'Apple Watch'),
(1, 'blood_pressure_systolic', 120, 'mmHg', '2024-12-06 08:00:00', 'Home Monitor'),
(1, 'blood_pressure_diastolic', 80, 'mmHg', '2024-12-06 08:00:00', 'Home Monitor'),
(1, 'weight', 70.5, 'kg', '2024-12-06 07:30:00', 'Smart Scale'),
(1, 'steps', 8500, 'steps', '2024-12-05 23:59:59', 'Apple Watch');

-- Insert sample connected devices for demo user
INSERT INTO connected_devices (user_id, device_name, device_type, device_id, last_sync, is_active) VALUES
(1, 'Apple Watch Series 9', 'smartwatch', 'AW-123456', '2024-12-06 08:00:00', true),
(1, 'Withings Scale', 'scale', 'WS-789012', '2024-12-06 07:30:00', true),
(1, 'Omron Blood Pressure Monitor', 'blood_pressure', 'OM-345678', '2024-12-06 08:00:00', true);

-- Insert sample smartwatch data for demo user
INSERT INTO smartwatch_data (user_id, heart_rate, blood_oxygen, steps, calories_burned, sleep_hours, recorded_at) VALUES
(1, 72, 98, 8500, 2100, 7.5, '2024-12-05 23:59:59'),
(1, 68, 99, 9200, 2250, 8.0, '2024-12-04 23:59:59'),
(1, 75, 97, 7800, 1950, 6.5, '2024-12-03 23:59:59');

-- Verify the setup
SELECT 'Database setup completed successfully!' as status;
SELECT 'Users table:' as info, count(*) as count FROM users;
SELECT 'Medical records:' as info, count(*) as count FROM medical_records;
SELECT 'Family members:' as info, count(*) as count FROM family_members;
SELECT 'Health metrics:' as info, count(*) as count FROM health_metrics;
