const User = require('../models/User');
const Branch = require('../models/Branch');
const Batch = require('../models/Batch');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const { generatePassword, generateTeacherId, generateStudentId } = require('../utils/passwordGenerator');
const { sendWelcomeEmail } = require('../services/emailService');
const { sendWelcomeSMS } = require('../services/smsService');
const PDFDocument = require('pdfkit');
const mongoose = require('mongoose');

// Temporary storage for newly created credentials
const tempCredentials = new Map();

// Dashboard Statistics
const getAdminDashboardStats = async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments({ isActive: true });
        const totalTeachers = await User.countDocuments({ role: 'teacher', isActive: true });
        const totalBranches = await Branch.countDocuments({ isActive: true });
        const totalBatches = await Batch.countDocuments({ isActive: true });
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayAttendance = await Attendance.countDocuments({
            date: { $gte: today }
        });
        
        // Get branch-wise stats
        const branches = await Branch.find({ isActive: true }).select('branchName totalBatches totalStudents');
        
        const recentActivities = await Attendance.find()
            .populate('student', 'name enrollmentNo')
            .populate('markedBy', 'name')
            .sort({ markedAt: -1 })
            .limit(10);
        
        res.json({
            success: true,
            statistics: {
                totalStudents,
                totalTeachers,
                totalBranches,
                totalBatches,
                todayAttendance
            },
            branchStats: branches,
            recentActivities
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Branch Management - Enhanced
const createBranch = async (req, res) => {
    try {
        const { branchCode, branchName, duration } = req.body;
        
        // Validate duration (1-6 years)
        if (duration < 1 || duration > 6) {
            return res.status(400).json({ 
                success: false, 
                error: 'Branch duration must be between 1 and 6 years' 
            });
        }
        
        // Check if branch code already exists
        const existingBranch = await Branch.findOne({ 
            $or: [
                { branchCode: branchCode.toUpperCase() },
                { branchName: { $regex: new RegExp(`^${branchName}$`, 'i') } }
            ]
        });
        
        if (existingBranch) {
            return res.status(400).json({ 
                success: false, 
                error: 'Branch code or name already exists' 
            });
        }
        
        const branch = new Branch({
            branchCode: branchCode.toUpperCase(),
            branchName,
            duration,
            createdBy: req.user.id,
            createdAt: new Date()
        });
        
        await branch.save();
        
        // Log activity
        console.log(`✅ Branch created: ${branchName} (${branchCode}) by ${req.user.name}`);
        
        res.status(201).json({ 
            success: true, 
            message: 'Branch created successfully',
            branch 
        });
    } catch (error) {
        console.error('Create branch error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getAllBranches = async (req, res) => {
    try {
        const branches = await Branch.find({ isActive: true })
            .populate('createdBy', 'name userId')
            .sort({ createdAt: -1 });
        
        // Calculate statistics for each branch
        const branchesWithStats = await Promise.all(branches.map(async (branch) => {
            const batches = await Batch.countDocuments({ branch: branch._id, isActive: true });
            const students = await Student.countDocuments({ branch: branch._id, isActive: true });
            
            return {
                ...branch.toObject(),
                totalBatches: batches,
                totalStudents: students
            };
        }));
        
        res.json({ 
            success: true, 
            branches: branchesWithStats 
        });
    } catch (error) {
        console.error('Get branches error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const updateBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const { branchName, duration, isActive } = req.body;
        
        // Validate duration
        if (duration && (duration < 1 || duration > 6)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Branch duration must be between 1 and 6 years' 
            });
        }
        
        const branch = await Branch.findByIdAndUpdate(
            id,
            { 
                branchName, 
                duration, 
                isActive,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).populate('createdBy', 'name userId');
        
        if (!branch) {
            return res.status(404).json({ success: false, error: 'Branch not found' });
        }
        
        // Update branch stats
        await branch.updateStats();
        
        res.json({ 
            success: true, 
            message: 'Branch updated successfully',
            branch 
        });
    } catch (error) {
        console.error('Update branch error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const deleteBranch = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if branch has active batches
        const activeBatches = await Batch.countDocuments({ branch: id, isActive: true });
        if (activeBatches > 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Cannot deactivate branch with active batches. Please deactivate batches first.' 
            });
        }
        
        // Check if branch has active students
        const activeStudents = await Student.countDocuments({ branch: id, isActive: true });
        if (activeStudents > 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Cannot deactivate branch with enrolled students.' 
            });
        }
        
        const branch = await Branch.findByIdAndUpdate(
            id, 
            { isActive: false },
            { new: true }
        );
        
        if (!branch) {
            return res.status(404).json({ success: false, error: 'Branch not found' });
        }
        
        res.json({ 
            success: true, 
            message: 'Branch deactivated successfully' 
        });
    } catch (error) {
        console.error('Delete branch error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Batch Management
const createBatch = async (req, res) => {
    try {
        const { batchCode, batchName, branch, year, semester, classTeacher } = req.body;
        
        if (!batchCode || !batchName || !branch || !year || !semester) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields' 
            });
        }
        
        const existingBatch = await Batch.findOne({ batchCode });
        if (existingBatch) {
            return res.status(400).json({ 
                success: false, 
                error: 'Batch code already exists' 
            });
        }
        
        const branchExists = await Branch.findById(branch);
        if (!branchExists) {
            return res.status(400).json({ 
                success: false, 
                error: 'Selected branch does not exist' 
            });
        }
        
        const batchData = {
            batchCode,
            batchName,
            branch,
            year: parseInt(year),
            semester: parseInt(semester)
        };
        
        if (classTeacher && mongoose.Types.ObjectId.isValid(classTeacher)) {
            const teacherExists = await User.findOne({ 
                _id: classTeacher, 
                role: 'teacher' 
            });
            if (teacherExists) {
                batchData.classTeacher = classTeacher;
            }
        }
        
        const batch = new Batch(batchData);
        await batch.save();
        
        if (batchData.classTeacher) {
            await User.findByIdAndUpdate(batchData.classTeacher, {
                $addToSet: { assignedBatches: batch._id }
            });
        }
        
        // Update branch stats
        await branchExists.updateStats();
        
        const populatedBatch = await Batch.findById(batch._id)
            .populate('branch', 'branchName branchCode')
            .populate('classTeacher', 'name userId email');
        
        res.status(201).json({ 
            success: true, 
            message: 'Batch created successfully',
            batch: populatedBatch 
        });
        
    } catch (error) {
        console.error('Create batch error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

const getAllBatches = async (req, res) => {
    try {
        const { branch, semester, isActive } = req.query;
        
        let query = {};
        if (branch) query.branch = branch;
        if (semester) query.semester = parseInt(semester);
        if (isActive !== undefined) query.isActive = isActive === 'true';
        
        const batches = await Batch.find(query)
            .populate('branch', 'branchName branchCode')
            .populate('classTeacher', 'name userId email')
            .sort({ createdAt: -1 });
        
        res.json({ 
            success: true, 
            batches 
        });
    } catch (error) {
        console.error('Get batches error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

const updateBatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { batchName, branch, year, semester, classTeacher, isActive } = req.body;
        
        const batch = await Batch.findById(id);
        if (!batch) {
            return res.status(404).json({ 
                success: false, 
                error: 'Batch not found' 
            });
        }
        
        let classTeacherId = batch.classTeacher;
        if (classTeacher !== undefined) {
            if (classTeacher && mongoose.Types.ObjectId.isValid(classTeacher)) {
                const teacherExists = await User.findOne({ 
                    _id: classTeacher, 
                    role: 'teacher' 
                });
                if (teacherExists) {
                    classTeacherId = classTeacher;
                }
            } else {
                classTeacherId = null;
            }
        }
        
        const updatedBatch = await Batch.findByIdAndUpdate(
            id,
            {
                batchName: batchName || batch.batchName,
                branch: branch || batch.branch,
                year: year || batch.year,
                semester: semester || batch.semester,
                classTeacher: classTeacherId,
                isActive: isActive !== undefined ? isActive : batch.isActive
            },
            { new: true, runValidators: true }
        ).populate('branch', 'branchName branchCode')
         .populate('classTeacher', 'name userId email');
        
        if (classTeacherId !== batch.classTeacher) {
            if (batch.classTeacher) {
                await User.findByIdAndUpdate(batch.classTeacher, {
                    $pull: { assignedBatches: id }
                });
            }
            
            if (classTeacherId) {
                await User.findByIdAndUpdate(classTeacherId, {
                    $addToSet: { assignedBatches: id }
                });
            }
        }
        
        res.json({ 
            success: true, 
            message: 'Batch updated successfully',
            batch: updatedBatch 
        });
        
    } catch (error) {
        console.error('Update batch error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

const deleteBatch = async (req, res) => {
    try {
        const { id } = req.params;
        
        const batch = await Batch.findById(id);
        if (!batch) {
            return res.status(404).json({ 
                success: false, 
                error: 'Batch not found' 
            });
        }
        
        const studentCount = await Student.countDocuments({ batch: id, isActive: true });
        if (studentCount > 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Cannot delete batch with enrolled students' 
            });
        }
        
        if (batch.classTeacher) {
            await User.findByIdAndUpdate(batch.classTeacher, {
                $pull: { assignedBatches: id }
            });
        }
        
        batch.isActive = false;
        await batch.save();
        
        // Update branch stats
        const branch = await Branch.findById(batch.branch);
        if (branch) {
            await branch.updateStats();
        }
        
        res.json({ 
            success: true, 
            message: 'Batch deactivated successfully' 
        });
        
    } catch (error) {
        console.error('Delete batch error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

// Teacher Management
const getAllTeachers = async (req, res) => {
    try {
        const teachers = await User.find({ role: 'teacher' })
            .select('-password')
            .populate('branch', 'branchName branchCode')
            .populate('assignedBatches', 'batchCode batchName')
            .sort({ createdAt: -1 });
        
        res.json({ 
            success: true, 
            teachers 
        });
    } catch (error) {
        console.error('Get teachers error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

const createTeacher = async (req, res) => {
    try {
        const { name, email, phoneNumber, branch, assignedBatches } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email already exists' 
            });
        }
        
        const teacherCount = await User.countDocuments({ role: 'teacher' });
        const branchData = await Branch.findById(branch);
        
        if (!branchData) {
            return res.status(400).json({ 
                success: false, 
                error: 'Branch not found' 
            });
        }
        
        const userId = generateTeacherId(branchData.branchCode, teacherCount + 1);
        const originalPassword = generatePassword(10);
        
        const teacher = new User({
            userId,
            name,
            email,
            password: originalPassword,
            phoneNumber,
            role: 'teacher',
            branch,
            assignedBatches: assignedBatches || []
        });
        
        await teacher.save();
        
        tempCredentials.set(teacher._id.toString(), {
            userId,
            password: originalPassword,
            timestamp: Date.now()
        });
        
        // Clean up old entries
        for (const [key, value] of tempCredentials.entries()) {
            if (Date.now() - value.timestamp > 3600000) {
                tempCredentials.delete(key);
            }
        }
        
        await sendWelcomeEmail(email, name, userId, originalPassword, 'teacher');
        
        if (phoneNumber) {
            await sendWelcomeSMS(phoneNumber, name, userId, originalPassword, 'teacher');
        }
        
        const createdTeacher = await User.findById(teacher._id)
            .select('-password')
            .populate('branch', 'branchName branchCode');
        
        res.status(201).json({
            success: true,
            message: 'Teacher created successfully',
            teacher: createdTeacher,
            credentials: {
                userId,
                password: originalPassword
            }
        });
    } catch (error) {
        console.error('Create teacher error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phoneNumber, branch, isActive } = req.body;
        
        const teacher = await User.findByIdAndUpdate(
            id,
            { name, email, phoneNumber, branch, isActive },
            { new: true, runValidators: true }
        ).select('-password')
         .populate('branch', 'branchName branchCode');
        
        if (!teacher) {
            return res.status(404).json({ 
                success: false, 
                error: 'Teacher not found' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Teacher updated successfully',
            teacher 
        });
    } catch (error) {
        console.error('Update teacher error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

const deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        
        const teacher = await User.findById(id);
        if (!teacher) {
            return res.status(404).json({ 
                success: false, 
                error: 'Teacher not found' 
            });
        }
        
        if (teacher.assignedBatches && teacher.assignedBatches.length > 0) {
            await Batch.updateMany(
                { _id: { $in: teacher.assignedBatches } },
                { $set: { classTeacher: null } }
            );
        }
        
        teacher.isActive = false;
        await teacher.save();
        
        res.json({ 
            success: true, 
            message: 'Teacher deactivated successfully' 
        });
    } catch (error) {
        console.error('Delete teacher error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

// ✅ FIXED: Enhanced Teacher PDF with better formatting
const generateTeacherPDF = async (req, res) => {
    try {
        const { teacherId } = req.params;
        
        let teacher = await User.findById(teacherId)
            .populate('branch', 'branchName')
            .populate('assignedBatches', 'batchName batchCode');
        
        if (!teacher) {
            teacher = await User.findOne({ userId: teacherId })
                .populate('branch', 'branchName')
                .populate('assignedBatches', 'batchName batchCode');
        }
        
        if (!teacher) {
            return res.status(404).json({ 
                success: false, 
                error: 'Teacher not found' 
            });
        }
        
        // Get password from temporary storage
        let password = '********';
        const tempData = tempCredentials.get(teacher._id.toString());
        if (tempData) {
            password = tempData.password;
        }
        
        const branchData = teacher.branch;
        const currentDate = new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        // Create PDF document with better layout
        const doc = new PDFDocument({
            margin: 50,
            size: 'A4',
            info: {
                Title: `Teacher Credentials - ${teacher.name}`,
                Author: 'Smart Attendance System',
                Subject: 'Login Credentials'
            }
        });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Teacher_${teacher.userId}_Credentials.pdf`);
        
        // Pipe PDF to response
        doc.pipe(res);
        
        // Add decorative header
        doc.rect(0, 0, doc.page.width, 60).fill('#667eea');
        doc.fillColor('#ffffff')
           .fontSize(24)
           .font('Helvetica-Bold')
           .text('Smart Attendance System', 50, 15, { align: 'center' });
        
        doc.moveDown(4);
        
        // Add title
        doc.fillColor('#333333')
           .fontSize(20)
           .font('Helvetica-Bold')
           .text('Teacher Login Credentials', { align: 'center', underline: true });
        
        doc.moveDown(2);
        
        // Add generation info
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#666666')
           .text(`Generated on: ${currentDate}`, { align: 'right' })
           .text(`Valid until: ${new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString('en-IN')}`, { align: 'right' });
        
        doc.moveDown(2);
        
        // Draw a line
        doc.moveTo(50, doc.y)
           .lineTo(doc.page.width - 50, doc.y)
           .strokeColor('#cccccc')
           .stroke();
        
        doc.moveDown(2);
        
        // Personal Information Section
        doc.fillColor('#667eea')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('📋 PERSONAL INFORMATION', 50, doc.y);
        
        doc.moveDown();
        
        // Create a table-like structure
        const startY = doc.y;
        const col1 = 70;
        const col2 = 200;
        const col3 = 300;
        const col4 = 450;
        
        doc.fontSize(11)
           .font('Helvetica');
        
        // Row 1
        doc.fillColor('#333333')
           .text('Full Name:', col1, startY)
           .text(teacher.name, col2, startY);
        
        // Row 2
        doc.text('Teacher ID:', col1, startY + 25)
           .text(teacher.userId, col2, startY + 25)
           .text('Email:', col3, startY + 25)
           .text(teacher.email, col4, startY + 25);
        
        // Row 3
        doc.text('Phone:', col1, startY + 50)
           .text(teacher.phoneNumber || 'N/A', col2, startY + 50)
           .text('Branch:', col3, startY + 50)
           .text(branchData ? branchData.branchName : 'N/A', col4, startY + 50);
        
        // Row 4
        doc.text('Assigned Batches:', col1, startY + 75)
           .text(teacher.assignedBatches && teacher.assignedBatches.length > 0 
               ? teacher.assignedBatches.map(b => b.batchCode).join(', ') 
               : 'None', col2, startY + 75, { width: 300 });
        
        doc.moveDown(6);
        
        // Login Credentials Section
        doc.fillColor('#667eea')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('🔐 LOGIN CREDENTIALS', 50, doc.y + 20);
        
        doc.moveDown();
        
        // Create credentials box
        const credBoxY = doc.y;
        doc.roundedRect(50, credBoxY, 500, 100, 10)
           .fillAndStroke('#f0f4ff', '#667eea');
        
        doc.fillColor('#333333')
           .fontSize(12)
           .font('Helvetica');
        
        doc.text('User ID:', 70, credBoxY + 20)
           .fillColor('#667eea')
           .font('Helvetica-Bold')
           .fontSize(14)
           .text(teacher.userId, 150, credBoxY + 17);
        
        doc.fillColor('#333333')
           .fontSize(12)
           .font('Helvetica')
           .text('Password:', 70, credBoxY + 45)
           .fillColor('#e53e3e')
           .font('Helvetica-Bold')
           .fontSize(14)
           .text(password, 150, credBoxY + 42);
        
        doc.fillColor('#333333')
           .fontSize(10)
           .font('Helvetica')
           .text('(Keep this password safe and confidential)', 70, credBoxY + 70, {
               color: '#666666',
               italic: true
           });
        
        doc.moveDown(6);
        
        // Important Instructions
        doc.fillColor('#667eea')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('⚠️ IMPORTANT INSTRUCTIONS', 50, doc.y + 30);
        
        doc.moveDown();
        
        const instructions = [
            '1. Use the above User ID and Password to login to the Smart Attendance System.',
            '2. Change your password immediately after your first login for security.',
            '3. Never share your credentials with anyone.',
            '4. If you forget your password, use the "Forgot Password" option on the login page.',
            '5. For any technical issues, contact the system administrator.',
            '6. This document contains sensitive information. Store it securely.'
        ];
        
        doc.fillColor('#333333')
           .fontSize(10)
           .font('Helvetica');
        
        let yPos = doc.y;
        instructions.forEach((instruction) => {
            doc.text(instruction, 70, yPos, {
                width: 450,
                align: 'left',
                lineGap: 5
            });
            yPos = doc.y + 5;
        });
        
        // Add footer
        doc.moveDown(4);
        doc.moveTo(50, doc.page.height - 100)
           .lineTo(doc.page.width - 50, doc.page.height - 100)
           .strokeColor('#cccccc')
           .stroke();
        
        doc.fontSize(8)
           .fillColor('#999999')
           .text(
               'This is an automatically generated document. Valid only for authorized personnel.',
               50,
               doc.page.height - 80,
               { align: 'center', width: 500 }
           )
           .text(
               `© ${new Date().getFullYear()} Smart Attendance System. All rights reserved.`,
               50,
               doc.page.height - 65,
               { align: 'center', width: 500 }
           );
        
        doc.end();
        
    } catch (error) {
        console.error('Generate teacher PDF error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

// Student Management
const getAllStudents = async (req, res) => {
    try {
        const { branch, batch, semester, search } = req.query;
        
        let query = { isActive: true };
        
        if (branch) query.branch = branch;
        if (batch) query.batch = batch;
        if (semester) query.semester = parseInt(semester);
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { enrollmentNo: { $regex: search, $options: 'i' } }
            ];
        }
        
        const students = await Student.find(query)
            .populate('branch', 'branchName branchCode')
            .populate('batch', 'batchName batchCode semester')
            .sort({ createdAt: -1 });
        
        res.json({ success: true, students });
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const createStudent = async (req, res) => {
    try {
        const {
            name, email, branch, batch, semester,
            phoneNumber, parentName, parentPhone, parentEmail,
            address, dateOfBirth, gender
        } = req.body;
        
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email already exists' 
            });
        }
        
        const branchData = await Branch.findById(branch);
        const batchData = await Batch.findById(batch);
        
        if (!branchData || !batchData) {
            return res.status(400).json({ 
                success: false, 
                error: 'Branch or Batch not found' 
            });
        }
        
        const studentCount = await Student.countDocuments({ branch, batch });
        const enrollmentNo = generateStudentId(
            branchData.branchCode,
            batchData.batchCode,
            studentCount + 1
        );
        
        const originalPassword = generatePassword(8);
        
        const student = new Student({
            enrollmentNo,
            name,
            email,
            password: originalPassword,
            role: 'student',
            branch,
            batch,
            semester: parseInt(semester),
            phoneNumber,
            parentName,
            parentPhone,
            parentEmail,
            address,
            dateOfBirth: new Date(dateOfBirth),
            gender
        });
        
        await student.save();
        
        tempCredentials.set(student._id.toString(), {
            enrollmentNo,
            password: originalPassword,
            timestamp: Date.now()
        });
        
        await Batch.findByIdAndUpdate(batch, {
            $inc: { totalStudents: 1 }
        });
        
        // Update branch stats
        await branchData.updateStats();
        
        await sendWelcomeEmail(email, name, enrollmentNo, originalPassword, 'student');
        
        if (phoneNumber) {
            await sendWelcomeSMS(phoneNumber, name, enrollmentNo, originalPassword, 'student');
        }
        
        if (parentPhone) {
            await sendWelcomeSMS(parentPhone, parentName, enrollmentNo, originalPassword, 'parent');
        }
        
        const createdStudent = await Student.findById(student._id)
            .populate('branch', 'branchName branchCode')
            .populate('batch', 'batchName batchCode');
        
        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            student: createdStudent,
            credentials: {
                enrollmentNo,
                password: originalPassword
            }
        });
    } catch (error) {
        console.error('Create student error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phoneNumber, semester, isActive, parentName, parentPhone, parentEmail, address } = req.body;
        
        const student = await Student.findByIdAndUpdate(
            id,
            { name, phoneNumber, semester, isActive, parentName, parentPhone, parentEmail, address },
            { new: true, runValidators: true }
        ).populate('branch', 'branchName branchCode')
         .populate('batch', 'batchName batchCode');
        
        if (!student) {
            return res.status(404).json({ 
                success: false, 
                error: 'Student not found' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Student updated successfully',
            student 
        });
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ 
                success: false, 
                error: 'Student not found' 
            });
        }
        
        await Batch.findByIdAndUpdate(student.batch, {
            $inc: { totalStudents: -1 }
        });
        
        // Update branch stats
        const branch = await Branch.findById(student.branch);
        if (branch) {
            await branch.updateStats();
        }
        
        student.isActive = false;
        await student.save();
        
        res.json({ 
            success: true, 
            message: 'Student deactivated successfully' 
        });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

// ✅ FIXED: Enhanced Student PDF with better formatting
const generateStudentPDF = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        let student = await Student.findById(studentId)
            .populate('branch', 'branchName')
            .populate('batch', 'batchName');
        
        if (!student) {
            student = await Student.findOne({ enrollmentNo: studentId })
                .populate('branch', 'branchName')
                .populate('batch', 'batchName');
        }
        
        if (!student) {
            return res.status(404).json({ 
                success: false, 
                error: 'Student not found' 
            });
        }
        
        // Get password from temporary storage
        let password = '********';
        const tempData = tempCredentials.get(student._id.toString());
        if (tempData) {
            password = tempData.password;
        }
        
        const branchData = student.branch;
        const batchData = student.batch;
        const currentDate = new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        // Create PDF document with better layout
        const doc = new PDFDocument({
            margin: 50,
            size: 'A4',
            info: {
                Title: `Student Credentials - ${student.name}`,
                Author: 'Smart Attendance System',
                Subject: 'Login Credentials'
            }
        });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Student_${student.enrollmentNo}_Credentials.pdf`);
        
        // Pipe PDF to response
        doc.pipe(res);
        
        // Add decorative header
        doc.rect(0, 0, doc.page.width, 60).fill('#48bb78');
        doc.fillColor('#ffffff')
           .fontSize(24)
           .font('Helvetica-Bold')
           .text('Smart Attendance System', 50, 15, { align: 'center' });
        
        doc.moveDown(4);
        
        // Add title
        doc.fillColor('#333333')
           .fontSize(20)
           .font('Helvetica-Bold')
           .text('Student Login Credentials', { align: 'center', underline: true });
        
        doc.moveDown(2);
        
        // Add generation info
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#666666')
           .text(`Generated on: ${currentDate}`, { align: 'right' })
           .text(`Valid until: ${new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString('en-IN')}`, { align: 'right' });
        
        doc.moveDown(2);
        
        // Draw a line
        doc.moveTo(50, doc.y)
           .lineTo(doc.page.width - 50, doc.y)
           .strokeColor('#cccccc')
           .stroke();
        
        doc.moveDown(2);
        
        // Student Information Section
        doc.fillColor('#48bb78')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('📋 STUDENT INFORMATION', 50, doc.y);
        
        doc.moveDown();
        
        // Create a table-like structure
        const startY = doc.y;
        const col1 = 70;
        const col2 = 200;
        const col3 = 300;
        const col4 = 450;
        
        doc.fontSize(11)
           .font('Helvetica');
        
        // Row 1
        doc.fillColor('#333333')
           .text('Full Name:', col1, startY)
           .text(student.name, col2, startY);
        
        // Row 2
        doc.text('Enrollment No:', col1, startY + 25)
           .text(student.enrollmentNo, col2, startY + 25)
           .text('Email:', col3, startY + 25)
           .text(student.email, col4, startY + 25);
        
        // Row 3
        doc.text('Phone:', col1, startY + 50)
           .text(student.phoneNumber, col2, startY + 50)
           .text('Branch:', col3, startY + 50)
           .text(branchData ? branchData.branchName : 'N/A', col4, startY + 50);
        
        // Row 4
        doc.text('Batch:', col1, startY + 75)
           .text(batchData ? batchData.batchName : 'N/A', col2, startY + 75)
           .text('Semester:', col3, startY + 75)
           .text(student.semester.toString(), col4, startY + 75);
        
        // Row 5
        doc.text('Gender:', col1, startY + 100)
           .text(student.gender, col2, startY + 100)
           .text('DOB:', col3, startY + 100)
           .text(new Date(student.dateOfBirth).toLocaleDateString('en-IN'), col4, startY + 100);
        
        doc.moveDown(8);
        
        // Parent Information Section
        doc.fillColor('#48bb78')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('👪 PARENT/GUARDIAN INFORMATION', 50, doc.y + 20);
        
        doc.moveDown();
        
        const parentY = doc.y;
        
        doc.fontSize(11)
           .font('Helvetica');
        
        doc.text('Parent Name:', col1, parentY)
           .text(student.parentName, col2, parentY);
        
        doc.text('Parent Phone:', col1, parentY + 25)
           .text(student.parentPhone, col2, parentY + 25);
        
        doc.text('Parent Email:', col1, parentY + 50)
           .text(student.parentEmail, col2, parentY + 50, { width: 300 });
        
        doc.text('Address:', col1, parentY + 75)
           .text(student.address, col2, parentY + 75, { width: 350 });
        
        doc.moveDown(6);
        
        // Login Credentials Section
        doc.fillColor('#48bb78')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('🔐 LOGIN CREDENTIALS', 50, doc.y + 20);
        
        doc.moveDown();
        
        // Create credentials box
        const credBoxY = doc.y;
        doc.roundedRect(50, credBoxY, 500, 100, 10)
           .fillAndStroke('#f0f9f0', '#48bb78');
        
        doc.fillColor('#333333')
           .fontSize(12)
           .font('Helvetica');
        
        doc.text('Enrollment No:', 70, credBoxY + 20)
           .fillColor('#48bb78')
           .font('Helvetica-Bold')
           .fontSize(14)
           .text(student.enrollmentNo, 170, credBoxY + 17);
        
        doc.fillColor('#333333')
           .fontSize(12)
           .font('Helvetica')
           .text('Password:', 70, credBoxY + 45)
           .fillColor('#e53e3e')
           .font('Helvetica-Bold')
           .fontSize(14)
           .text(password, 170, credBoxY + 42);
        
        doc.fillColor('#333333')
           .fontSize(10)
           .font('Helvetica')
           .text('(Keep this password safe and confidential)', 70, credBoxY + 70, {
               color: '#666666',
               italic: true
           });
        
        doc.moveDown(6);
        
        // Important Instructions
        doc.fillColor('#48bb78')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('⚠️ IMPORTANT INSTRUCTIONS', 50, doc.y + 30);
        
        doc.moveDown();
        
        const instructions = [
            '1. Use the above Enrollment No and Password to login to the Smart Attendance System.',
            '2. Change your password immediately after your first login for security.',
            '3. Never share your credentials with anyone.',
            '4. Parents will receive SMS/Email notifications for attendance updates.',
            '5. For any technical issues, contact the system administrator.',
            '6. This document contains sensitive information. Store it securely.'
        ];
        
        doc.fillColor('#333333')
           .fontSize(10)
           .font('Helvetica');
        
        let yPos = doc.y;
        instructions.forEach((instruction) => {
            doc.text(instruction, 70, yPos, {
                width: 450,
                align: 'left',
                lineGap: 5
            });
            yPos = doc.y + 5;
        });
        
        // Add footer
        doc.moveDown(4);
        doc.moveTo(50, doc.page.height - 100)
           .lineTo(doc.page.width - 50, doc.page.height - 100)
           .strokeColor('#cccccc')
           .stroke();
        
        doc.fontSize(8)
           .fillColor('#999999')
           .text(
               'This is an automatically generated document. Valid only for authorized personnel.',
               50,
               doc.page.height - 80,
               { align: 'center', width: 500 }
           )
           .text(
               `© ${new Date().getFullYear()} Smart Attendance System. All rights reserved.`,
               50,
               doc.page.height - 65,
               { align: 'center', width: 500 }
           );
        
        doc.end();
        
    } catch (error) {
        console.error('Generate student PDF error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

// Export all functions
module.exports = {
    getAdminDashboardStats,
    createBranch,
    getAllBranches,
    updateBranch,
    deleteBranch,
    createBatch,
    getAllBatches,
    updateBatch,
    deleteBatch,
    getAllTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    generateTeacherPDF,
    getAllStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    generateStudentPDF
};