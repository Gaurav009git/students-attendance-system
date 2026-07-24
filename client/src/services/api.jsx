// import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_URL || 'https://students-attendance-system-wznn.onrender.com/api';

// const api = axios.create({
//     baseURL: API_URL,
//     headers: {
//         'Content-Type': 'application/json',
//     },
// });

// api.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem('token');
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// // Auth Service
// export const authService = {
//     login: async (userId, password) => {
//         try {
//             console.log('Attempting login for:', userId);
//             const response = await api.post('/auth/login', { userId, password });
//             console.log('Login response:', response.data);
            
//             if (response.data.token) {
//                 localStorage.setItem('token', response.data.token);
//                 localStorage.setItem('user', JSON.stringify(response.data.user));
//             }
//             return response.data;
//         } catch (error) {
//             console.error('Login error:', error.response?.data || error.message);
//             throw error;
//         }
//     },
    
//     logout: () => {
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//     },
    
//     getCurrentUser: () => {
//         const user = localStorage.getItem('user');
//         return user ? JSON.parse(user) : null;
//     }
// };

// // Admin Service
// export const adminService = {
//     getDashboardStats: async () => {
//         const response = await api.get('/admin/dashboard');
//         return response.data;
//     },
    
//     getBranches: async () => {
//         const response = await api.get('/admin/branches');
//         return response.data;
//     },
    
//     createBranch: async (branchData) => {
//         const response = await api.post('/admin/branches', branchData);
//         return response.data;
//     },
    
//     createBatch: async (batchData) => {
//         const response = await api.post('/admin/batches', batchData);
//         return response.data;
//     },
    
//     createTeacher: async (teacherData) => {
//         const response = await api.post('/admin/teachers', teacherData);
//         return response.data;
//     },
    
//     getStudents: async (filters = {}) => {
//         const params = new URLSearchParams(filters).toString();
//         const response = await api.get(`/admin/students${params ? '?' + params : ''}`);
//         return response.data;
//     },
    
//     createStudent: async (studentData) => {
//         const response = await api.post('/admin/students', studentData);
//         return response.data;
//     }
// };

// // Attendance Service
// export const attendanceService = {
//     markAttendance: async (attendanceData) => {
//         const response = await api.post('/attendance/mark', attendanceData);
//         return response.data;
//     },
    
//     getStudentAttendance: async (studentId) => {
//         const response = await api.get(`/attendance/student/${studentId}`);
//         return response.data;
//     },
    
//     getAllAttendance: async (filters = {}) => {
//         const params = new URLSearchParams(filters).toString();
//         const response = await api.get(`/attendance/all${params ? '?' + params : ''}`);
//         return response.data;
//     }
// };

// export default api;






































import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://students-attendance-system-wznn.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
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
    // Dashboard
    getDashboardStats: async () => {
        const response = await api.get('/admin/dashboard');
        return response.data;
    },
    
    // Branches
    getBranches: async () => {
        const response = await api.get('/admin/branches');
        return response.data;
    },
    
    createBranch: async (branchData) => {
        const response = await api.post('/admin/branches', branchData);
        return response.data;
    },
    
    updateBranch: async (id, branchData) => {
        const response = await api.put(`/admin/branches/${id}`, branchData);
        return response.data;
    },
    
    deleteBranch: async (id) => {
        const response = await api.delete(`/admin/branches/${id}`);
        return response.data;
    },
    
    // Batches
    getBatches: async () => {
        const response = await api.get('/admin/batches');
        return response.data;
    },
    
    getBatch: async (id) => {
        const response = await api.get(`/admin/batches/${id}`);
        return response.data;
    },
    
    createBatch: async (batchData) => {
        const response = await api.post('/admin/batches', batchData);
        return response.data;
    },
    
    updateBatch: async (id, batchData) => {
        const response = await api.put(`/admin/batches/${id}`, batchData);
        return response.data;
    },
    
    deleteBatch: async (id) => {
        const response = await api.delete(`/admin/batches/${id}`);
        return response.data;
    },
    
    // Teachers
    getTeachers: async () => {
        const response = await api.get('/admin/teachers');
        return response.data;
    },
    
    getTeacher: async (id) => {
        const response = await api.get(`/admin/teachers/${id}`);
        return response.data;
    },
    
    createTeacher: async (teacherData) => {
        const response = await api.post('/admin/teachers', teacherData);
        return response.data;
    },
    
    updateTeacher: async (id, teacherData) => {
        const response = await api.put(`/admin/teachers/${id}`, teacherData);
        return response.data;
    },
    
    deleteTeacher: async (id) => {
        const response = await api.delete(`/admin/teachers/${id}`);
        return response.data;
    },
    
    getTeacherPDF: async (id) => {
        const response = await api.get(`/admin/teachers/${id}/pdf`, {
            responseType: 'blob'
        });
        return response.data;
    },
    
    // Students
    getStudents: async (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/admin/students${params ? '?' + params : ''}`);
        return response.data;
    },
    
    getStudent: async (id) => {
        const response = await api.get(`/admin/students/${id}`);
        return response.data;
    },
    
    createStudent: async (studentData) => {
        const response = await api.post('/admin/students', studentData);
        return response.data;
    },
    
    updateStudent: async (id, studentData) => {
        const response = await api.put(`/admin/students/${id}`, studentData);
        return response.data;
    },
    
    deleteStudent: async (id) => {
        const response = await api.delete(`/admin/students/${id}`);
        return response.data;
    }
};

// Teacher Service
export const teacherService = {
    getDashboard: async () => {
        const response = await api.get('/teacher/dashboard');
        return response.data;
    },
    
    getMyBatches: async () => {
        const response = await api.get('/teacher/batches');
        return response.data;
    },
    
    getAttendance: async (batchId, date) => {
        const response = await api.get(`/attendance/batch/${batchId}`, {
            params: { date }
        });
        return response.data;
    },
    
    markAttendance: async (attendanceData) => {
        const response = await api.post('/attendance/mark', attendanceData);
        return response.data;
    },
    
    getReports: async (batchId, fromDate, toDate) => {
        const response = await api.get('/attendance/report', {
            params: { batchId, fromDate, toDate }
        });
        return response.data;
    }
};

// Student Service
export const studentService = {
    getDashboard: async () => {
        const response = await api.get('/student/dashboard');
        return response.data;
    },
    
    getMyAttendance: async (fromDate, toDate) => {
        const response = await api.get('/student/attendance', {
            params: { fromDate, toDate }
        });
        return response.data;
    },
    
    getProfile: async () => {
        const response = await api.get('/student/profile');
        return response.data;
    }
};

// Attendance Service
export const attendanceService = {
    markAttendance: async (attendanceData) => {
        const response = await api.post('/attendance/mark', attendanceData);
        return response.data;
    },
    
    getStudentAttendance: async (studentId, fromDate, toDate) => {
        const response = await api.get(`/attendance/student/${studentId}`, {
            params: { fromDate, toDate }
        });
        return response.data;
    },
    
    getBatchAttendance: async (batchId, date) => {
        const response = await api.get(`/attendance/batch/${batchId}`, {
            params: { date }
        });
        return response.data;
    },
    
    getAllAttendance: async (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/attendance/all${params ? '?' + params : ''}`);
        return response.data;
    },
    
    getAttendanceReport: async (batchId, fromDate, toDate) => {
        const response = await api.get('/attendance/report', {
            params: { batchId, fromDate, toDate }
        });
        return response.data;
    }
};

export default api;