const User = require('../models/User');

const seedUsers = async () => {
    try {
        // Check if users already exist
        const existingTeacher = await User.findOne({ userId: 'T001' });
        const existingStudent = await User.findOne({ userId: 'S001' });
        
        if (!existingTeacher) {
            // Create teacher
            const teacher = new User({
                userId: 'T001',
                name: 'Dr. Smith',
                email: 'teacher@school.com',
                password: 'teacher123',
                role: 'teacher'
            });
            await teacher.save();
            console.log('✅ Teacher user created: T001 / teacher123');
        }
        
        if (!existingStudent) {
            // Create student
            const student = new User({
                userId: 'S001',
                name: 'John Doe',
                email: 'student@school.com',
                password: 'student123',
                role: 'student'
            });
            await student.save();
            console.log('✅ Student user created: S001 / student123');
            
            // Create more sample students
            const sampleStudents = [
                { userId: 'S002', name: 'Jane Smith', email: 'jane@school.com', password: 'student123', role: 'student' },
                { userId: 'S003', name: 'Bob Johnson', email: 'bob@school.com', password: 'student123', role: 'student' },
                { userId: 'S004', name: 'Alice Brown', email: 'alice@school.com', password: 'student123', role: 'student' },
            ];
            
            for (const studentData of sampleStudents) {
                const exists = await User.findOne({ userId: studentData.userId });
                if (!exists) {
                    const newStudent = new User(studentData);
                    await newStudent.save();
                    console.log(`✅ Student user created: ${studentData.userId} / student123`);
                }
            }
        }
        
        // Verify users were created
        const userCount = await User.countDocuments();
        console.log(`📊 Total users in database: ${userCount}`);
        return true;
        
    } catch (error) {
        console.error('❌ Seed users error:', error.message);
        return false;
    }
};

module.exports = seedUsers;