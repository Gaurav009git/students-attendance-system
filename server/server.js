// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();

// // Import routes
// const authRoutes = require('./routes/authRoutes');
// const attendanceRoutes = require('./routes/attendanceRoutes');
// const adminRoutes = require('./routes/adminRoutes');
// const teacherRoutes = require('./routes/teacherRoutes');
// const batchRoutes = require('./routes/batchRoutes');

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Database connection
// const connectDB = async () => {
//     try {
//         await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/attendance_system');
//         console.log('✅ MongoDB connected successfully');
        
//         // Seed admin after connection
//         const seedAdmin = require('./config/seedAdmin');
//         await seedAdmin();
//     } catch (err) {
//         console.error('❌ MongoDB connection error:', err.message);
//         process.exit(1);
//     }
// };

// connectDB();

// // ============================================
// // 🔴 DEBUG ROUTES - START
// // ============================================

// const User = require('./models/User');
// const Student = require('./models/Student');
// const Branch = require('./models/Branch');
// const Batch = require('./models/Batch');

// // Debug Route 1: Check all users
// app.get('/api/debug/users', async (req, res) => {
//     try {
//         const users = await User.find().select('-password');
//         const students = await Student.find().select('-password');
        
//         res.json({
//             success: true,
//             counts: {
//                 users: users.length,
//                 students: students.length
//             },
//             users: users,
//             students: students
//         });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Debug Route 2: Test login
// app.post('/api/debug/login', async (req, res) => {
//     try {
//         const { userId, password } = req.body;
        
//         console.log('🔍 Debug login attempt:', { userId, password: '****' });
        
//         if (!userId || !password) {
//             return res.status(400).json({ 
//                 error: 'Please provide userId and password'
//             });
//         }
        
//         // Check in User collection
//         let user = await User.findOne({ userId });
//         let userType = 'user';
        
//         if (!user) {
//             user = await Student.findOne({ enrollmentNo: userId });
//             userType = 'student';
//         }
        
//         if (!user) {
//             return res.status(404).json({ 
//                 error: 'User not found',
//                 userId
//             });
//         }
        
//         const isValid = await user.comparePassword(password);
        
//         res.json({
//             success: true,
//             userFound: true,
//             userType,
//             userId: user.userId || user.enrollmentNo,
//             name: user.name,
//             email: user.email,
//             role: user.role || 'student',
//             passwordValid: isValid,
//             message: isValid ? '✅ Password correct' : '❌ Password incorrect'
//         });
        
//     } catch (error) {
//         console.error('Debug login error:', error);
//         res.status(500).json({ error: error.message });
//     }
// });

// // Debug Route 3: Create test users
// app.get('/api/debug/create-test-users', async (req, res) => {
//     try {
//         const results = [];
        
//         // Create Admin
//         let admin = await User.findOne({ userId: 'ADMIN001' });
//         if (!admin) {
//             admin = new User({
//                 userId: 'ADMIN001',
//                 name: 'System Administrator',
//                 email: 'admin@attendance.com',
//                 password: 'Admin@123456',
//                 role: 'admin'
//             });
//             await admin.save();
//             results.push('✅ Admin created: ADMIN001 / Admin@123456');
//         } else {
//             admin.password = 'Admin@123456';
//             await admin.save();
//             results.push('✅ Admin password reset: ADMIN001 / Admin@123456');
//         }

//         // Create Teacher
//         let teacher = await User.findOne({ userId: 'TCH001' });
//         if (!teacher) {
//             teacher = new User({
//                 userId: 'TCH001',
//                 name: 'John Teacher',
//                 email: 'teacher@attendance.com',
//                 password: 'Teacher@123',
//                 role: 'teacher'
//             });
//             await teacher.save();
//             results.push('✅ Teacher created: TCH001 / Teacher@123');
//         } else {
//             teacher.password = 'Teacher@123';
//             await teacher.save();
//             results.push('✅ Teacher password reset: TCH001 / Teacher@123');
//         }

//         // Create Branch if not exists
//         let branch = await Branch.findOne({ branchCode: 'CO' });
//         if (!branch) {
//             branch = new Branch({
//                 branchCode: 'CO',
//                 branchName: 'Computer Engineering',
//                 duration: 4
//             });
//             await branch.save();
//         }

//         // Create Batch if not exists
//         let batch = await Batch.findOne({ batchCode: 'B2024' });
//         if (!batch) {
//             batch = new Batch({
//                 batchCode: 'B2024',
//                 batchName: 'Batch 2024',
//                 branch: branch._id,
//                 year: 2024,
//                 semester: 3
//             });
//             await batch.save();
//         }

