const User = require('../models/User');
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user._id, 
            userId: user.userId || user.enrollmentNo, 
            role: user.role || 'student', 
            name: user.name 
        },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '24h' }
    );
};

const loginUser = async (req, res) => {
    try {
        const { userId, password } = req.body;
        
        console.log('🔍 Login attempt for:', userId);
        
        if (!userId || !password) {
            return res.status(400).json({ error: 'Please provide userId and password' });
        }
        
        // Search in both collections
        let user = await User.findOne({ userId: userId });
        let userType = 'user';
        
        if (!user) {
            user = await Student.findOne({ enrollmentNo: userId });
            userType = 'student';
        }
        
        if (!user) {
            console.log('❌ User not found:', userId);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        console.log('✅ User found:', user.email);
        console.log('User role:', user.role || 'student');
        
        // Check password
        const isMatch = await user.comparePassword(password);
        console.log('Password match:', isMatch);
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Generate token
        const token = generateToken(user);
        
        // Prepare user response
        const userResponse = {
            id: user._id,
            userId: user.userId || user.enrollmentNo,
            name: user.name,
            email: user.email,
            role: user.role || 'student'
        };
        
        // Add student-specific fields
        if (userType === 'student') {
            userResponse.branch = user.branch;
            userResponse.batch = user.batch;
            userResponse.semester = user.semester;
        }
        
        console.log('✅ Login successful for:', userResponse.name);
        
        res.json({
            success: true,
            token,
            user: userResponse
        });
        
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
};

module.exports = { loginUser };