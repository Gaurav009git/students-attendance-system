import React, { useState, useEffect } from 'react';
import { attendanceService, authService } from '../services/api';

function StudentDashboard() {
    const [attendance, setAttendance] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [subjectWise, setSubjectWise] = useState({});
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    const user = authService.getCurrentUser();

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const data = await attendanceService.getStudentAttendance(user.userId);
            setAttendance(data.attendance || []);
            setStatistics(data.statistics || {});
            setSubjectWise(data.subjectWise || {});
            setNotifications(data.notifications || []);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const getAttendanceColor = (percentage) => {
        if (percentage >= 75) return '#11998e';
        if (percentage >= 60) return '#f7971e';
        return '#cb356b';
    };

    const filterAttendance = () => {
        let filtered = attendance;
        
        if (selectedSubject !== 'all') {
            filtered = filtered.filter(a => a.subject === selectedSubject);
        }
        
        if (dateRange.startDate && dateRange.endDate) {
            filtered = filtered.filter(a => {
                const recordDate = new Date(a.date);
                return recordDate >= new Date(dateRange.startDate) && 
                       recordDate <= new Date(dateRange.endDate);
            });
        }
        
        return filtered;
    };

    const subjects = [...new Set(attendance.map(a => a.subject))];
    const filteredAttendance = filterAttendance();

    return (
        <div className="dashboard-wrapper" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="dashboard-container">
                {/* Profile Header */}
                <div className="row mb-4">
                    <div className="col-lg-8">
                        <div className="d-flex align-items-center">
                            <div 
                                className="rounded-circle d-flex align-items-center justify-content-center me-4"
                                style={{ 
                                    width: '80px', 
                                    height: '80px',
                                    background: 'linear-gradient(145deg, #667eea, #764ba2)',
                                    color: 'white',
                                    fontSize: '36px',
                                    boxShadow: '0 10px 20px rgba(102,126,234,0.3)'
                                }}
                            >
                                {user?.name?.charAt(0).toUpperCase() || 'S'}
                            </div>
                            <div>
                                <h1 style={{ 
                                    background: 'linear-gradient(145deg, #667eea, #764ba2)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontWeight: '700',
                                    fontSize: '2.5rem',
                                    marginBottom: '5px'
                                }}>
                                    Student Dashboard
                                </h1>
                                <p className="text-muted mb-0">
                                    <i className="bi bi-person-vcard me-2"></i>
                                    <strong>{user?.name}</strong> | Enrollment: {user?.userId}
                                </p>
                                <p className="text-muted mb-0">
                                    <i className="bi bi-envelope me-2"></i>
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 d-flex align-items-center justify-content-end">
                        <button 
                            className="btn btn-gradient btn-modern"
                            onClick={fetchAttendance}
                            style={{ padding: '12px 30px' }}
                        >
                            <i className="bi bi-arrow-repeat me-2"></i>
                            Refresh Data
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="row g-4 mb-4">
                    <div className="col-md-3">
                        <div className="stat-card" style={{ 
                            background: 'linear-gradient(145deg, #667eea, #764ba2)',
                            borderRadius: '15px',
                            padding: '25px'
                        }}>
                            <div className="text-center">
                                <div className="display-6 mb-2 text-white-50">📚</div>
                                <h3 className="fw-bold text-white mb-0">{statistics.totalClasses || 0}</h3>
                                <p className="text-white-50 mb-0">Total Classes</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="stat-card" style={{ 
                            background: 'linear-gradient(145deg, #11998e, #38ef7d)',
                            borderRadius: '15px',
                            padding: '25px'
                        }}>
                            <div className="text-center">
                                <div className="display-6 mb-2 text-white-50">✅</div>
                                <h3 className="fw-bold text-white mb-0">{statistics.presentCount || 0}</h3>
                                <p className="text-white-50 mb-0">Present</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="stat-card" style={{ 
                            background: 'linear-gradient(145deg, #f7971e, #ffd200)',
                            borderRadius: '15px',
                            padding: '25px'
                        }}>
                            <div className="text-center">
                                <div className="display-6 mb-2 text-white-50">⏰</div>
                                <h3 className="fw-bold text-white mb-0">{statistics.lateCount || 0}</h3>
                                <p className="text-white-50 mb-0">Late</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="stat-card" style={{ 
                            background: `linear-gradient(145deg, ${getAttendanceColor(parseFloat(statistics.attendancePercentage || 0))}, ${getAttendanceColor(parseFloat(statistics.attendancePercentage || 0) - 20)})`,
                            borderRadius: '15px',
                            padding: '25px'
                        }}>
                            <div className="text-center">
                                <div className="display-6 mb-2 text-white-50">📊</div>
                                <h3 className="fw-bold text-white mb-0">{statistics.attendancePercentage || 0}%</h3>
                                <p className="text-white-50 mb-0">Attendance</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attendance Overview */}
                <div className="row mb-4">
                    <div className="col-lg-6">
                        <div className="modern-card">
                            <h5 className="fw-bold mb-3">
                                <i className="bi bi-pie-chart me-2"></i>
                                Attendance Overview
                            </h5>
                            <div className="mb-4">
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Overall Attendance</span>
                                    <span className="fw-bold" style={{ 
                                        color: getAttendanceColor(parseFloat(statistics.attendancePercentage || 0)) 
                                    }}>
                                        {statistics.attendancePercentage || 0}%
                                    </span>
                                </div>
                                <div className="modern-progress" style={{ height: '15px' }}>
                                    <div 
                                        className="modern-progress-bar" 
                                        style={{ 
                                            width: `${statistics.attendancePercentage || 0}%`,
                                            background: `linear-gradient(145deg, ${getAttendanceColor(parseFloat(statistics.attendancePercentage || 0))}, ${getAttendanceColor(parseFloat(statistics.attendancePercentage || 0) - 20)})`
                                        }}
                                    ></div>
                                </div>
                                <div className="d-flex justify-content-between mt-2">
                                    <small className="text-success">✅ Present: {statistics.presentCount || 0}</small>
                                    <small className="text-warning">⏰ Late: {statistics.lateCount || 0}</small>
                                    <small className="text-danger">❌ Absent: {statistics.absentCount || 0}</small>
                                </div>
                            </div>

                            {parseFloat(statistics.attendancePercentage || 0) < 75 && (
                                <div className="alert alert-warning">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    Your attendance is below 75%. Please attend classes regularly.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="modern-card">
                            <h5 className="fw-bold mb-3">
                                <i className="bi bi-funnel me-2"></i>
                                Filter Records
                            </h5>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Subject</label>
                                <select 
                                    className="form-select modern-select"
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                >
                                    <option value="all">All Subjects</option>
                                    {subjects.map(subject => (
                                        <option key={subject} value={subject}>{subject}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">From</label>
                                    <input
                                        type="date"
                                        className="form-control modern-input"
                                        value={dateRange.startDate}
                                        onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">To</label>
                                    <input
                                        type="date"
                                        className="form-control modern-input"
                                        value={dateRange.endDate}
                                        onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subject-wise Performance */}
                {Object.keys(subjectWise).length > 0 && (
                    <div className="modern-card mb-4">
                        <h5 className="fw-bold mb-3">
                            <i className="bi bi-bar-chart me-2"></i>
                            Subject-wise Performance
                        </h5>
                        <div className="row">
                            {Object.entries(subjectWise).map(([subject, data]) => (
                                <div key={subject} className="col-md-6 mb-3">
                                    <div className="p-3 rounded" style={{ background: '#f8f9fa' }}>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="fw-semibold">{subject}</span>
                                            <span style={{ 
                                                color: getAttendanceColor(parseFloat(data.percentage)),
                                                fontWeight: 'bold'
                                            }}>
                                                {data.percentage}%
                                            </span>
                                        </div>
                                        <div className="modern-progress">
                                            <div 
                                                className="modern-progress-bar" 
                                                style={{ 
                                                    width: `${data.percentage}%`,
                                                    background: `linear-gradient(145deg, ${getAttendanceColor(parseFloat(data.percentage))}, ${getAttendanceColor(parseFloat(data.percentage) - 20)})`
                                                }}
                                            ></div>
                                        </div>
                                        <div className="d-flex justify-content-between mt-2">
                                            <small className="text-success">✅ {data.present || 0}</small>
                                            <small className="text-warning">⏰ {data.late || 0}</small>
                                            <small className="text-danger">❌ {data.absent || 0}</small>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Attendance History */}
                <div className="modern-card">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold mb-0">
                            <i className="bi bi-clock-history me-2"></i>
                            Attendance History
                        </h5>
                        <span className="badge" style={{ 
                            background: 'linear-gradient(145deg, #667eea, #764ba2)',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '50px'
                        }}>
                            {filteredAttendance.length} Records
                        </span>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="modern-spinner mx-auto mb-3"></div>
                            <p className="text-muted">Loading your attendance records...</p>
                        </div>
                    ) : filteredAttendance.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="display-1 text-muted mb-3">📅</div>
                            <h5 className="text-muted">No Attendance Records Found</h5>
                            <p className="text-muted">No records match your current filters.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Subject</th>
                                        <th>Status</th>
                                        <th>Time</th>
                                        <th>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAttendance.map((record, index) => (
                                        <tr key={record._id || index}>
                                            <td>
                                                <span className="fw-semibold">
                                                    {new Date(record.date).toLocaleDateString('en-US', { 
                                                        day: 'numeric', 
                                                        month: 'short' 
                                                    })}
                                                </span>
                                                <br />
                                                <small className="text-muted">
                                                    {new Date(record.date).toLocaleDateString('en-US', { year: 'numeric' })}
                                                </small>
                                            </td>
                                            <td>
                                                <span className="badge bg-light text-dark p-2">
                                                    {record.subject}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge-modern ${
                                                    record.status === 'Present' ? 'badge-present' :
                                                    record.status === 'Absent' ? 'badge-absent' : 'badge-late'
                                                }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td>
                                                <small className="text-muted">
                                                    <i className="bi bi-clock me-1"></i>
                                                    {new Date(record.date).toLocaleTimeString('en-US', { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })}
                                                </small>
                                            </td>
                                            <td>
                                                <small className="text-muted">
                                                    {record.remarks || '-'}
                                                </small>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Notifications Section */}
                {notifications.length > 0 && (
                    <div className="modern-card mt-4">
                        <h5 className="fw-bold mb-3">
                            <i className="bi bi-bell me-2"></i>
                            Recent Notifications
                        </h5>
                        <div className="timeline">
                            {notifications.map((notification, index) => (
                                <div key={notification._id || index} className="d-flex mb-3">
                                    <div className="me-3">
                                        <div className="rounded-circle" style={{
                                            width: '40px',
                                            height: '40px',
                                            background: index % 2 === 0 ? 'linear-gradient(145deg, #667eea, #764ba2)' : 'linear-gradient(145deg, #11998e, #38ef7d)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white'
                                        }}>
                                            {notification.type === 'email' ? '📧' : '📱'}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="mb-0 fw-semibold">{notification.subject}</p>
                                        <small className="text-muted">{notification.message}</small>
                                        <br />
                                        <small className="text-muted">
                                            <i className="bi bi-clock me-1"></i>
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StudentDashboard;