const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

// Get all teachers (admin only)
router.get('/teachers', authMiddleware, isAdmin, async (req, res) => {
    try {
        const teachers = await User.find({ role: 'teacher' })
            .select('-password')
            .populate('branch', 'branchName branchCode')
            .populate('assignedBatches', 'batchCode batchName');
        
        res.json({
            success: true,
            teachers
        });
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;