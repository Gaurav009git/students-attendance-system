const mongoose = require('mongoose');

const BranchSchema = new mongoose.Schema({
    branchCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    branchName: {
        type: String,
        required: true,
        trim: true
    },
    duration: {
        type: Number,
        required: true,
        min: [1, 'Duration must be at least 1 year'],
        max: [6, 'Duration cannot exceed 6 years']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    totalBatches: {
        type: Number,
        default: 0
    },
    totalStudents: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Update branch stats middleware
BranchSchema.methods.updateStats = async function() {
    const Batch = require('./Batch');
    const Student = require('./Student');
    
    const batches = await Batch.countDocuments({ branch: this._id, isActive: true });
    const students = await Student.countDocuments({ branch: this._id, isActive: true });
    
    this.totalBatches = batches;
    this.totalStudents = students;
    await this.save();
};

module.exports = mongoose.model('Branch', BranchSchema);