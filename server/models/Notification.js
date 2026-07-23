const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    enrollmentNo: {
        type: String,
        required: true
    },
    parentName: {
        type: String,
        required: true
    },
    parentPhone: {
        type: String,
        required: true
    },
    parentEmail: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['email', 'sms', 'both'],
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
        default: 'pending'
    },
    sentAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);