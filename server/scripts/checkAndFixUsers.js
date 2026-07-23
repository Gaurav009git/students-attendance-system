const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const checkAndFixUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/attendance_system');
        console.log('✅ Connected to MongoDB\n');

        // Check Users collection
        console.log('📊 CHECKING USERS COLLECTION:');
        const users = await User.find({});
        if (users.length === 0) {
            console.log('❌ No users found in database');
        } else {
            console.log(`Found ${users.length} users:`);
            for (const user of users) {
                console.log(`\nUser: ${user.userId}`);
                console.log(`- Name: ${user.name}`);
                console.log(`- Email: ${user.email}`);
                console.log(`- Role: ${user.role}`);
                console.log(`- Password Hash: ${user.password.substring(0, 20)}...`);
                
                // Test password comparison
                const testPassword = user.userId === 'ADMIN001' ? 'Admin@123456' : 
                                    user.userId === 'TCH001' ? 'Teacher@123' : 'test';
                const isValid = await user.comparePassword(testPassword);
                console.log(`- Password valid for test: ${isValid}`);
            }
        }

        // Check Students collection
        console.log('\n📊 CHECKING STUDENTS COLLECTION:');
        const students = await Student.find({});
        if (students.length === 0) {
            console.log('❌ No students found in database');
        } else {
            console.log(`Found ${students.length} students:`);
            for (const student of students) {
                console.log(`\nStudent: ${student.enrollmentNo}`);
                console.log(`- Name: ${student.name}`);
                console.log(`- Email: ${student.email}`);
                console.log(`- Password Hash: ${student.password.substring(0, 20)}...`);
            }
        }

        // Create test users if none exist
        if (users.length === 0 && students.length === 0) {
            console.log('\n📝 CREATING TEST USERS...');
            
            // Create Admin
            const admin = new User({
                userId: 'ADMIN001',
                name: 'System Administrator',
                email: 'admin@attendance.com',
                password: 'Admin@123456',
                role: 'admin'
            });
            await admin.save();
            console.log('✅ Admin created: ADMIN001 / Admin@123456');

            // Create Teacher
            const teacher = new User({
                userId: 'TCH001',
                name: 'John Teacher',
                email: 'teacher@attendance.com',
                password: 'Teacher@123',
                role: 'teacher'
            });
            await teacher.save();
            console.log('✅ Teacher created: TCH001 / Teacher@123');

            // Create a test branch first (required for student)
            const Branch = require('../models/Branch');
            let branch = await Branch.findOne({ branchCode: 'CO' });
            if (!branch) {
                branch = new Branch({
                    branchCode: 'CO',
                    branchName: 'Computer Engineering',
                    duration: 4
                });
                await branch.save();
            }

            // Create a test batch
            const Batch = require('../models/Batch');
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

            // Create Student
            const student = new Student({
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

        console.log('\n✅ Check complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkAndFixUsers();