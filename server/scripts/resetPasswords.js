const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
require('dotenv').config();

const resetPasswords = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/attendance_system');
        console.log('✅ Connected to MongoDB\n');

        // Reset Admin password
        let admin = await User.findOne({ userId: 'ADMIN001' });
        if (admin) {
            admin.password = 'Admin@123456';
            await admin.save();
            console.log('✅ Admin password reset: ADMIN001 / Admin@123456');
        } else {
            admin = new User({
                userId: 'ADMIN001',
                name: 'System Administrator',
                email: 'admin@attendance.com',
                password: 'Admin@123456',
                role: 'admin'
            });
            await admin.save();
            console.log('✅ Admin created: ADMIN001 / Admin@123456');
        }

        // Reset Teacher password
        let teacher = await User.findOne({ userId: 'TCH001' });
        if (teacher) {
            teacher.password = 'Teacher@123';
            await teacher.save();
            console.log('✅ Teacher password reset: TCH001 / Teacher@123');
        } else {
            teacher = new User({
                userId: 'TCH001',
                name: 'John Teacher',
                email: 'teacher@attendance.com',
                password: 'Teacher@123',
                role: 'teacher'
            });
            await teacher.save();
            console.log('✅ Teacher created: TCH001 / Teacher@123');
        }

        // Reset Student password
        let student = await Student.findOne({ enrollmentNo: 'CO001' });
        if (student) {
            student.password = 'Student@123';
            await student.save();
            console.log('✅ Student password reset: CO001 / Student@123');
        } else {
            // Check if branch and batch exist
            const Branch = require('../models/Branch');
            const Batch = require('../models/Batch');
            
            let branch = await Branch.findOne({ branchCode: 'CO' });
            if (!branch) {
                branch = new Branch({
                    branchCode: 'CO',
                    branchName: 'Computer Engineering',
                    duration: 4
                });
                await branch.save();
            }

            let batch = await Batch.findOne({ batchCode: 'B2024' });
            if (!batch) {
                batch = new Batch({
                    batchCode: 'B2024',
                    batchName: 'Batch 2024',
                    branch: branch._id,
                    year: 2024,
                    semester: 3
                });
                await batch.save();
            }

            student = new Student({
                enrollmentNo: 'CO001',
                name: 'Alice Student',
                email: 'student@attendance.com',
                password: 'Student@123',
                role: 'student',
                branch: branch._id,
                batch: batch._id,
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

        console.log('\n✅ All passwords reset successfully!');
        console.log('\n📋 TEST CREDENTIALS:');
        console.log('Admin  - ADMIN001 / Admin@123456');
        console.log('Teacher - TCH001 / Teacher@123');
        console.log('Student - CO001 / Student@123');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

resetPasswords();