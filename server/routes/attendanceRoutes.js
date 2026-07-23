const express = require('express');
const router = express.Router();
const { 
    markAttendance, 
    getStudentAttendance, 
    getAllAttendance 
} = require('../controllers/attendanceController');
const { authMiddleware, isTeacher, isStudent } = require('../middleware/authMiddleware');

router.post('/mark', authMiddleware, isTeacher, markAttendance);
router.get('/all', authMiddleware, isTeacher, getAllAttendance);
router.get('/student', authMiddleware, getStudentAttendance);
router.get('/student/:studentId', authMiddleware, getStudentAttendance);

module.exports = router;