const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const { sendAttendanceEmail } = require('../services/emailService');
const { sendAttendanceSMS } = require('../services/smsService');

const markAttendance = async (req, res) => {
    try {
        const { enrollmentNo, subject, date, status, remarks } = req.body;
        
        const student = await Student.findOne({ enrollmentNo })
            .populate('branch')
            .populate('batch');
            
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        const existingAttendance = await Attendance.findOne({
            student: student._id,
            subject,
            date: new Date(date)
        });
        
        let attendance;
        if (existingAttendance) {
            existingAttendance.status = status;
            existingAttendance.remarks = remarks;
            existingAttendance.markedBy = req.user.id;
            attendance = await existingAttendance.save();
        } else {
            attendance = new Attendance({
                student: student._id,
                enrollmentNo: student.enrollmentNo,
                studentName: student.name,
                branch: student.branch._id,
                batch: student.batch._id,
                semester: student.semester,
                subject,
                date: new Date(date),
                status,
                remarks,
                markedBy: req.user.id
            });
            await attendance.save();
        }
        
        const attendanceRecords = await Attendance.find({
            student: student._id
        });
        
        const totalClasses = attendanceRecords.length;
        const presentCount = attendanceRecords.filter(a => a.status === 'Present').length;
        const lateCount = attendanceRecords.filter(a => a.status === 'Late').length;
        const attendancePercentage = totalClasses > 0
            ? ((presentCount + lateCount * 0.5) / totalClasses * 100).toFixed(2)
            : 0;
        
        if (status !== 'Present' || attendancePercentage < 75) {
            await sendAttendanceEmail(
                student.parentEmail,
                student.name,
                subject,
                date,
                status,
                attendancePercentage
            );
            
            await sendAttendanceSMS(
                student.parentPhone,
                student.name,
                subject,
                date,
                status,
                attendancePercentage
            );
            
            const notification = new Notification({
                student: student._id,
                enrollmentNo: student.enrollmentNo,
                parentName: student.parentName,
                parentPhone: student.parentPhone,
                parentEmail: student.parentEmail,
                type: 'both',
                subject,
                message: `Attendance Update: ${student.name} was ${status} in ${subject}`,
                status: 'sent',
                sentAt: new Date()
            });
            await notification.save();
            
            attendance.notificationSent = true;
            await attendance.save();
        }
        
        res.status(201).json({
            success: true,
            message: 'Attendance marked successfully',
            attendance,
            attendancePercentage
        });
    } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).json({ error: error.message });
    }
};

const getStudentAttendance = async (req, res) => {
    try {
        const studentId = req.params.studentId || req.user.userId;
        
        const student = await Student.findOne({ enrollmentNo: studentId });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        const attendance = await Attendance.find({ student: student._id })
            .populate('markedBy', 'name userId')
            .sort({ date: -1 });
        
        const totalClasses = attendance.length;
        const presentCount = attendance.filter(a => a.status === 'Present').length;
        const absentCount = attendance.filter(a => a.status === 'Absent').length;
        const lateCount = attendance.filter(a => a.status === 'Late').length;
        
        const percentage = totalClasses > 0
            ? ((presentCount + lateCount * 0.5) / totalClasses * 100).toFixed(2)
            : 0;
        
        const subjectWise = {};
        attendance.forEach(record => {
            if (!subjectWise[record.subject]) {
                subjectWise[record.subject] = {
                    total: 0,
                    present: 0,
                    absent: 0,
                    late: 0,
                    percentage: 0
                };
            }
            subjectWise[record.subject].total++;
            subjectWise[record.subject][record.status.toLowerCase()]++;
        });
        
        Object.keys(subjectWise).forEach(subject => {
            const s = subjectWise[subject];
            s.percentage = s.total > 0
                ? ((s.present + s.late * 0.5) / s.total * 100).toFixed(2)
                : 0;
        });
        
        const notifications = await Notification.find({ student: student._id })
            .sort({ createdAt: -1 })
            .limit(10);
        
        res.json({
            success: true,
            student: {
                name: student.name,
                enrollmentNo: student.enrollmentNo,
                branch: student.branch,
                batch: student.batch,
                semester: student.semester,
                parentName: student.parentName,
                parentPhone: student.parentPhone,
                parentEmail: student.parentEmail
            },
            attendance,
            statistics: {
                totalClasses,
                presentCount,
                absentCount,
                lateCount,
                attendancePercentage: percentage
            },
            subjectWise,
            notifications
        });
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ error: error.message });
    }
};

const getAllAttendance = async (req, res) => {
    try {
        const { subject, date, branch, batch } = req.query;
        
        let query = {};
        if (subject) query.subject = subject;
        if (date) query.date = new Date(date);
        if (branch) query.branch = branch;
        if (batch) query.batch = batch;
        
        const attendance = await Attendance.find(query)
            .populate('student', 'name enrollmentNo')
            .populate('markedBy', 'name')
            .sort({ date: -1 })
            .limit(200);
        
        res.json({ success: true, attendance });
    } catch (error) {
        console.error('Get all attendance error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { markAttendance, getStudentAttendance, getAllAttendance };