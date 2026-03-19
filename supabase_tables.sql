-- Supabase Table Creation Queries for Krama Landing Page

-- Table 1: Email Signups (for the "Join" button)
CREATE TABLE email_signups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add index for faster email lookups
CREATE INDEX idx_email_signups_email ON email_signups(email);
CREATE INDEX idx_email_signups_created_at ON email_signups(created_at);

-- Table 2: User Preferences (for the "Send Your Idea" button)
CREATE TABLE user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    selected_preferences TEXT[] DEFAULT '{}', -- Array of selected preference texts
    custom_idea TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add index for faster queries
CREATE INDEX idx_user_preferences_created_at ON user_preferences(created_at);

-- Enable Row Level Security (RLS) for both tables
ALTER TABLE email_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies to allow inserts from the website
-- Policy for email_signups table - allows anyone to insert (for public signup)
CREATE POLICY "Allow public email signup" ON email_signups 
    FOR INSERT 
    WITH CHECK (true);

-- Policy for user_preferences table - allows anyone to insert (for public feedback)
CREATE POLICY "Allow public preference submission" ON user_preferences 
    FOR INSERT 
    WITH CHECK (true);

-- Optional: Create policies for reading data (if you want to display stats or admin dashboard)
-- These policies allow only authenticated users to read data
-- You can modify these based on your needs

CREATE POLICY "Allow authenticated users to read email signups" ON email_signups 
    FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read user preferences" ON user_preferences 
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Optional: Useful views for analytics

-- View to get signup count by date
CREATE VIEW daily_signups AS
SELECT 
    DATE(created_at) as signup_date,
    COUNT(*) as signup_count
FROM email_signups
GROUP BY DATE(created_at)
ORDER BY signup_date DESC;

-- View to get popular preferences
CREATE VIEW preference_analytics AS
SELECT 
    preference,
    COUNT(*) as selection_count
FROM user_preferences,
UNNEST(selected_preferences) as preference
GROUP BY preference
ORDER BY selection_count DESC;

-- View to get recent custom ideas (for inspiration)
CREATE VIEW recent_custom_ideas AS
SELECT 
    custom_idea,
    created_at
FROM user_preferences
WHERE custom_idea IS NOT NULL AND custom_idea != ''
ORDER BY created_at DESC;