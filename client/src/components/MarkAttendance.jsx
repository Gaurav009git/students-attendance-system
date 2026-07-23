import React, { useState, useEffect } from 'react';
import { attendanceService } from '../services/api';

function MarkAttendance({ onAttendanceMarked, teacherStudents = [] }) {
    const [formData, setFormData] = useState({
        enrollmentNo: '',
        subject: 'Mathematics',
        date: new Date().toISOString().split('T')[0],
        status: 'Present',
        remarks: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [recentStudents, setRecentStudents] = useState([]);

    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English'];
    const statusOptions = ['Present', 'Absent', 'Late', 'Leave'];

    useEffect(() => {
        // Load recent students from localStorage
        const saved = localStorage.getItem('recentStudents');
        if (saved) {
            setRecentStudents(JSON.parse(saved));
        }
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleQuickSelect = (enrollmentNo) => {
        setFormData({
            ...formData,
            enrollmentNo
        });
        
        // Add to recent students
        const updated = [enrollmentNo, ...recentStudents.filter(s => s !== enrollmentNo)].slice(0, 5);
        setRecentStudents(updated);
        localStorage.setItem('recentStudents', JSON.stringify(updated));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await attendanceService.markAttendance(formData);
            setMessage({ 
                type: 'success', 
                text: `✅ Attendance marked successfully for ${formData.enrollmentNo}!` 
            });
            
            setFormData({
                ...formData,
                enrollmentNo: '',
                remarks: '',
                status: 'Present'
            });
            
            if (onAttendanceMarked) {
                onAttendanceMarked();
            }

            setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 3000);
        } catch (error) {
            setMessage({ 
                type: 'danger', 
                text: error.response?.data?.error || '❌ Failed to mark attendance' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleMarkMultiple = async () => {
        if (!formData.enrollmentNo.includes(',')) {
            handleSubmit(new Event('submit'));
            return;
        }

        const enrollmentList = formData.enrollmentNo.split(',').map(e => e.trim());
        setLoading(true);
        
        let success = 0;
        let failed = 0;

        for (const enrollment of enrollmentList) {
            try {
                await attendanceService.markAttendance({
                    ...formData,
                    enrollmentNo: enrollment
                });
                success++;
            } catch (error) {
                failed++;
            }
        }

        setMessage({
            type: success > 0 ? 'success' : 'danger',
            text: `✅ ${success} marked, ❌ ${failed} failed`
        });

        setFormData({
            ...formData,
            enrollmentNo: '',
            remarks: ''
        });

        if (onAttendanceMarked) {
            onAttendanceMarked();
        }

        setLoading(false);
        
        setTimeout(() => {
            setMessage({ type: '', text: '' });
        }, 3000);
    };

    return (
        <div className="modern-card">
            <div className="d-flex align-items-center mb-4">
                <div 
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ 
                        width: '50px', 
                        height: '50px',
                        background: 'linear-gradient(145deg, #667eea, #764ba2)',
                        color: 'white',
                        fontSize: '24px'
                    }}
                >
                    📝
                </div>
                <div>
                    <h5 className="fw-bold mb-0">Mark Attendance</h5>
                    <p className="text-muted mb-0">Record student attendance for today's class</p>
                </div>
            </div>

            {message.text && (
                <div 
                    className={`alert alert-${message.type} alert-dismissible fade show`} 
                    role="alert"
                    style={{ borderRadius: '10px' }}
                >
                    <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
                    {message.text}
                    <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setMessage({ type: '', text: '' })}
                    ></button>
                </div>
            )}

            {/* Teacher's Students Quick Select */}
            {teacherStudents.length > 0 && (
                <div className="mb-4">
                    <label className="form-label fw-semibold">Your Students</label>
                    <div className="d-flex gap-2 flex-wrap" style={{ maxHeight: '100px', overflowY: 'auto' }}>
                        {teacherStudents.map(student => (
                            <button
                                key={student.enrollmentNo}
                                type="button"
                                className={`btn ${formData.enrollmentNo === student.enrollmentNo ? 'btn-gradient' : 'btn-outline-primary'}`}
                                onClick={() => handleQuickSelect(student.enrollmentNo)}
                                style={{ borderRadius: '50px', padding: '5px 15px', fontSize: '12px' }}
                            >
                                {student.studentName} ({student.enrollmentNo})
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Students */}
            {recentStudents.length > 0 && (
                <div className="mb-4">
                    <label className="form-label fw-semibold">Recent Students</label>
                    <div className="d-flex gap-2 flex-wrap">
                        {recentStudents.map(enrollment => (
                            <button
                                key={enrollment}
                                type="button"
                                className="btn btn-light"
                                onClick={() => handleQuickSelect(enrollment)}
                                style={{ borderRadius: '50px', padding: '5px 15px' }}
                            >
                                {enrollment}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="row g-3">
                    <div className="col-md-3">
                        <label className="form-label fw-semibold">
                            <i className="bi bi-person-badge me-1"></i>
                            Enrollment No
                        </label>
                        <input
                            type="text"
                            className="form-control modern-input"
                            name="enrollmentNo"
                            value={formData.enrollmentNo}
                            onChange={handleChange}
                            required
                            placeholder="e.g., CO001"
                            list="students-list"
                        />
                        <datalist id="students-list">
                            {teacherStudents.map(student => (
                                <option key={student.enrollmentNo} value={student.enrollmentNo}>
                                    {student.studentName}
                                </option>
                            ))}
                        </datalist>
                        <small className="text-muted">
                            Separate multiple with commas (CO001, CO002)
                        </small>
                    </div>

                    <div className="col-md-3">
                        <label className="form-label fw-semibold">
                            <i className="bi bi-book me-1"></i>
                            Subject
                        </label>
                        <select 
                            className="form-select modern-select" 
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                        >
                            {subjects.map(subject => (
                                <option key={subject} value={subject}>{subject}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-2">
                        <label className="form-label fw-semibold">
                            <i className="bi bi-calendar me-1"></i>
                            Date
                        </label>
                        <input
                            type="date"
                            className="form-control modern-input"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="col-md-2">
                        <label className="form-label fw-semibold">
                            <i className="bi bi-flag me-1"></i>
                            Status
                        </label>
                        <select 
                            className="form-select modern-select" 
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                        >
                            {statusOptions.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-2">
                        <label className="form-label fw-semibold">
                            <i className="bi bi-chat me-1"></i>
                            Remarks
                        </label>
                        <input
                            type="text"
                            className="form-control modern-input"
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            placeholder="Optional"
                        />
                    </div>

                    <div className="col-12 mt-4">
                        <div className="d-flex gap-2">
                            <button 
                                type="submit" 
                                className="btn btn-gradient btn-modern"
                                disabled={loading}
                                style={{ minWidth: '150px' }}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Marking...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-circle me-2"></i>
                                        Mark Attendance
                                    </>
                                )}
                            </button>
                            
                            {formData.enrollmentNo.includes(',') && (
                                <button 
                                    type="button"
                                    className="btn btn-outline-success btn-modern"
                                    onClick={handleMarkMultiple}
                                    disabled={loading}
                                >
                                    <i className="bi bi-person-plus me-2"></i>
                                    Mark Multiple
                                </button>
                            )}
                            
                            <button 
                                type="button"
                                className="btn btn-outline-secondary btn-modern"
                                onClick={() => {
                                    setFormData({
                                        enrollmentNo: '',
                                        subject: 'Mathematics',
                                        date: new Date().toISOString().split('T')[0],
                                        status: 'Present',
                                        remarks: ''
                                    });
                                }}
                            >
                                <i className="bi bi-arrow-repeat me-2"></i>
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Quick Stats */}
            <div className="row mt-4 g-3">
                <div className="col-md-4">
                    <div className="p-3 bg-light rounded">
                        <small className="text-muted d-block">Today's Date</small>
                        <span className="fw-bold">
                            {new Date().toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                            })}
                        </span>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="p-3 bg-light rounded">
                        <small className="text-muted d-block">Current Time</small>
                        <span className="fw-bold">
                            {new Date().toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            })}
                        </span>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="p-3 bg-light rounded">
                        <small className="text-muted d-block">Selected Subject</small>
                        <span className="fw-bold">{formData.subject}</span>
                    </div>
                </div>
            </div>

            {/* Help Text */}
            <div className="mt-3 p-3" style={{ 
                background: 'linear-gradient(145deg, #f8f9fa, #e9ecef)',
                borderRadius: '10px'
            }}>
                <div className="d-flex align-items-center">
                    <i className="bi bi-info-circle-fill text-primary me-2 fs-5"></i>
                    <div>
                        <small className="text-muted d-block">
                            <strong>💡 Tips:</strong>
                        </small>
                        <small className="text-muted d-block">
                            • Use commas to mark multiple students (CO001, CO002, CO003)
                        </small>
                        <small className="text-muted d-block">
                            • Recent students are saved for quick access
                        </small>
                        <small className="text-muted d-block">
                            • Parents will be notified for Absent/Late status
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MarkAttendance;