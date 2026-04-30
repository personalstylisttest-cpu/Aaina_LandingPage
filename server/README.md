# Aaina Backend Server

This is the secure backend server for the Aaina Personal Stylist landing page. All Supabase credentials are kept safe on the backend and never exposed to the frontend.

## 🔒 Security Features

- **No exposed credentials**: Supabase credentials are stored in `.env` file on the backend server only
- **CORS protection**: Only allows requests from your frontend domain
- **Input validation**: Server-side validation of all user inputs
- **Email lifecycle tracking**: Tracks `pending` → `sent/send_failed` → `verified`
- **Environment-based configuration**: Different settings for development and production

## 📋 Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

The `.env` file already contains your Supabase credentials. If you need to update them:

```bash
# Edit the .env file with your actual values
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
FRONTEND_BASE_URL=http://localhost:8000
BACKEND_BASE_URL=http://localhost:3000
GMAIL_USER=personalstylisttest@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
```

⚠️ **Important**: Never commit `.env` to git. It's already in `.gitignore`.
Use the service role key on backend so status updates and verification writes are not blocked by RLS.

### 3. Start the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will run on `http://localhost:3000`

## 📡 API Endpoints

### POST `/api/signup`
Handles email signup submissions, stores signup row, and sends verification email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Almost done! Please check your inbox and confirm your email...",
  "type": "success"
}
```

### GET `/verify-email?token=<token>`
Verifies email ownership when the user clicks link from email.

- Verification email link uses `BACKEND_BASE_URL` (must point to this Express server).
- After verification, user is redirected to `FRONTEND_BASE_URL`.

### POST `/api/preferences`
Handles user preferences and custom idea submissions.

**Request Body:**
```json
{
  "selectedPreferences": ["Casual", "Minimalist"],
  "customIdea": "I love sustainable fashion"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you for your feedback...",
  "type": "success"
}
```

### GET `/api/health`
Health check endpoint to verify server is running.

## 🔧 Frontend Configuration

Update your frontend's API URL based on environment:

- **Development**: `http://localhost:3000`
- **Production**: Update `API_BASE_URL` in your frontend deployment

## 🚀 Deployment

For production deployment (Heroku, Vercel, Railway, etc.):

1. Set environment variables on your hosting platform
2. Update `CORS_ORIGIN`, `FRONTEND_BASE_URL`, and `BACKEND_BASE_URL` to production URLs
3. Configure a Gmail account with an app password and set `GMAIL_USER` + `GMAIL_APP_PASSWORD`
4. Deploy the backend server
5. Update `API_BASE_URL` in frontend to your production backend URL

## 📝 Notes

- The backend handles all database operations
- Frontend only sends data to the backend API
- All validation happens on both frontend and backend
- Supabase credentials never reach the client browser
