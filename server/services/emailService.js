// Simulated email service - logs to console
const sendAttendanceEmail = async (parentEmail, studentName, subject, date, status, attendancePercentage) => {
    console.log('\n📧 [EMAIL SIMULATED]');
    console.log('To:', parentEmail);
    console.log('Subject:', `Attendance Update: ${studentName}`);
    console.log('Message:', `${studentName} was ${status} in ${subject} on ${new Date(date).toLocaleDateString()}`);
    console.log('Attendance Percentage:', attendancePercentage + '%');
    console.log('📧 [EMAIL SIMULATED END]\n');
    
    return { 
        success: true, 
        simulated: true,
        message: 'Email service simulated - no actual email sent'
    };
};

const sendWelcomeEmail = async (email, name, userId, password, role) => {
    console.log('\n📧 [WELCOME EMAIL SIMULATED]');
    console.log('To:', email);
    console.log('Subject:', 'Welcome to Smart Attendance System');
    console.log('Message:', `Welcome ${name}! Your credentials - ID: ${userId}, Password: ${password}, Role: ${role}`);
    console.log('📧 [WELCOME EMAIL SIMULATED END]\n');
    
    return { 
        success: true, 
        simulated: true,
        message: 'Welcome email simulated - no actual email sent'
    };
};

module.exports = { sendAttendanceEmail, sendWelcomeEmail };