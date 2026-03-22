# Aaina Landing Page - Supabase Setup Guide

## 1. Supabase Configuration

### Step 1: Create a Supabase Project
1. Go to https://supabase.com
2. Sign in and create a new project
3. Note down your project URL and anon key

### Step 2: Update Configuration
1. Open `script.js`
2. Replace the following values with your actual Supabase credentials:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Replace with your Supabase URL
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your Supabase anon key
   ```

### Step 3: Create Database Tables
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase_tables.sql`
4. Run the queries to create tables and policies

## 2. Tables Created

### email_signups
- **Purpose**: Stores email addresses from the "Join" button
- **Fields**: 
  - `id` (UUID, Primary Key)
  - `email` (TEXT, Unique)
  - `created_at` (TIMESTAMP)

### user_preferences
- **Purpose**: Stores user preferences and custom ideas from "Send Your Idea" button
- **Fields**:
  - `id` (UUID, Primary Key)
  - `selected_preferences` (TEXT[], Array of selected preferences)
  - `custom_idea` (TEXT, Optional custom idea)
  - `created_at` (TIMESTAMP)

## 3. Features Implemented

### Email Signup Form
- Email validation
- Duplicate email prevention
- Success/error feedback
- Loading states

### Preferences Form
- Clickable preference cards
- Custom idea input
- Multiple selection support
- Form validation

## 4. Security

- Row Level Security (RLS) enabled
- Public insert policies for both forms
- Authenticated read policies for admin access

## 5. Analytics Views

### daily_signups
View to track signups by date

### preference_analytics  
View to see most popular feature requests

### recent_custom_ideas
View to see latest custom ideas from users

## 6. Testing

1. Start your local server: `python3 -m http.server 8000`
2. Open http://localhost:8000
3. Test both forms:
   - Email signup (should save to `email_signups` table)
   - Preferences submission (should save to `user_preferences` table)

## 7. Deployment Notes

- Make sure to update SUPABASE_URL and SUPABASE_ANON_KEY before deployment
- Consider adding additional validation or rate limiting for production
- Monitor the analytics views to understand user preferences