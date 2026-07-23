import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

function Login() {
    const [formData, setFormData] = useState({
        userId: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('Submitting login form...');
            const data = await authService.login(formData.userId, formData.password);
            console.log('Login successful:', data);
            
            if (data.user.role === 'admin') {
                navigate('/admin');
            } else if (data.user.role === 'teacher') {
                navigate('/teacher');
            } else {
                navigate('/student');
            }
        } catch (err) {
            console.error('Login error details:', err.response?.data || err.message);
            const errorMessage = err.response?.data?.error || 'Login failed. Please check credentials.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <div className="text-center mb-4">
                    <div 
                        className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                        style={{ 
                            width: '80px', 
                            height: '80px',
                            background: 'linear-gradient(145deg, #667eea, #764ba2)',
                            color: 'white',
                            fontSize: '40px'
                        }}
                    >
                        📊
                    </div>
                    <h2 style={{ 
                        background: 'linear-gradient(145deg, #667eea, #764ba2)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: '700'
                    }}>
                        Smart Attendance
                    </h2>
                    <p className="text-muted">Welcome back! Please login.</p>
                </div>

                {error && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error}
                        <button type="button" className="btn-close" onClick={() => setError('')}></button>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">User ID / Enrollment No</label>
                        <input
                            type="text"
                            className="form-control modern-input"
                            name="userId"
                            value={formData.userId}
                            onChange={handleChange}
                            required
                            placeholder="Enter ADMIN001, TCH001, or CO001"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label fw-semibold">Password</label>
                        <input
                            type="password"
                            className="form-control modern-input"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter your password"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-gradient btn-modern w-100"
                        disabled={loading}
                        style={{ padding: '14px' }}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Logging in...
                            </>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>

                <div className="mt-4 p-3" style={{ 
                    background: 'linear-gradient(145deg, #f8f9fa, #e9ecef)',
                    borderRadius: '15px'
                }}>
                    <p className="text-center mb-2 fw-semibold">Demo Credentials</p>
                    <div className="row text-center">
                        <div className="col-4">
                            <small className="d-block fw-bold">Admin</small>
                            <small className="text-muted">ADMIN001</small>
                            <small className="text-muted d-block">Admin@123456</small>
                        </div>
                        <div className="col-4">
                            <small className="d-block fw-bold">Teacher</small>
                            <small className="text-muted">TCH001</small>
                            <small className="text-muted d-block">Teacher@123</small>
                        </div>
                        <div className="col-4">
                            <small className="d-block fw-bold">Student</small>
                            <small className="text-muted">CO001</small>
                            <small className="text-muted d-block">Student@123</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;