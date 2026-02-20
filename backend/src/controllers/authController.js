const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');

const MASTER_OTP = '123456';

const sendOTP = async (req, res) => {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ error: 'Mobile number is required' });

    // For now, we just acknowledge receipt of request
    // In real app, generate OTP, store in DB, and send via SMS provider
    console.log(`✉️ Sending master OTP ${MASTER_OTP} to ${mobile}`);

    res.json({ message: 'OTP sent successfully', masterOtpHint: MASTER_OTP });
};

const verifyOTP = async (req, res) => {
    const { mobile, otp, name, dob } = req.body;

    if (!mobile || !otp) {
        return res.status(400).json({ error: 'Mobile number and OTP are required' });
    }

    if (otp !== MASTER_OTP) {
        return res.status(401).json({ error: 'Invalid OTP' });
    }

    try {
        // Check if user exists
        let userResult = await db.query('SELECT * FROM users WHERE mobile = $1', [mobile]);
        let user = userResult.rows[0];

        if (!user) {
            // Create user if not exists (Signup flow)
            if (!name) {
                return res.status(400).json({ error: 'Name is required for first-time registration' });
            }
            const insertResult = await db.query(
                'INSERT INTO users (name, mobile, dob) VALUES ($1, $2, $3) RETURNING *',
                [name, mobile, dob || null]
            );
            user = insertResult.rows[0];
        } else if (name || dob) {
            // Update user if info provided
            const updateResult = await db.query(
                'UPDATE users SET name = COALESCE($1, name), dob = COALESCE($2, dob), updated_at = CURRENT_TIMESTAMP WHERE mobile = $3 RETURNING *',
                [name, dob, mobile]
            );
            user = updateResult.rows[0];
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, mobile: user.mobile, name: user.name },
            config.jwtSecret,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Verification successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                mobile: user.mobile,
                dob: user.dob
            }
        });
    } catch (error) {
        console.error('❌ Auth Verification error:', error);
        res.status(500).json({ error: 'Internal server error during authentication' });
    }
};

const getMe = async (req, res) => {
    try {
        const userResult = await db.query('SELECT id, name, mobile, dob FROM users WHERE id = $1', [req.user.id]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user: userResult.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user profile' });
    }
};

module.exports = {
    sendOTP,
    verifyOTP,
    getMe
};
