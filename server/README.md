# Aaina Backend Server

This is the secure backend server for the Aaina Personal Stylist landing page. All Supabase credentials are kept safe on the backend and never exposed to the frontend.

## 🔒 Security Features

- **No exposed credentials**: Supabase credentials are stored in `.env` file on the backend server only
- **CORS protection**: Only allows requests from your frontend domain
- **Input validation**: Server-side validation of all user inputs
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
SUPABASE_ANON_KEY=your_supabase_key
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

⚠️ **Important**: Never commit `.env` to git. It's already in `.gitignore`.

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
Handles email signup submissions.

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
  "message": "Thank you for joining...",
  "type": "success"
}
```

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
2. Update `CORS_ORIGIN` to your production frontend URL
3. Deploy the backend server
4. Update `API_BASE_URL` in frontend to your production backend URL

## 📝 Notes

- The backend handles all database operations
- Frontend only sends data to the backend API
- All validation happens on both frontend and backend
- Supabase credentials never reach the client browser
