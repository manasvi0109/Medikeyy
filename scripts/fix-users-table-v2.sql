-- Check if the users table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        -- Check if hashed_password column exists
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'users' 
                      AND column_name = 'hashed_password') THEN
            -- Add hashed_password column
            ALTER TABLE users ADD COLUMN hashed_password TEXT;
            
            -- If password column exists, copy data from password to hashed_password
            IF EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'users' 
                      AND column_name = 'password') THEN
                UPDATE users SET hashed_password = password;
            END IF;
        END IF;
        
        -- Ensure demo user exists
        IF NOT EXISTS (SELECT FROM users WHERE username = 'demo') THEN
            INSERT INTO users (username, email, hashed_password, full_name, patient_id)
            VALUES ('demo', 'demo@example.com', 'demo123', 'Demo User', 'MK-DEMO-USER');
        ELSE
            -- Update demo user's password if it exists
            UPDATE users SET hashed_password = 'demo123' WHERE username = 'demo';
        END IF;
    ELSE
        -- Create users table if it doesn't exist
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            full_name VARCHAR(100) NOT NULL,
            patient_id VARCHAR(50) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Insert demo user
        INSERT INTO users (username, email, hashed_password, full_name, patient_id)
        VALUES ('demo', 'demo@example.com', 'demo123', 'Demo User', 'MK-DEMO-USER');
    END IF;
END $$;

-- Verify the users table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- Verify demo user exists
SELECT id, username, email, full_name, patient_id FROM users WHERE username = 'demo';
