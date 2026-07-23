// const User = require('../models/User');
// const Branch = require('../models/Branch');

// const seedAdmin = async () => {
//     try {
//         // Check if admin exists
//         const existingAdmin = await User.findOne({ userId: process.env.ADMIN_USER_ID || 'ADMIN001' });
        
//         if (!existingAdmin) {
//             const admin = new User({
//                 userId: process.env.ADMIN_USER_ID || 'ADMIN001',
//                 name: 'System Administrator',
//                 email: process.env.ADMIN_EMAIL || 'admin@attendance.com',
//                 password: process.env.ADMIN_PASSWORD || 'Admin@123456',
//                 role: 'admin',
//                 isActive: true
//             });
            
//             await admin.save();
//             console.log('✅ Admin user created successfully');
//         }
        
//         // Create default branches
//         const defaultBranches = [
//             { branchCode: 'CO', branchName: 'Computer Engineering', duration: 4 },
//             { branchCode: 'EE', branchName: 'Electrical Engineering', duration: 4 },
//             { branchCode: 'ME', branchName: 'Mechanical Engineering', duration: 4 },
//             { branchCode: 'CE', branchName: 'Civil Engineering', duration: 4 },
//             { branchCode: 'EX', branchName: 'Electronics Engineering', duration: 4 }
//         ];
        
//         for (const branchData of defaultBranches) {
//             const existing = await Branch.findOne({ branchCode: branchData.branchCode });
//             if (!existing) {
//                 await Branch.create(branchData);
//                 console.log(`✅ Branch created: ${branchData.branchName}`);
//             }
//         }
        
//         console.log('✅ Seed data initialization completed');
//     } catch (error) {
//         console.error('❌ Seed admin error:', error.message);
//     }
// };

// module.exports = seedAdmin;













const User = require('../models/User');
const Branch = require('../models/Branch');

const seedAdmin = async () => {
    try {
        console.log('🌱 Starting seed process...');
        
        // Check if admin exists
        const existingAdmin = await User.findOne({ userId: process.env.ADMIN_USER_ID || 'ADMIN001' });
        
        if (!existingAdmin) {
            console.log('👤 Creating admin user...');
            const admin = new User({
                userId: process.env.ADMIN_USER_ID || 'ADMIN001',
                name: 'System Administrator',
                email: process.env.ADMIN_EMAIL || 'admin@attendance.com',
                password: process.env.ADMIN_PASSWORD || 'Admin@123456',
                role: 'admin',
                isActive: true
            });
            
            const savedAdmin = await admin.save();
            console.log('✅ Admin user created successfully');
            console.log(`   ID: ${savedAdmin.userId}`);
            console.log(`   Email: ${savedAdmin.email}`);
        } else {
            console.log('ℹ️  Admin user already exists');
        }
        
        // Create default branches
        console.log('🏫 Creating default branches...');
        const defaultBranches = [
            { branchCode: 'CO', branchName: 'Computer Engineering', duration: 4 },
            { branchCode: 'EE', branchName: 'Electrical Engineering', duration: 4 },
            { branchCode: 'ME', branchName: 'Mechanical Engineering', duration: 4 },
            { branchCode: 'CE', branchName: 'Civil Engineering', duration: 4 },
            { branchCode: 'EX', branchName: 'Electronics Engineering', duration: 4 }
        ];
        
        for (const branchData of defaultBranches) {
            const existing = await Branch.findOne({ branchCode: branchData.branchCode });
            if (!existing) {
                await Branch.create(branchData);
                console.log(`   ✅ Created: ${branchData.branchName} (${branchData.branchCode})`);
            } else {
                console.log(`   ℹ️  Already exists: ${branchData.branchName} (${branchData.branchCode})`);
            }
        }
        
        console.log('✅ Seed data initialization completed successfully');
        
    } catch (error) {
        console.error('❌ Seed error details:', {
            message: error.message,
            stack: error.stack?.split('\n')[1]?.trim(),
            name: error.name
        });
        throw error; // Re-throw to be caught by server.js
    }
};

module.exports = seedAdmin;