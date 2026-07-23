import React, { useState, useEffect } from 'react';
import { adminService, authService } from '../services/api';
import BranchManagement from './BranchManagement';
import BatchManagement from './BatchManagement';
import TeacherManagement from './TeacherManagement';
import StudentManagement from './StudentManagement';

function AdminDashboard() {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        totalBranches: 0,
        totalBatches: 0,
        todayAttendance: 0
    });
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const user = authService.getCurrentUser();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const data = await adminService.getDashboardStats();
            setStats(data.statistics);
            setRecentActivities(data.recentActivities || []);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 style={{ 
                            background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: '700'
                        }}>
                            Admin Dashboard
                        </h1>
                        <p className="text-muted mb-0">
                            <i className="bi bi-shield-lock me-2"></i>
                            Welcome, {user?.name}
                        </p>
                    </div>
                </div>

                <div className="mb-4">
                    <ul className="nav nav-pills nav-fill">
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                                onClick={() => setActiveTab('dashboard')}
                                style={{ 
                                    background: activeTab === 'dashboard' ? 'linear-gradient(145deg, #1a1a2e, #16213e)' : 'none',
                                    color: activeTab === 'dashboard' ? 'white' : '#1a1a2e'
                                }}
                            >
                                <i className="bi bi-speedometer2 me-2"></i>
                                Dashboard
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${activeTab === 'branches' ? 'active' : ''}`}
                                onClick={() => setActiveTab('branches')}
                            >
                                <i className="bi bi-building me-2"></i>
                                Branches
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${activeTab === 'batches' ? 'active' : ''}`}
                                onClick={() => setActiveTab('batches')}
                            >
                                <i className="bi bi-people me-2"></i>
                                Batches
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${activeTab === 'teachers' ? 'active' : ''}`}
                                onClick={() => setActiveTab('teachers')}
                            >
                                <i className="bi bi-person-badge me-2"></i>
                                Teachers
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${activeTab === 'students' ? 'active' : ''}`}
                                onClick={() => setActiveTab('students')}
                            >
                                <i className="bi bi-mortarboard me-2"></i>
                                Students
                            </button>
                        </li>
                    </ul>
                </div>

                {activeTab === 'dashboard' && (
                    <>
                        <div className="row g-4 mb-4">
                            <div className="col-xl-2 col-md-4 col-6">
                                <div className="stat-card" style={{ background: 'linear-gradient(145deg, #1a1a2e, #16213e)' }}>
                                    <div className="text-center">
                                        <div className="display-6 mb-2">👥</div>
                                        <h3 className="fw-bold text-white mb-0">{stats.totalStudents}</h3>
                                        <p className="text-white-50 mb-0">Students</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-2 col-md-4 col-6">
                                <div className="stat-card" style={{ background: 'linear-gradient(145deg, #0f4c5c, #0b3b4a)' }}>
                                    <div className="text-center">
                                        <div className="display-6 mb-2">👨‍🏫</div>
                                        <h3 className="fw-bold text-white mb-0">{stats.totalTeachers}</h3>
                                        <p className="text-white-50 mb-0">Teachers</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-2 col-md-4 col-6">
                                <div className="stat-card" style={{ background: 'linear-gradient(145deg, #4a4e6b, #3a3e5a)' }}>
                                    <div className="text-center">
                                        <div className="display-6 mb-2">🏛️</div>
                                        <h3 className="fw-bold text-white mb-0">{stats.totalBranches}</h3>
                                        <p className="text-white-50 mb-0">Branches</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-2 col-md-4 col-6">
                                <div className="stat-card" style={{ background: 'linear-gradient(145deg, #5d4e6c, #4d3e5a)' }}>
                                    <div className="text-center">
                                        <div className="display-6 mb-2">📚</div>
                                        <h3 className="fw-bold text-white mb-0">{stats.totalBatches}</h3>
                                        <p className="text-white-50 mb-0">Batches</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-2 col-md-4 col-6">
                                <div className="stat-card" style={{ background: 'linear-gradient(145deg, #6d5c4e, #5d4c3e)' }}>
                                    <div className="text-center">
                                        <div className="display-6 mb-2">📊</div>
                                        <h3 className="fw-bold text-white mb-0">{stats.todayAttendance}</h3>
                                        <p className="text-white-50 mb-0">Today's Attendance</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-2 col-md-4 col-6">
                                <div className="stat-card" style={{ background: 'linear-gradient(145deg, #4e6d5c, #3e5d4c)' }}>
                                    <div className="text-center">
                                        <div className="display-6 mb-2">📈</div>
                                        <h3 className="fw-bold text-white mb-0">
                                            {stats.totalStudents > 0 ? ((stats.todayAttendance / stats.totalStudents) * 100).toFixed(1) : 0}%
                                        </h3>
                                        <p className="text-white-50 mb-0">Attendance Rate</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12">
                                <div className="modern-card">
                                    <h5 className="fw-bold mb-3">Recent Activities</h5>
                                    
                                    {loading ? (
                                        <div className="text-center py-4">
                                            <div className="modern-spinner"></div>
                                        </div>
                                    ) : (
                                        <div className="timeline">
                                            {recentActivities.map((activity, index) => (
                                                <div key={activity._id} className="d-flex mb-3">
                                                    <div className="me-3">
                                                        <div className="rounded-circle" style={{
                                                            width: '45px',
                                                            height: '45px',
                                                            background: index % 3 === 0 ? 'linear-gradient(145deg, #1a1a2e, #16213e)' :
                                                                       index % 3 === 1 ? 'linear-gradient(145deg, #0f4c5c, #0b3b4a)' :
                                                                       'linear-gradient(145deg, #4a4e6b, #3a3e5a)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'white',
                                                            fontSize: '20px'
                                                        }}>
                                                            {activity.status === 'Present' ? '✅' : 
                                                             activity.status === 'Absent' ? '❌' : '⏰'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="mb-0 fw-semibold">
                                                            {activity.student?.name || 'Unknown'}
                                                        </p>
                                                        <small className="text-muted">
                                                            {activity.status} - {activity.subject}
                                                        </small>
                                                        <br />
                                                        <small className="text-muted">
                                                            <i className="bi bi-clock me-1"></i>
                                                            {new Date(activity.markedAt).toLocaleString()}
                                                        </small>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'branches' && <BranchManagement />}
                {activeTab === 'batches' && <BatchManagement />}
                {activeTab === 'teachers' && <TeacherManagement />}
                {activeTab === 'students' && <StudentManagement />}
            </div>
        </div>
    );
}

export default AdminDashboard;