//         // Create Student
//         let student = await Student.findOne({ enrollmentNo: 'CO001' });
//         if (!student) {
//             student = new Student({
//                 enrollmentNo: 'CO001',
//                 name: 'Alice Student',
//                 email: 'student@attendance.com',
//                 password: 'Student@123',
//                 role: 'student',
//                 branch: branch._id,
//                 batch: batch._id,
//                 semester: 3,
//                 phoneNumber: '1234567890',
//                 parentName: 'Parent Name',
//                 parentPhone: '0987654321',
//                 parentEmail: 'parent@email.com',
//                 address: 'Test Address',
//                 dateOfBirth: new Date('2000-01-01'),
//                 gender: 'Female'
//             });
//             await student.save();
//             results.push('✅ Student created: CO001 / Student@123');
//         } else {
//             student.password = 'Student@123';
//             await student.save();
//             results.push('✅ Student password reset: CO001 / Student@123');
//         }

//         res.json({
//             success: true,
//             message: 'Test users created/reset successfully',
//             results,
//             credentials: {
//                 admin: { userId: 'ADMIN001', password: 'Admin@123456' },
//                 teacher: { userId: 'TCH001', password: 'Teacher@123' },
//                 student: { enrollmentNo: 'CO001', password: 'Student@123' }
//             }
//         });

//     } catch (error) {
//         console.error('Error creating test users:', error);
//         res.status(500).json({ error: error.message });
//     }
// });

// // Debug Route 4: Direct password check
// app.post('/api/debug/check-password', async (req, res) => {
//     try {
//         const { userId, password } = req.body;
//         const bcrypt = require('bcryptjs');
        
//         let user = await User.findOne({ userId });
//         let collection = 'users';
        
//         if (!user) {
//             user = await Student.findOne({ enrollmentNo: userId });
//             collection = 'students';
//         }
        
//         if (!user) {
//             return res.json({
//                 exists: false,
//                 message: 'User not found'
//             });
//         }
        
//         const isValid = await bcrypt.compare(password, user.password);
        
//         res.json({
//             exists: true,
//             collection,
//             userId: user.userId || user.enrollmentNo,
//             name: user.name,
//             role: user.role || 'student',
//             passwordValid: isValid,
//             storedHash: user.password.substring(0, 30) + '...',
//             message: isValid ? '✅ Password correct!' : '❌ Password incorrect'
//         });
        
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // ============================================
// // 🔴 DEBUG ROUTES - END
// // ============================================

// // Regular routes
// app.use('/api/auth', authRoutes);
// app.use('/api/attendance', attendanceRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/admin', teacherRoutes);
// app.use('/api/admin', batchRoutes);

// // Basic route
// app.get('/', (req, res) => {
//     res.json({ 
//         message: 'Attendance Management System API',
//         status: 'running',
//         debug: 'Use /api/debug/* for testing',
//         endpoints: {
//             debug: {
//                 users: '/api/debug/users',
//                 login: '/api/debug/login',
//                 createTestUsers: '/api/debug/create-test-users',
//                 checkPassword: '/api/debug/check-password'
//             },
//             auth: '/api/auth/login',
//             attendance: '/api/attendance',
//             admin: '/api/admin'
//         }
//     });
// });

// // 404 handler
// app.use((req, res) => {
//     res.status(404).json({ error: 'Route not found' });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//     console.error('❌ Server error:', err.stack);
//     res.status(500).json({ 
//         error: 'Something went wrong!',
//         message: err.message 
//     });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`✅ Server running on port ${PORT}`);
//     console.log(`📍 API available at http://localhost:${PORT}`);
//     console.log(`🔧 Debug endpoints:`);
//     console.log(`   - GET  /api/debug/users - List all users`);
//     console.log(`   - POST /api/debug/login - Test login`);
//     console.log(`   - GET  /api/debug/create-test-users - Create test users`);
//     console.log(`   - POST /api/debug/check-password - Direct password check`);
// });































const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const adminRoutes = require('./routes/adminRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const batchRoutes = require('./routes/batchRoutes');

const app = express();

// Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: ['https://students-attendance-system-sigma.vercel.app', 'http://localhost:5173'],
    credentials: true
}));

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/attendance_system');
        console.log('✅ MongoDB connected successfully');
        
        // Seed admin after connection
        try {
            const seedAdmin = require('./config/seedAdmin');
            await seedAdmin();
            console.log('✅ Admin seeding completed');
        } catch (seedError) {
            console.error('❌ Seed admin error:', seedError.message);
        }
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    }
};

connectDB();

// ============================================
// 🔴 DEBUG ROUTES - START
// ============================================

const User = require('./models/User');
const Student = require('./models/Student');
const Branch = require('./models/Branch');
const Batch = require('./models/Batch');

