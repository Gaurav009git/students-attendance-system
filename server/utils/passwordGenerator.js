const crypto = require('crypto');

// Generate random password
const generatePassword = (length = 8) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';
    
    // Ensure at least one uppercase, one lowercase, one number, one special character
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[crypto.randomInt(26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[crypto.randomInt(26)];
    password += '0123456789'[crypto.randomInt(10)];
    password += '!@#$%'[crypto.randomInt(5)];
    
    // Fill remaining characters
    for (let i = password.length; i < length; i++) {
        password += charset[crypto.randomInt(charset.length)];
    }
    
    // Shuffle password
    return password.split('').sort(() => crypto.randomInt(-1, 2)).join('');
};

// Generate student ID
const generateStudentId = (branchCode, batchCode, serial) => {
    const year = new Date().getFullYear().toString().slice(-2);
    return `${branchCode}${batchCode}${year}${serial.toString().padStart(4, '0')}`;
};

// Generate teacher ID
const generateTeacherId = (branchCode, serial) => {
    return `TCH${branchCode}${serial.toString().padStart(3, '0')}`;
};

module.exports = { generatePassword, generateStudentId, generateTeacherId };