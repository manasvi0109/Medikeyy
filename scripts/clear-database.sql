-- Safely clear all user data
DELETE FROM user_profiles;
DELETE FROM medical_records;
DELETE FROM family_members;
DELETE FROM health_metrics;
DELETE FROM connected_devices;
DELETE FROM ai_conversations;
DELETE FROM smartwatch_data;
DELETE FROM users;

-- Reset sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
