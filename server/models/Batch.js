const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
    batchCode: {
        type: String,
        required: true,
        unique: true
    },
    batchName: {
        type: String,
        required: true
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    semester: {
        type: Number,
        required: true,
        enum: [1, 2, 3, 4, 5, 6, 7, 8]
    },
    classTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null  // Changed from required to optional
    },
    totalStudents: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Batch', BatchSchema);