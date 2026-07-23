const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const resetAdminPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/attendance_system');
        
        const admin = await User.findOne({ userId: 'ADMIN001' });
        
        if (admin) {
            admin.password = 'Admin@123456'; // This will be hashed by pre-save hook
            await admin.save();
            console.log('✅ Admin password reset successfully');
            console.log('User ID: ADMIN001');
            console.log('Password: Admin@123456');
        } else {
            console.log('Admin not found, creating new one...');
            const newAdmin = new User({
                userId: 'ADMIN001',
                name: 'System Administrator',
                email: 'admin@attendance.com',
                password: 'Admin@123456',
                role: 'admin'
            });
            await newAdmin.save();
            console.log('✅ Admin created successfully');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

resetAdminPassword();