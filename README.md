# MediKey Health Dashboard

A comprehensive health management platform with AI-powered assistance, real-time smartwatch integration, and secure medical record storage.

## Features

- 🏥 **Medical Records Management** - Upload, organize, and access medical documents
- 👨‍👩‍👧‍👦 **Family Vault** - Manage family members' health information
- 📅 **Appointment Scheduling** - Schedule and track medical appointments
- 🤖 **AI Health Assistant** - Grok AI-powered health guidance and Q&A
- ⌚ **SmartWatch Integration** - Real-time health metrics from wearable devices
- 🚨 **Emergency Access** - QR code for emergency medical information
- 📊 **Health Analytics** - Comprehensive health data visualization
- 🔐 **Secure Authentication** - Patient ID-based secure access

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Neon PostgreSQL
- **AI**: Grok AI (via AI SDK)
- **Charts**: Recharts
- **UI Components**: shadcn/ui
- **Authentication**: Custom implementation with bcrypt

## Database Schema

### Core Tables

#### `users`
Stores user authentication and basic information.
\`\`\`sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  patient_id VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### `user_profiles`
Extended user profile information.
\`\`\`sql
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  patient_id VARCHAR(50) UNIQUE NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20),
  blood_type VARCHAR(10),
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  allergies TEXT,
  medical_conditions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### `medical_records`
Medical documents and records.
\`\`\`sql
CREATE TABLE medical_records (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  patient_id VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  record_type VARCHAR(50) NOT NULL,
  record_date DATE NOT NULL,
  provider VARCHAR(255) NOT NULL,
  description TEXT,
  file_url VARCHAR(500),
  file_name VARCHAR(255),
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### `family_members`
Family member health information.
\`\`\`sql
CREATE TABLE family_members (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  patient_id VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  relationship VARCHAR(100) NOT NULL,
  dob DATE,
  gender VARCHAR(20),
  blood_type VARCHAR(10),
  allergies TEXT,
  conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### `health_metrics`
Health measurements and vital signs.
\`\`\`sql
CREATE TABLE health_metrics (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  patient_id VARCHAR(50),
  metric_type VARCHAR(50) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  device_type VARCHAR(100),
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### `smartwatch_data`
Real-time data from connected wearable devices.
\`\`\`sql
CREATE TABLE smartwatch_data (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  patient_id VARCHAR(50) NOT NULL,
  device_name VARCHAR(100),
  metric_type VARCHAR(50) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  recorded_at TIMESTAMP NOT NULL,
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### `ai_conversations`
AI assistant chat history.
\`\`\`sql
CREATE TABLE ai_conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  patient_id VARCHAR(50) NOT NULL,
  message_type VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### `connected_devices`
Connected health monitoring devices.
\`\`\`sql
CREATE TABLE connected_devices (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  patient_id VARCHAR(50),
  device_name VARCHAR(255) NOT NULL,
  device_type VARCHAR(100) NOT NULL,
  device_id VARCHAR(255),
  connection_key VARCHAR(255),
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

## Database Access

### Environment Variables

Set up the following environment variables in your `.env.local` file:

\`\`\`env
# Neon Database
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
POSTGRES_URL="postgresql://username:password@host/database?sslmode=require"
POSTGRES_PRISMA_URL="postgresql://username:password@host/database?sslmode=require&pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NON_POOLING="postgresql://username:password@host/database?sslmode=require"

# AI Integration
XAI_API_KEY="your_grok_api_key_here"
\`\`\`

### Database Connection

The application uses the `@neondatabase/serverless` package for database connections:

\`\`\`typescript
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Execute queries
const result = await sql`SELECT * FROM users WHERE patient_id = ${patientId}`
\`\`\`

### Data Storage Patterns

#### Patient ID System
- Each user gets a unique patient ID: `MK-XXXX-XXXXXXXX-XXXX`
- Format: `MK-{username_hash}-{timestamp}-{random}`
- Used as primary identifier across all health data

#### Health Metrics Storage
- Real-time data from smartwatches stored in `smartwatch_data`
- Aggregated metrics in `health_metrics` for analytics
- Supports multiple device types and metric types

#### Medical Records
- File metadata stored in database
- Actual files can be stored in cloud storage (URLs in `file_url`)
- Supports various document types (PDF, images, etc.)

#### AI Conversations
- Complete chat history preserved
- Enables context-aware responses
- Privacy-focused with patient-specific isolation

## Getting Started

### Prerequisites

- Node.js 18+ 
- Neon PostgreSQL database
- Grok AI API key

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd medikey-dashboard
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
# Edit .env.local with your database and API credentials
\`\`\`

4. Run database migrations:
\`\`\`bash
# The schema will be automatically created when you first run the app
npm run dev
\`\`\`

5. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

1. **Create Neon Database**:
   - Sign up at [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string

2. **Initialize Schema**:
   - The application will automatically create tables on first run
   - Or manually execute the SQL schema from the codebase

3. **Verify Connection**:
   - Check the console for successful database connection
   - Test user registration to ensure tables are working

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User authentication

### Health Data
- `GET /api/health-metrics` - Retrieve health metrics
- `POST /api/health-metrics` - Store new health data
- `GET /api/smartwatch/sync` - Sync smartwatch data

### AI Assistant
- `POST /api/ai/chat` - Send message to AI assistant
- `GET /api/ai/history` - Retrieve chat history

### Medical Records
- `GET /api/records` - List medical records
- `POST /api/records` - Upload new record
- `DELETE /api/records/:id` - Delete record

## Data Privacy & Security

- **Encryption**: All sensitive data encrypted at rest
- **Authentication**: Secure password hashing with bcrypt
- **Authorization**: Patient ID-based access control
- **HIPAA Compliance**: Designed with healthcare privacy standards
- **Data Isolation**: Complete separation between patient data

## SmartWatch Integration

### Supported Devices
- Apple Watch (Series 4+)
- Fitbit devices
- Samsung Galaxy Watch
- Generic health monitoring devices

### Supported Metrics
- Heart rate (bpm)
- Blood oxygen saturation (%)
- Steps count
- Sleep duration (hours)
- Blood pressure (mmHg)
- Body temperature (°F/°C)

### Data Sync
- Real-time sync via device APIs
- Batch processing for historical data
- Automatic conflict resolution
- Offline data storage and sync

## AI Assistant Features

### Grok AI Integration
- Powered by xAI's Grok model
- Context-aware responses using patient data
- Medical knowledge base integration
- Natural language processing for health queries

### Capabilities
- Answer questions about medical records
- Explain health metrics and trends
- Provide medication information
- Suggest preventive care reminders
- Emergency guidance (non-diagnostic)

## Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
\`\`\`env
DATABASE_URL=your_neon_production_url
XAI_API_KEY=your_grok_api_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.vercel.app
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

---

**Note**: This application handles sensitive health information. Ensure compliance with local healthcare regulations (HIPAA, GDPR, etc.) before deploying to production.
