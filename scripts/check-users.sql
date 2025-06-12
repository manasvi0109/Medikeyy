-- Check existing users in the database
SELECT id, username, email, patient_id, created_at FROM users ORDER BY created_at DESC;
