require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = (process.env.CORS_ORIGIN ||
    'http://localhost:5173,http://localhost:8000,http://127.0.0.1:5500,https://aaina-landing-page.vercel.app')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

// Initialize Supabase client (credentials are safe on backend)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(express.json());
app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

// Email validation utility
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ============= Email Signup Endpoint =============
app.post('/api/signup', async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Email is required',
                type: 'warning'
            });
        }

        if (!isValidEmail(email.trim())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format',
                type: 'warning'
            });
        }

        // Insert into Supabase
        const { data, error } = await supabaseClient
            .from('email_signups')
            .insert([
                {
                    email: email.trim(),
                    created_at: new Date().toISOString()
                }
            ]);

        if (error) {
            if (error.code === '23505') { // Unique constraint violation
                return res.status(200).json({
                    success: true,
                    message: 'This email is already on our VIP list! You\'re all set, beautiful! ✨',
                    type: 'info'
                });
            } else {
                console.error('Supabase error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Something went wrong. Please try again, darling! 💕',
                    type: 'error'
                });
            }
        }

        res.json({
            success: true,
            message: 'Thank you for joining our style community! We\'ll be in touch with exclusive early access soon! 💖',
            type: 'success'
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
            type: 'error'
        });
    }
});

// ============= Preferences Submission Endpoint =============
app.post('/api/preferences', async (req, res) => {
    try {
        const { selectedPreferences, customIdea } = req.body;

        // Validate input
        if ((!selectedPreferences || selectedPreferences.length === 0) && !customIdea) {
            return res.status(400).json({
                success: false,
                message: 'Please select at least one preference or share your amazing idea with us! ✨',
                type: 'warning'
            });
        }

        // Insert into Supabase
        const { data, error } = await supabaseClient
            .from('user_preferences')
            .insert([
                {
                    selected_preferences: selectedPreferences || [],
                    custom_idea: customIdea && customIdea.trim() ? customIdea.trim() : null,
                    created_at: new Date().toISOString()
                }
            ]);

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({
                success: false,
                message: 'Something went wrong. Please try again, gorgeous! 💕',
                type: 'error'
            });
        }

        res.json({
            success: true,
            message: 'Thank you for your feedback! Your brilliant ideas help us build the perfect Aaina for you! 🌟',
            type: 'success'
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
            type: 'error'
        });
    }
});

app.get('/', (req, res) => {
    res.json({
        status: 'Aaina backend is running',
        health: '/api/health'
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Aaina Backend Server running on http://localhost:${PORT}`);
    console.log(`📝 Make sure to copy .env.example to .env and add your Supabase credentials`);
});
