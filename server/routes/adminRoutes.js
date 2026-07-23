const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

// All admin routes are protected and require admin role
router.use(authMiddleware, isAdmin);

// Dashboard
router.get('/dashboard', getAdminDashboardStats);

// Branch Management
router.post('/branches', createBranch);
router.get('/branches', getAllBranches);
router.put('/branches/:id', updateBranch);
router.delete('/branches/:id', deleteBranch);

// Batch Management
router.post('/batches', createBatch);
router.get('/batches', getAllBatches);
router.put('/batches/:id', updateBatch);
router.delete('/batches/:id', deleteBatch);

// Teacher Management
router.post('/teachers', createTeacher);
router.get('/teachers', getAllTeachers);
router.put('/teachers/:id', updateTeacher);
router.delete('/teachers/:id', deleteTeacher);
router.get('/teachers/:teacherId/pdf', generateTeacherPDF);

// Student Management
router.post('/students', createStudent);
router.get('/students', getAllStudents);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);
router.get('/students/:studentId/pdf', generateStudentPDF);

module.exports = router;