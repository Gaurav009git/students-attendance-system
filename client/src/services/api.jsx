import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth Service
export const authService = {
    login: async (userId, password) => {
        try {
            console.log('Attempting login for:', userId);
            const response = await api.post('/auth/login', { userId, password });
            console.log('Login response:', response.data);
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            throw error;
        }
    },
    
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};

// Admin Service
export const adminService = {
    getDashboardStats: async () => {
        const response = await api.get('/admin/dashboard');
        return response.data;
    },
    
    getBranches: async () => {
        const response = await api.get('/admin/branches');
        return response.data;
    },
    
    createBranch: async (branchData) => {
        const response = await api.post('/admin/branches', branchData);
        return response.data;
    },
    
    createBatch: async (batchData) => {
        const response = await api.post('/admin/batches', batchData);
        return response.data;
    },
    
    createTeacher: async (teacherData) => {
        const response = await api.post('/admin/teachers', teacherData);
        return response.data;
    },
    
    getStudents: async (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/admin/students${params ? '?' + params : ''}`);
        return response.data;
    },
    
    createStudent: async (studentData) => {
        const response = await api.post('/admin/students', studentData);
        return response.data;
    }
};

// Attendance Service
export const attendanceService = {
    markAttendance: async (attendanceData) => {
        const response = await api.post('/attendance/mark', attendanceData);
        return response.data;
    },
    
    getStudentAttendance: async (studentId) => {
        const response = await api.get(`/attendance/student/${studentId}`);
        return response.data;
    },
    
    getAllAttendance: async (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/attendance/all${params ? '?' + params : ''}`);
        return response.data;
    }
};

export default api;