const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
require('dotenv').config();

const createTestUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/attendance_system');
        console.log('Connected to MongoDB');

        // Clear existing users (optional - comment if you want to keep existing)
        // await User.deleteMany({});
        // await Student.deleteMany({});

        // Create Admin
        const adminExists = await User.findOne({ userId: 'ADMIN001' });
        if (!adminExists) {
            const admin = new User({
                userId: 'ADMIN001',
                name: 'System Administrator',
                email: 'admin@attendance.com',
                password: 'Admin@123456',
                role: 'admin'
            });
            await admin.save();
            console.log('✅ Admin created: ADMIN001 / Admin@123456');
        }

        // Create Teacher
        const teacherExists = await User.findOne({ userId: 'TCH001' });
        if (!teacherExists) {
            const teacher = new User({
                userId: 'TCH001',
                name: 'John Teacher',
                email: 'teacher@attendance.com',
                password: 'Teacher@123',
                role: 'teacher'
            });
            await teacher.save();
            console.log('✅ Teacher created: TCH001 / Teacher@123');
        }

        // Create Student
        const studentExists = await Student.findOne({ enrollmentNo: 'CO001' });
        if (!studentExists) {
            const student = new Student({
                enrollmentNo: 'CO001',
                name: 'Alice Student',
                email: 'student@attendance.com',
                password: 'Student@123',
                role: 'student',
                branch: new mongoose.Types.ObjectId(), // Placeholder, replace with actual branch ID
                batch: new mongoose.Types.ObjectId(), // Placeholder
                semester: 3,
                phoneNumber: '1234567890',
                parentName: 'Parent Name',
                parentPhone: '0987654321',
                parentEmail: 'parent@email.com',
                address: 'Test Address',
                dateOfBirth: new Date('2000-01-01'),
                gender: 'Female'
            });
            await student.save();
            console.log('✅ Student created: CO001 / Student@123');
        }

        console.log('\n📋 Test Credentials:');
        console.log('Admin  - ADMIN001 / Admin@123456');
        console.log('Teacher - TCH001 / Teacher@123');
        console.log('Student - CO001 / Student@123');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createTestUsers();