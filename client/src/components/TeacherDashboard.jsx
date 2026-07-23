import React, { useState, useEffect } from 'react';
import { attendanceService, authService } from '../services/api';
import MarkAttendance from './MarkAttendance';
import axios from 'axios';

function TeacherDashboard() {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMarkAttendance, setShowMarkAttendance] = useState(false);
    const [teacherStudents, setTeacherStudents] = useState([]);
    const [stats, setStats] = useState({
        totalToday: 0,
        presentToday: 0,
        absentToday: 0,
        lateToday: 0
    });
    const [filters, setFilters] = useState({
        subject: '',
        date: new Date().toISOString().split('T')[0],
        search: ''
    });

    const user = authService.getCurrentUser();
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English'];

    useEffect(() => {
        fetchAttendance();
        fetchTeacherStudents();
    }, [filters.date, filters.subject]);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const data = await attendanceService.getAllAttendance(filters);
            setAttendance(data.attendance || []);
            calculateTodayStats(data.attendance || []);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ NEW: Fetch students assigned to this teacher
    const fetchTeacherStudents = async () => {
        try {
            // This would need an API endpoint to get students by teacher
            // For now, we'll use the attendance data to get unique students
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/attendance/teacher/students', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTeacherStudents(response.data.students || []);
        } catch (error) {
            console.error('Error fetching teacher students:', error);
        }
    };

    const calculateTodayStats = (attendanceData) => {
        const today = new Date().toISOString().split('T')[0];
        const todayRecords = attendanceData.filter(a => 
            new Date(a.date).toISOString().split('T')[0] === today
        );
        
        setStats({
            totalToday: todayRecords.length,
            presentToday: todayRecords.filter(a => a.status === 'Present').length,
            absentToday: todayRecords.filter(a => a.status === 'Absent').length,
            lateToday: todayRecords.filter(a => a.status === 'Late').length
        });
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handleSearch = (e) => {
        setFilters({
            ...filters,
            search: e.target.value
        });
    };

    const clearFilters = () => {
        setFilters({
            subject: '',
            date: new Date().toISOString().split('T')[0],
            search: ''
        });
    };

    const exportToCSV = () => {
        const headers = ['Date', 'Enrollment No', 'Student Name', 'Subject', 'Status', 'Remarks'];
        const csvData = attendance.map(record => [
            new Date(record.date).toLocaleDateString(),
            record.enrollmentNo,
            record.studentName,
            record.subject,
            record.status,
            record.remarks || ''
        ]);
        
        const csvContent = [headers, ...csvData]
            .map(row => row.join(','))
            .join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const filteredAttendance = attendance.filter(record => {
        if (!filters.search) return true;
        const searchLower = filters.search.toLowerCase();
        return record.studentName?.toLowerCase().includes(searchLower) ||
               record.enrollmentNo?.toLowerCase().includes(searchLower);
    });

    // Get unique students from attendance for quick select
    const uniqueStudents = [...new Map(
        attendance.map(item => [item.enrollmentNo, item])
    ).values()];

    return (
        <div className="dashboard-wrapper" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="dashboard-container">
                {/* Header Section */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 style={{ 
                            background: 'linear-gradient(145deg, #667eea, #764ba2)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: '700',
                            fontSize: '2.5rem',
                            marginBottom: '5px'
                        }}>
                            Teacher Dashboard
                        </h1>
                        <p className="text-muted mb-0">
                            <i className="bi bi-person-circle me-2"></i>
                            Welcome back, <strong>{user?.name}</strong> | {new Date().toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <button 
                            className="btn btn-outline-primary btn-modern"
                            onClick={exportToCSV}
                            style={{ border: '2px solid #667eea', color: '#667eea' }}
                        >
                            <i className="bi bi-download me-2"></i>
                            Export CSV
                        </button>
                        <button 
                            className="btn btn-gradient btn-modern"
                            onClick={() => setShowMarkAttendance(!showMarkAttendance)}
                            style={{ padding: '12px 30px' }}
                        >
                            <i className={`bi ${showMarkAttendance ? 'bi-x-circle' : 'bi-plus-circle'} me-2`}></i>
                            {showMarkAttendance ? 'Close Form' : 'Mark Attendance'}
                        </button>
                    </div>
                </div>

                {/* Mark Attendance Form */}
                {showMarkAttendance && (
                    <div className="mb-4 animate__animated animate__fadeIn">
                        <MarkAttendance 
                            onAttendanceMarked={fetchAttendance} 
                            teacherStudents={uniqueStudents} // Pass students to component
                        />
                    </div>
                )}

                {/* Quick Student Select Section */}
                {uniqueStudents.length > 0 && (
                    <div className="modern-card mb-4">
                        <h5 className="fw-bold mb-3">
                            <i className="bi bi-people me-2"></i>
                            Quick Select Student
                        </h5>
                        <div className="d-flex gap-2 flex-wrap">
                            {uniqueStudents.slice(0, 10).map(student => (
                                <button
                                    key={student.enrollmentNo}
                                    className="btn btn-outline-primary"
                                    onClick={() => {
                                        setShowMarkAttendance(true);
                                        // You can pass this to MarkAttendance component
                                    }}
                                    style={{ borderRadius: '50px', padding: '8px 20px' }}
                                >
                                    {student.studentName} ({student.enrollmentNo})
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="row g-4 mb-4">
                    <div className="col-md-3">
                        <div className="stat-card" style={{ 
                            background: 'linear-gradient(145deg, #667eea, #764ba2)',
                            borderRadius: '15px',
                            padding: '25px'
                        }}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-white-50 mb-1">Today's Total</p>
                                    <h2 className="text-white mb-0 display-6 fw-bold">{stats.totalToday}</h2>
                                </div>
                                <div className="display-4 text-white-50">📊</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="stat-card" style={{ 
                            background: 'linear-gradient(145deg, #11998e, #38ef7d)',
                            borderRadius: '15px',
                            padding: '25px'
                        }}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-white-50 mb-1">Present</p>
                                    <h2 className="text-white mb-0 display-6 fw-bold">{stats.presentToday}</h2>
                                </div>
                                <div className="display-4 text-white-50">✅</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="stat-card" style={{ 
                            background: 'linear-gradient(145deg, #f7971e, #ffd200)',
                            borderRadius: '15px',
                            padding: '25px'
                        }}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-white-50 mb-1">Late</p>
                                    <h2 className="text-white mb-0 display-6 fw-bold">{stats.lateToday}</h2>
                                </div>
                                <div className="display-4 text-white-50">⏰</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="stat-card" style={{ 
                            background: 'linear-gradient(145deg, #cb356b, #bd3f32)',
                            borderRadius: '15px',
                            padding: '25px'
                        }}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-white-50 mb-1">Absent</p>
                                    <h2 className="text-white mb-0 display-6 fw-bold">{stats.absentToday}</h2>
                                </div>
                                <div className="display-4 text-white-50">❌</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="modern-card mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold mb-0">
                            <i className="bi bi-funnel me-2"></i>
                            Filter Attendance Records
                        </h5>
                        <button className="btn btn-link text-decoration-none" onClick={clearFilters}>
                            Clear All Filters
                        </button>
                    </div>
                    <div className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label fw-semibold">Subject</label>
                            <select 
                                className="form-select modern-select"
                                name="subject"
                                value={filters.subject}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Subjects</option>
                                {subjects.map(subject => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-semibold">Date</label>
                            <input
                                type="date"
                                className="form-control modern-input"
                                name="date"
                                value={filters.date}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-semibold">Search Student</label>
                            <input
                                type="text"
                                className="form-control modern-input"
                                placeholder="Search by name or enrollment..."
                                value={filters.search}
                                onChange={handleSearch}
                            />
                        </div>
                        <div className="col-md-2 d-flex align-items-end">
                            <button className="btn btn-gradient btn-modern w-100" onClick={fetchAttendance}>
                                <i className="bi bi-search me-2"></i>
                                Apply
                            </button>
                        </div>
                    </div>
                </div>

                {/* Attendance Table */}
                <div className="modern-card">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold mb-0">
                            <i className="bi bi-table me-2"></i>
                            Attendance Records
                            <span className="badge bg-primary ms-2" style={{ borderRadius: '50px' }}>
                                {filteredAttendance.length} Records
                            </span>
                        </h5>
                        <div>
                            <span className="badge bg-success me-2">Present</span>
                            <span className="badge bg-warning me-2">Late</span>
                            <span className="badge bg-danger">Absent</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="modern-spinner mx-auto mb-3"></div>
                            <p className="text-muted">Loading attendance records...</p>
                        </div>
                    ) : filteredAttendance.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="display-1 text-muted mb-3">📅</div>
                            <h5 className="text-muted">No Attendance Records Found</h5>
                            <p className="text-muted">Try adjusting your filters or mark new attendance.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Enrollment No</th>
                                        <th>Student Name</th>
                                        <th>Subject</th>
                                        <th>Status</th>
                                        <th>Remarks</th>
                                        <th>Marked By</th>
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
                                                <span className="fw-bold">{record.enrollmentNo}</span>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-2" 
                                                         style={{ width: '35px', height: '35px' }}>
                                                        {record.studentName?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                    <span>{record.studentName}</span>
                                                </div>
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
                                                    {record.remarks || '-'}
                                                </small>
                                            </td>
                                            <td>
                                                <small className="text-muted">
                                                    <i className="bi bi-person-circle me-1"></i>
                                                    {record.markedBy?.name || 'Unknown'}
                                                </small>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TeacherDashboard;