// Debug Route 1: Check all users
app.get('/api/debug/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        const students = await Student.find().select('-password');
        
        res.json({
            success: true,
            counts: {
                users: users.length,
                students: students.length
            },
            users: users,
            students: students
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Debug Route 2: Test login
app.post('/api/debug/login', async (req, res) => {
    try {
        const { userId, password } = req.body;
        
        console.log('🔍 Debug login attempt:', { userId, password: '****' });
        
        if (!userId || !password) {
            return res.status(400).json({ 
                error: 'Please provide userId and password'
            });
        }
        
        // Check in User collection
        let user = await User.findOne({ userId });
        let userType = 'user';
        
        if (!user) {
            user = await Student.findOne({ enrollmentNo: userId });
            userType = 'student';
        }
        
        if (!user) {
            return res.status(404).json({ 
                error: 'User not found',
                userId
            });
        }
        
        const isValid = await user.comparePassword(password);
        
        res.json({
            success: true,
            userFound: true,
            userType,
            userId: user.userId || user.enrollmentNo,
            name: user.name,
            email: user.email,
            role: user.role || 'student',
            passwordValid: isValid,
            message: isValid ? '✅ Password correct' : '❌ Password incorrect'
        });
        
    } catch (error) {
        console.error('Debug login error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Debug Route 3: Create test users
app.get('/api/debug/create-test-users', async (req, res) => {
    try {
        const results = [];
        
        // Create Admin
        let admin = await User.findOne({ userId: 'ADMIN001' });
        if (!admin) {
            admin = new User({
                userId: 'ADMIN001',
                name: 'System Administrator',
                email: 'admin@attendance.com',
                password: 'Admin@123456',
                role: 'admin'
            });
            await admin.save();
            results.push('✅ Admin created: ADMIN001 / Admin@123456');
        } else {
            admin.password = 'Admin@123456';
            await admin.save();
            results.push('✅ Admin password reset: ADMIN001 / Admin@123456');
        }

        // Create Teacher
        let teacher = await User.findOne({ userId: 'TCH001' });
        if (!teacher) {
            teacher = new User({
                userId: 'TCH001',
                name: 'John Teacher',
                email: 'teacher@attendance.com',
                password: 'Teacher@123',
                role: 'teacher'
            });
            await teacher.save();
            results.push('✅ Teacher created: TCH001 / Teacher@123');
        } else {
            teacher.password = 'Teacher@123';
            await teacher.save();
            results.push('✅ Teacher password reset: TCH001 / Teacher@123');
        }

        // Create Branch if not exists
        let branch = await Branch.findOne({ branchCode: 'CO' });
        if (!branch) {
            branch = new Branch({
                branchCode: 'CO',
                branchName: 'Computer Engineering',
                duration: 4
            });
            await branch.save();
        }

        // Create Batch if not exists
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
        let student = await Student.findOne({ enrollmentNo: 'CO001' });
        if (!student) {
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
            results.push('✅ Student created: CO001 / Student@123');
        } else {
            student.password = 'Student@123';
            await student.save();
            results.push('✅ Student password reset: CO001 / Student@123');
        }

        res.json({
            success: true,
            message: 'Test users created/reset successfully',
            results,
            credentials: {
                admin: { userId: 'ADMIN001', password: 'Admin@123456' },
                teacher: { userId: 'TCH001', password: 'Teacher@123' },
                student: { enrollmentNo: 'CO001', password: 'Student@123' }
            }
        });

    } catch (error) {
        console.error('Error creating test users:', error);
        res.status(500).json({ error: error.message });
    }
});

// Debug Route 4: Direct password check
app.post('/api/debug/check-password', async (req, res) => {
    try {
        const { userId, password } = req.body;
        const bcrypt = require('bcryptjs');
        
        let user = await User.findOne({ userId });
        let collection = 'users';
        
        if (!user) {
            user = await Student.findOne({ enrollmentNo: userId });
            collection = 'students';
        }
        
        if (!user) {
            return res.json({
                exists: false,
                message: 'User not found'
            });
        }
        
        const isValid = await bcrypt.compare(password, user.password);
        
        res.json({
            exists: true,
            collection,
            userId: user.userId || user.enrollmentNo,
            name: user.name,
            role: user.role || 'student',
            passwordValid: isValid,
            storedHash: user.password.substring(0, 30) + '...',
            message: isValid ? '✅ Password correct!' : '❌ Password incorrect'
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// 🔴 DEBUG ROUTES - END
// ============================================

// Regular routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', teacherRoutes);
app.use('/api/admin', batchRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Attendance Management System API',
        status: 'running',
        debug: 'Use /api/debug/* for testing',
        endpoints: {
            debug: {
                users: '/api/debug/users',
                login: '/api/debug/login',
                createTestUsers: '/api/debug/create-test-users',
                checkPassword: '/api/debug/check-password'
            },
            auth: '/api/auth/login',
            attendance: '/api/attendance',
            admin: '/api/admin'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: err.message 
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 API available at http://localhost:${PORT}`);
    console.log(`🔧 Debug endpoints:`);
    console.log(`   - GET  /api/debug/users - List all users`);
    console.log(`   - POST /api/debug/login - Test login`);
    console.log(`   - GET  /api/debug/create-test-users - Create test users`);
    console.log(`   - POST /api/debug/check-password - Direct password check`);
});





















