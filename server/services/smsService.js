// Simulated SMS service - logs to console
const sendAttendanceSMS = async (phoneNumber, studentName, subject, date, status, attendancePercentage) => {
    console.log('\n📱 [SMS SIMULATED]');
    console.log('To:', phoneNumber);
    console.log('Message:', `${studentName} was ${status} in ${subject} on ${new Date(date).toLocaleDateString()}`);
    console.log('Attendance:', attendancePercentage + '%');
    console.log('📱 [SMS SIMULATED END]\n');
    
    return { 
        success: true, 
        simulated: true,
        message: 'SMS service simulated - no actual SMS sent'
    };
};

const sendWelcomeSMS = async (phoneNumber, name, userId, password, role) => {
    console.log('\n📱 [WELCOME SMS SIMULATED]');
    console.log('To:', phoneNumber);
    console.log('Message:', `Welcome ${name}! Your credentials - ID: ${userId}, Password: ${password}, Role: ${role}`);
    console.log('📱 [WELCOME SMS SIMULATED END]\n');
    
    return { 
        success: true, 
        simulated: true,
        message: 'Welcome SMS simulated - no actual SMS sent'
    };
};

module.exports = { sendAttendanceSMS, sendWelcomeSMS };