-- Drop and recreate the users table with correct password column
DROP TABLE IF EXISTS ai_conversations CASCADE;
DROP TABLE IF EXISTS connected_devices CASCADE;
DROP TABLE IF EXISTS health_metrics CASCADE;
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with correct password column
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    patient_id VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medical records table
CREATE TABLE medical_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date_recorded DATE NOT NULL,
    doctor_name VARCHAR(100),
    hospital_name VARCHAR(100),
    record_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Family members table
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Health metrics table (for smartwatch data)
CREATE TABLE health_metrics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Connected devices table
CREATE TABLE connected_devices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    device_name VARCHAR(100) NOT NULL,
    device_type VARCHAR(50) NOT NULL,
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI conversations table
CREATE TABLE ai_conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message_type VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo user with correct password column
INSERT INTO users (username, email, password, full_name, patient_id) 
VALUES ('demo', 'demo@medikey.com', 'demo123', 'Demo User', 'MK-DEMO-001');

-- Insert sample health data for demo user
INSERT INTO health_metrics (user_id, metric_type, value, unit, recorded_at) VALUES 
(1, 'heart_rate', 72, 'bpm', NOW() - INTERVAL '1 hour'),
(1, 'blood_oxygen', 98, '%', NOW() - INTERVAL '1 hour'),
(1, 'steps', 8500, 'steps', NOW() - INTERVAL '1 hour'),
(1, 'sleep', 7.5, 'hours', NOW() - INTERVAL '8 hours');

INSERT INTO medical_records (user_id, title, description, date_recorded, doctor_name, hospital_name, record_type) VALUES 
(1, 'Annual Checkup', 'Regular health checkup - all vitals normal', '2024-01-15', 'Dr. Smith', 'City Hospital', 'checkup'),
(1, 'Blood Test Results', 'Complete blood count - results within normal range', '2024-02-10', 'Dr. Johnson', 'Lab Center', 'lab_result');

INSERT INTO family_members (user_id, name, relationship, date_of_birth, gender, blood_type) VALUES 
(1, 'Jane Demo', 'spouse', '1985-05-20', 'female', 'A+'),
(1, 'John Demo Jr', 'child', '2010-08-15', 'male', 'O+');

INSERT INTO connected_devices (user_id, device_name, device_type, last_sync) VALUES 
(1, 'Apple Watch Series 9', 'smartwatch', NOW());

-- Verify the setup
SELECT 'Database setup complete!' as status;
SELECT 'Users created:' as info, COUNT(*) as count FROM users;
SELECT 'Health metrics:' as info, COUNT(*) as count FROM health_metrics;
