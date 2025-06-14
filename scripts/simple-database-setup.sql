-- Drop existing tables to start fresh
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS health_metrics CASCADE;
DROP TABLE IF EXISTS connected_devices CASCADE;
DROP TABLE IF EXISTS ai_conversations CASCADE;
DROP TABLE IF EXISTS smartwatch_data CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Simple users table for authentication
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

-- Insert a demo user for testing
INSERT INTO users (username, email, password, full_name, patient_id) 
VALUES ('demo', 'demo@medikey.com', 'demo123', 'Demo User', 'MK-DEMO-001');

-- Insert sample data for demo user
INSERT INTO health_metrics (user_id, metric_type, value, unit, recorded_at) VALUES 
(1, 'heart_rate', 72, 'bpm', NOW() - INTERVAL '1 hour'),
(1, 'blood_oxygen', 98, '%', NOW() - INTERVAL '1 hour'),
(1, 'steps', 8500, 'steps', NOW() - INTERVAL '1 hour'),
(1, 'sleep', 7.5, 'hours', NOW() - INTERVAL '8 hours');

INSERT INTO connected_devices (user_id, device_name, device_type, last_sync) VALUES 
(1, 'Apple Watch Series 9', 'smartwatch', NOW());

-- Check if setup was successful
SELECT 'Setup complete! Users:' as status, COUNT(*) as count FROM users;
