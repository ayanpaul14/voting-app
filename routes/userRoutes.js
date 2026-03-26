const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { jwtAuthMiddleware, generateToken, adminOnly } = require('../jwt'); // ✅ added adminOnly

// POST /user/signup
router.post('/signup', async (req, res) => {
    try {
        const { name, age, email, mobile, address, aadharCardNumber, password, role } = req.body;

        if (!name || !address || !aadharCardNumber || !password)
            return res.status(400).json({ error: 'name, address, aadharCardNumber, and password are required' });

        if (!/^\d{12}$/.test(aadharCardNumber))
            return res.status(400).json({ error: 'Aadhar Card Number must be exactly 12 digits' });

        if (role === 'admin') {
            const adminExists = await User.findOne({ role: 'admin' });
            if (adminExists) return res.status(400).json({ error: 'Admin user already exists' });
        }

        const existingUser = await User.findOne({ aadharCardNumber });
        if (existingUser) return res.status(400).json({ error: 'User with this Aadhar Card Number already exists' });

        if (age !== undefined && age < 18)
            return res.status(400).json({ error: 'Voter must be at least 18 years old' });

        const newUser = new User({ name, age, email, mobile, address, aadharCardNumber, password, role });
        const savedUser = await newUser.save();
        const token = generateToken({ id: savedUser.id, role: savedUser.role });
        const userResponse = savedUser.toObject();
        delete userResponse.password;

        return res.status(201).json({ user: userResponse, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /user/login
router.post('/login', async (req, res) => {
    try {
        const { aadharCardNumber, password } = req.body;

        if (!aadharCardNumber || !password)
            return res.status(400).json({ error: 'Aadhar Card Number and password are required' });

        const user = await User.findOne({ aadharCardNumber });

        if (!user || !(await user.comparePassword(password)))
            return res.status(401).json({ error: 'Invalid Aadhar Card Number or password' });

        // ✅ Block check
        if (user.isBlocked)
            return res.status(403).json({ error: 'Your account has been blocked by admin' });

        const token = generateToken({ id: user.id, role: user.role });
        return res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /user/profile
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        return res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PUT /user/profile/password
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword)
            return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });

        if (newPassword.length < 8)
            return res.status(400).json({ error: 'New password must be at least 8 characters' });

        const user = await User.findById(req.user.id);
        if (!user || !(await user.comparePassword(currentPassword)))
            return res.status(401).json({ error: 'Invalid current password' });

        user.password = newPassword;
        await user.save();

        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ✅ NEW: GET /user/voters — get all voters (admin only)
router.get('/voters', jwtAuthMiddleware, adminOnly, async (req, res) => {
    try {
        const voters = await User.find({ role: 'voter' }).select('-password');
        return res.status(200).json({ voters });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ✅ NEW: PUT /user/block/:userId — block or unblock a voter (admin only)
router.put('/block/:userId', jwtAuthMiddleware, adminOnly, async (req, res) => {
    try {
        const { userId } = req.params;
        const { isBlocked } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.role === 'admin') return res.status(403).json({ error: 'Cannot block admin' });

        user.isBlocked = isBlocked;
        await user.save();

        return res.status(200).json({
            message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;