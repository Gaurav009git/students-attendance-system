const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');

// Test route to check users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        const students = await Student.find().select('-password');
        
        res.json({
            users,
            students,
            counts: {
                users: users.length,
                students: students.length
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create test admin if not exists
router.get('/create-test-admin', async (req, res) => {
    try {
        const existingAdmin = await User.findOne({ userId: 'ADMIN001' });
        
        if (!existingAdmin) {
            const admin = new User({
                userId: 'ADMIN001',
                name: 'Test Admin',
                email: 'admin@test.com',
                password: 'Admin@123',
                role: 'admin'
            });
            await admin.save();
            res.json({ message: 'Test admin created', credentials: { userId: 'ADMIN001', password: 'Admin@123' } });
        } else {
            res.json({ message: 'Admin already exists' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;