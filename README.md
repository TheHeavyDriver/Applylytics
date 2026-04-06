# 📊 Applylytics - Smart Job Application Tracker

Applylytics is a full-stack web application that helps users track, manage, and analyze their job applications in one place.
It provides insights into application progress, status distribution, and overall job hunt performance.

![Applylytics Dashboard](https://via.placeholder.com/1200x630/6366f1/ffffff?text=Applylytics)

## 🚀 Features

### Core Features
- **Dashboard** - Overview of your job search with stats, charts, and smart insights
- **Application Tracking** - Full CRUD for job applications with status management
- **Intelligent Follow-ups** - Smart reminders for when to follow up on applications
- **User Authentication** - Secure auth with email/password and Google OAuth
- **Cloud Backend** - Persistent and scalable real-time database with Supabase

### Smart Insights
- Automatic follow-up suggestions based on application age and status
- Success rate tracking
- Application status distribution charts
- Overdue follow-up alerts

### Application Management
- Track company, role, platform, salary, and location
- Multiple status stages: Applied, Screening, Interview, Technical, Offer, Rejected, Withdrawn, Accepted
- Search and filter applications
- Add notes for each application

### Follow-up System
- Schedule follow-ups by type (Email, Call, LinkedIn, Other)
- Track completed vs pending follow-ups
- Visual indicators for overdue follow-ups
- Connect follow-ups to specific applications

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## ⚙️ Installation & Setup
1. Clone the repository
```bash
git clone https://github.com/TheHeavyDriver/Applylytics.git
cd Applylytics
```
2. Install dependencies
```bash
cd client
npm install
```
3. Setup environment variables

Create a ``.env.local`` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```
4. Run locally
```bash
npm run dev
```
App will run on:
```bash
http://localhost:3000
```

## 📂 Project Structure

```
client/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── applications/
│   │   └── page.tsx          # Applications list & management
│   ├── follow-ups/
│   │   └── page.tsx          # Follow-ups management
│   ├── settings/
│   │   └── page.tsx          # User settings
│   └── auth/
│       ├── login/
│       │   └── page.tsx      # Login page
│       ├── signup/
│       │   └── page.tsx      # Signup page
│       └── callback/
│           └── page.tsx      # OAuth callback handler
├── components/
│   ├── AuthProvider.tsx       # Auth context provider
│   └── Navigation.tsx        # Main navigation
├── lib/
│   ├── supabase.ts            # Supabase client & API functions
│   └── types.ts               # TypeScript types
└── app/
    └── globals.css            # Global styles & Tailwind config
```

## 📂 Database Schema

### applications
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| company | VARCHAR | Company name |
| role | VARCHAR | Job role/title |
| platform | VARCHAR | Where you applied (LinkedIn, Indeed, etc.) |
| status | VARCHAR | Application status |
| applied_date | DATE | Date of application |
| salary | VARCHAR | Salary range (optional) |
| location | VARCHAR | Job location (optional) |
| notes | TEXT | Additional notes (optional) |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### follow_ups
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| application_id | UUID | Foreign key to applications |
| type | VARCHAR | Follow-up type (email, call, linkedin, other) |
| scheduled_date | DATE | When to follow up |
| completed | BOOLEAN | Whether completed |
| completed_at | TIMESTAMP | Completion timestamp |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMP | Creation timestamp |

## 💻 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run typecheck # Run TypeScript type checking
```
## 🐛 Issues

If you find a bug or want to request a feature, open an issue.


