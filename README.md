# Applylytics - Smart Job Application Tracker

A modern, full-featured job application tracking web app built with Next.js 16, Supabase, and Tailwind CSS.

![Applylytics Dashboard](https://via.placeholder.com/1200x630/6366f1/ffffff?text=Applylytics)

## Features

### Core Features
- **Dashboard** - Overview of your job search with stats, charts, and smart insights
- **Application Tracking** - Full CRUD for job applications with status management
- **Intelligent Follow-ups** - Smart reminders for when to follow up on applications
- **User Authentication** - Secure auth with email/password and Google OAuth

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

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account

### 1. Clone and Install

```bash
cd client
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste the contents of `supabase-schema.sql` and execute it
4. This will create the `applications` and `follow_ups` tables with Row Level Security policies

### 3. Configure Environment Variables

Create a `.env.local` file in the `client` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Find these values in your Supabase dashboard under:
- Settings > API > Project URL (for the URL)
- Settings > API > Project API keys > `anon` key (for the anon key)

### 4. Enable Google OAuth (Optional)

1. In Supabase Dashboard, go to Authentication > Providers > Google
2. Enable Google provider
3. Add your Google OAuth credentials (Client ID and Client Secret)
4. Configure the redirect URL in your Google Cloud Console

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

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

## Database Schema

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

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run typecheck # Run TypeScript type checking
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
