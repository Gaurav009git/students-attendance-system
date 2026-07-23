import React, { useState } from 'react';
import axios from 'axios';

function TestLogin() {
    const [userId, setUserId] = useState('ADMIN001');
    const [password, setPassword] = useState('Admin@123456');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [apiResponse, setApiResponse] = useState(null);

    const testDebugLogin = async () => {
        setLoading(true);
        setApiResponse(null);
        try {
            const response = await axios.post('http://localhost:5000/api/debug/login', {
                userId, password
            });
            setResult({ success: true, data: response.data });
            setApiResponse(response.data);
        } catch (error) {
            setResult({ 
                success: false, 
                error: error.response?.data || error.message 
            });
            setApiResponse(error.response?.data);
        }
        setLoading(false);
    };

    const testRegularLogin = async () => {
        setLoading(true);
        setApiResponse(null);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                userId, password
            });
            setResult({ success: true, data: response.data });
            setApiResponse(response.data);
        } catch (error) {
            setResult({ 
                success: false, 
                error: error.response?.data || error.message 
            });
            setApiResponse(error.response?.data);
        }
        setLoading(false);
    };

    const createTestUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/debug/create-test-users');
            setResult({ success: true, data: response.data });
            setApiResponse(response.data);
        } catch (error) {
            setResult({ 
                success: false, 
                error: error.response?.data || error.message 
            });
        }
        setLoading(false);
    };

    const checkUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/debug/users');
            setResult({ success: true, data: response.data });
            setApiResponse(response.data);
        } catch (error) {
            setResult({ 
                success: false, 
                error: error.response?.data || error.message 
            });
        }
        setLoading(false);
    };

    return (
        <div className="dashboard-wrapper" style={{ padding: '20px' }}>
            <div className="dashboard-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h2 className="mb-4">🔧 Login Test Tool</h2>
                
                <div className="modern-card mb-4">
                    <div className="mb-3">
                        <label className="form-label fw-semibold">User ID:</label>
                        <input 
                            type="text" 
                            className="form-control modern-input"
                            value={userId} 
                            onChange={(e) => setUserId(e.target.value)}
                            placeholder="Enter user ID"
                        />
                    </div>
                    
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Password:</label>
                        <input 
                            type="password" 
                            className="form-control modern-input"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                        />
                    </div>
                    
                    <div className="d-flex gap-2 flex-wrap">
                        <button 
                            className="btn btn-gradient"
                            onClick={testDebugLogin}
                            disabled={loading}
                        >
                            🔍 Test Debug Login
                        </button>
                        <button 
                            className="btn btn-primary"
                            onClick={testRegularLogin}
                            disabled={loading}
                        >
                            🔐 Test Regular Login
                        </button>
                        <button 
                            className="btn btn-success"
                            onClick={createTestUsers}
                            disabled={loading}
                        >
                            ✨ Create Test Users
                        </button>
                        <button 
                            className="btn btn-info"
                            onClick={checkUsers}
                            disabled={loading}
                        >
                            📋 List Users
                        </button>
                    </div>
                </div>

                {loading && (
                    <div className="text-center py-4">
                        <div className="modern-spinner mx-auto"></div>
                        <p className="mt-2">Loading...</p>
                    </div>
                )}
                
                {apiResponse && (
                    <div className="modern-card">
                        <h5 className="fw-bold mb-3">API Response:</h5>
                        <pre style={{ 
                            background: '#f8f9fa', 
                            padding: '15px', 
                            borderRadius: '10px',
                            maxHeight: '400px',
                            overflow: 'auto'
                        }}>
                            {JSON.stringify(apiResponse, null, 2)}
                        </pre>
                    </div>
                )}

                {result && !result.success && (
                    <div className="alert alert-danger mt-3">
                        <h5>❌ Error:</h5>
                        <p>{result.error?.error || JSON.stringify(result.error)}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TestLogin;