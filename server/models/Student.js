// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const StudentSchema = new mongoose.Schema({
//     enrollmentNo: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     name: {
//         type: String,
//         required: true
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     password: {
//         type: String,
//         required: true
//     },
//     role: {
//         type: String,
//         default: 'student'
//     },
//     branch: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Branch',
//         required: true
//     },
//     batch: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Batch',
//         required: true
//     },
//     semester: {
//         type: Number,
//         required: true
//     },
//     phoneNumber: {
//         type: String,
//         required: true
//     },
//     parentName: {
//         type: String,
//         required: true
//     },
//     parentPhone: {
//         type: String,
//         required: true
//     },
//     parentEmail: {
//         type: String,
//         required: true
//     },
//     address: {
//         type: String,
//         required: true
//     },
//     dateOfBirth: {
//         type: Date,
//         required: true
//     },
//     gender: {
//         type: String,
//         enum: ['Male', 'Female', 'Other'],
//         required: true
//     },
//     isActive: {
//         type: Boolean,
//         default: true
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// });

// // Hash password before saving
// StudentSchema.pre('save', async function(next) {
//     if (!this.isModified('password')) return next();
    
//     try {
//         const salt = await bcrypt.genSalt(12);
//         this.password = await bcrypt.hash(this.password, salt);
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

// // Compare password method
// StudentSchema.methods.comparePassword = async function(candidatePassword) {
//     return await bcrypt.compare(candidatePassword, this.password);
// };

// module.exports = mongoose.model('Student', StudentSchema);



























const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const StudentSchema = new mongoose.Schema({
    enrollmentNo: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'student'
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    phoneNumber: {
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
    address: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving - Fixed: No next parameter needed
StudentSchema.pre('save', async function() {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

// Compare password method
StudentSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Student', StudentSchema);