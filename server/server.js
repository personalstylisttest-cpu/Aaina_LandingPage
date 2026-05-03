require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || process.env.APP_BASE_URL || 'http://localhost:8000';
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || `http://localhost:${PORT}`;
const allowedOrigins = (process.env.CORS_ORIGIN ||
    'http://localhost:5173,http://localhost:8000,http://127.0.0.1:5500,https://aaina-landing-page.vercel.app')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

// Initialize Supabase client (credentials are safe on backend)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseKey);
const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
const smtpTransport = (gmailUser && gmailAppPassword)
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: gmailUser,
            pass: gmailAppPassword
        }
    })
    : null;

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

function normalizeEmail(email) {
    return email.trim().toLowerCase();
}

function generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
}

async function sendVerificationEmail(email, verificationToken) {
    if (!smtpTransport || !gmailUser) {
        return {
            success: false,
            message: 'Email provider is not configured'
        };
    }

    const verificationUrl = `${BACKEND_BASE_URL}/verify-email?token=${verificationToken}`;

    try {
        const info = await smtpTransport.sendMail({
            from: `"Aaina" <${gmailUser}>`,
            to: email,
            subject: 'Welcome to Aaina - Confirm your email',
            html: `
                <p>Hi there,</p>
                <p>Thank you for joining Aaina. Please confirm your email to complete signup.</p>
                <p><a href="${verificationUrl}">Confirm my email</a></p>
                <p>If the button does not work, paste this URL in your browser:</p>
                <p>${verificationUrl}</p>
            `
        });

        return {
            success: true,
            emailId: info?.messageId || null
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to send email'
        };
    }
}

// ============= Get Email Signup Count Endpoint =============
app.get('/api/signup-count', async (req, res) => {
    try {
        // Get count from email_signups table
        const { data, error, count } = await supabaseClient
            .from('email_signups')
            .select('*', { count: 'exact', head: true });
        
        console.log('Supabase Count response:', { data, error, count });

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({
                success: false,
                count: 0,
                message: 'Error fetching count'
            });
        }

        res.json({
            success: true,
            count: count || 0
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            success: false,
            count: 0,
            message: 'Server error'
        });
    }
});

// ============= Email Signup Endpoint =============
app.post('/api/signup', async (req, res) => {
    try {
        const { email, source } = req.body;

        // Validate email
        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                existing: false,
                message: 'Email is required',
                type: 'warning'
            });
        }

        const normalizedEmail = normalizeEmail(email);

        if (!isValidEmail(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                existing: false,
                message: 'Invalid email format',
                type: 'warning'
            });
        }

        const verificationToken = generateVerificationToken();

        const { data: existingSignup, error: existingLookupError } = await supabaseClient
            .from('email_signups')
            .select('id, email_verified, verification_token, email_status')
            .eq('email', normalizedEmail)
            .maybeSingle();

        if (existingLookupError) {
            console.error('Supabase lookup error:', existingLookupError);
            return res.status(500).json({
                success: false,
                existing: false,
                message: 'Something went wrong. Please try again, darling! 💕',
                type: 'error'
            });
        }

        let signupRowId = existingSignup?.id || null;

        if (existingSignup?.email_verified) {
            return res.status(200).json({
                success: true,
                existing: true,
                message: 'This email is already verified on our VIP list. You\'re all set! ✨',
                type: 'info'
            });
        }

        if (existingSignup) {
            const { error: updateExistingError } = await supabaseClient
                .from('email_signups')
                .update({
                    verification_token: verificationToken,
                    email_status: 'pending',
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingSignup.id);

            if (updateExistingError) {
                console.error('Supabase update error:', updateExistingError);
                return res.status(500).json({
                    success: false,
                    existing: true,
                    message: 'Something went wrong. Please try again, darling! 💕',
                    type: 'error'
                });
            }
        } else {
            const { data: insertedSignup, error: insertError } = await supabaseClient
                .from('email_signups')
                .insert([
                    {
                        email: normalizedEmail,
                        verification_token: verificationToken,
                        email_status: 'pending',
                        email_verified: false,
                        source: source || null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ])
                .select('id')
                .single();

            if (insertError) {
                console.error('Supabase insert error:', insertError);
                return res.status(500).json({
                    success: false,
                    existing: false,
                    message: 'Something went wrong. Please try again, darling! 💕',
                    type: 'error'
                });
            }

            signupRowId = insertedSignup.id;
        }

        const emailSendResult = await sendVerificationEmail(normalizedEmail, verificationToken);

        if (!emailSendResult.success) {
            const { error: sendFailUpdateError } = await supabaseClient
                .from('email_signups')
                .update({
                    email_status: 'send_failed',
                    last_email_error: emailSendResult.message,
                    updated_at: new Date().toISOString()
                })
                .eq('id', signupRowId);

            if (sendFailUpdateError) {
                console.error('Supabase send-fail update error:', sendFailUpdateError);
            }

            return res.status(200).json({
                success: true,
                existing: !!existingSignup,
                message: 'You are on the waitlist, but we could not send a verification email right now. Please try again in a bit. 💕',
                type: 'warning'
            });
        }

        const { error: sendStatusUpdateError } = await supabaseClient
            .from('email_signups')
            .update({
                email_status: 'sent',
                resend_email_id: emailSendResult.emailId,
                verification_email_sent_at: new Date().toISOString(),
                last_email_error: null,
                updated_at: new Date().toISOString()
            })
            .eq('id', signupRowId);

        if (sendStatusUpdateError) {
            console.error('Supabase send-status update error:', sendStatusUpdateError);
        }

        res.json({
            success: true,
            message: 'Almost done! Please check your inbox and confirm your email to complete signup. 💖',
            existing: !!existingSignup,
            type: 'success'
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            success: false,
            existing: false,
            message: 'Server error. Please try again later.',
            type: 'error'
        });
    }
});

// ============= Email Verification Endpoint =============
app.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).send('Verification token is required.');
        }

        const { data: signupRow, error: tokenLookupError } = await supabaseClient
            .from('email_signups')
            .select('id, email_verified')
            .eq('verification_token', token)
            .maybeSingle();

        if (tokenLookupError) {
            console.error('Supabase token lookup error:', tokenLookupError);
            return res.status(500).send('Could not verify email. Please try again.');
        }

        if (!signupRow) {
            return res.status(400).send('Invalid or expired verification link.');
        }

        if (signupRow.email_verified) {
            return res.redirect(`${FRONTEND_BASE_URL}/?email_verified=already`);
        }

        const { error: verifyUpdateError } = await supabaseClient
            .from('email_signups')
            .update({
                email_verified: true,
                email_verified_at: new Date().toISOString(),
                email_status: 'verified',
                verification_token: null,
                updated_at: new Date().toISOString()
            })
            .eq('id', signupRow.id);

        if (verifyUpdateError) {
            console.error('Supabase verify update error:', verifyUpdateError);
            return res.status(500).send('Could not verify email. Please try again.');
        }

        return res.redirect(`${FRONTEND_BASE_URL}/?email_verified=success`);
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).send('Could not verify email. Please try again.');
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
