const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const User = require('../models/User');
const Student = require('../models/Student');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

// Get all batches with filters
router.get('/batches', authMiddleware, isAdmin, async (req, res) => {
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
        console.error('Error fetching batches:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Get single batch
router.get('/batches/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id)
            .populate('branch', 'branchName branchCode')
            .populate('classTeacher', 'name userId email');
        
        if (!batch) {
            return res.status(404).json({ 
                success: false, 
                error: 'Batch not found' 
            });
        }
        
        res.json({
            success: true,
            batch
        });
    } catch (error) {
        console.error('Error fetching batch:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Update batch
router.put('/batches/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { batchCode, batchName, branch, year, semester, classTeacher, isActive } = req.body;
        
        const batch = await Batch.findById(id);
        if (!batch) {
            return res.status(404).json({ 
                success: false, 
                error: 'Batch not found' 
            });
        }
        
        // Handle classTeacher update
        let classTeacherId = batch.classTeacher;
        if (classTeacher !== undefined) {
            if (classTeacher && classTeacher.trim() !== '') {
                // Check if teacher exists
                const teacherExists = await User.findById(classTeacher);
                if (teacherExists) {
                    classTeacherId = classTeacher;
                }
            } else {
                classTeacherId = null;
            }
        }
        
        // Update batch
        const updatedBatch = await Batch.findByIdAndUpdate(
            id,
            {
                batchCode: batchCode || batch.batchCode,
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
        
        // Update teacher's assigned batches if class teacher changed
        if (classTeacherId !== batch.classTeacher) {
            // Remove from old teacher
            if (batch.classTeacher) {
                await User.findByIdAndUpdate(batch.classTeacher, {
                    $pull: { assignedBatches: id }
                });
            }
            
            // Add to new teacher
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
});

// Delete batch (soft delete)
router.delete('/batches/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        const batch = await Batch.findById(id);
        if (!batch) {
            return res.status(404).json({ 
                success: false, 
                error: 'Batch not found' 
            });
        }
        
        // Check if batch has students
        const studentCount = await Student.countDocuments({ batch: id });
        
        if (studentCount > 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Cannot delete batch with enrolled students' 
            });
        }
        
        // Remove from teacher's assigned batches
        if (batch.classTeacher) {
            await User.findByIdAndUpdate(batch.classTeacher, {
                $pull: { assignedBatches: id }
            });
        }
        
        // Soft delete
        batch.isActive = false;
        await batch.save();
        
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
});

module.exports = router;