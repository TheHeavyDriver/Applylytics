-- Applylytics Database Schema for Supabase
-- Run this in your Supabase SQL Editor
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  platform VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'applied',
  applied_date DATE NOT NULL,
  salary VARCHAR(100),
  location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Create follow_ups table
CREATE TABLE IF NOT EXISTS follow_ups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL DEFAULT 'email',
  scheduled_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_applied_date ON applications(applied_date DESC);
CREATE INDEX IF NOT EXISTS idx_follow_ups_user_id ON follow_ups(user_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_application_id ON follow_ups(application_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_scheduled_date ON follow_ups(scheduled_date);
-- Enable Row Level Security (RLS)
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
-- Create policies for applications
DROP POLICY IF EXISTS "Users can view their own applications" ON applications;
CREATE POLICY "Users can view their own applications"
  ON applications FOR SELECT
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own applications" ON applications;
CREATE POLICY "Users can insert their own applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own applications" ON applications;
CREATE POLICY "Users can update their own applications"
  ON applications FOR UPDATE
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own applications" ON applications;
CREATE POLICY "Users can delete their own applications"
  ON applications FOR DELETE
  USING (auth.uid() = user_id);
-- Create policies for follow_ups
DROP POLICY IF EXISTS "Users can view their own follow_ups" ON follow_ups;
CREATE POLICY "Users can view their own follow_ups"
  ON follow_ups FOR SELECT
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own follow_ups" ON follow_ups;
CREATE POLICY "Users can insert their own follow_ups"
  ON follow_ups FOR INSERT
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own follow_ups" ON follow_ups;
CREATE POLICY "Users can update their own follow_ups"
  ON follow_ups FOR UPDATE
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own follow_ups" ON follow_ups;
CREATE POLICY "Users can delete their own follow_ups"
  ON follow_ups FOR DELETE
  USING (auth.uid() = user_id);
-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';
-- Create trigger for applications updated_at
DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
-- Create email_preferences table for daily digest settings
CREATE TABLE IF NOT EXISTS email_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_digest_enabled BOOLEAN DEFAULT TRUE,
  digest_time TIME DEFAULT '09:00:00',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);
-- Enable RLS for email_preferences
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;
-- Create policies for email_preferences
DROP POLICY IF EXISTS "Users can view their own email preferences" ON email_preferences;
CREATE POLICY "Users can view their own email preferences"
  ON email_preferences FOR SELECT
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own email preferences" ON email_preferences;
CREATE POLICY "Users can insert their own email preferences"
  ON email_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own email preferences" ON email_preferences;
CREATE POLICY "Users can update their own email preferences"
  ON email_preferences FOR UPDATE
  USING (auth.uid() = user_id);
-- Trigger for email_preferences updated_at
DROP TRIGGER IF EXISTS update_email_preferences_updated_at ON email_preferences;
CREATE TRIGGER update_email_preferences_updated_at
  BEFORE UPDATE ON email_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();