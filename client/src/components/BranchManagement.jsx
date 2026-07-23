import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import axios from 'axios';

function BranchManagement() {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [formData, setFormData] = useState({
        branchCode: '',
        branchName: '',
        duration: 4
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const data = await adminService.getBranches();
            setBranches(data.branches || []);
        } catch (error) {
            console.error('Error fetching branches:', error);
            setMessage({ 
                type: 'danger', 
                text: 'Failed to load branches' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setFormData({
            branchCode: '',
            branchName: '',
            duration: 4
        });
        setEditingBranch(null);
        setShowForm(false);
    };

    const handleEdit = (branch) => {
        setEditingBranch(branch);
        setFormData({
            branchCode: branch.branchCode,
            branchName: branch.branchName,
            duration: branch.duration
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            
            // Validate duration (1-6 years)
            if (formData.duration < 1 || formData.duration > 6) {
                throw new Error('Branch duration must be between 1 and 6 years');
            }
            
            if (editingBranch) {
                const response = await axios.put(
                    `http://localhost:5000/api/admin/branches/${editingBranch._id}`,
                    {
                        branchName: formData.branchName,
                        duration: formData.duration
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMessage({ type: 'success', text: 'Branch updated successfully!' });
            } else {
                const response = await axios.post(
                    'http://localhost:5000/api/admin/branches',
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMessage({ type: 'success', text: 'Branch created successfully!' });
            }
            
            fetchBranches();
            resetForm();

            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ 
                type: 'danger', 
                text: error.response?.data?.error || error.message || 'Failed to save branch' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (branchId) => {
        if (!window.confirm('Are you sure you want to deactivate this branch?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/admin/branches/${branchId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setMessage({ type: 'success', text: 'Branch deactivated successfully!' });
            fetchBranches();
            
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ 
                type: 'danger', 
                text: error.response?.data?.error || 'Failed to deactivate branch' 
            });
        }
    };

    return (
        <div className="modern-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">
                    <i className="bi bi-building me-2"></i>
                    Branch Management
                </h4>
                <button 
                    className="btn btn-gradient btn-modern"
                    onClick={() => {
                        resetForm();
                        setShowForm(!showForm);
                    }}
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    {showForm ? 'Cancel' : 'Add Branch'}
                </button>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type} alert-dismissible fade show`}>
                    {message.text}
                    <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
                </div>
            )}

            {showForm && (
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title mb-3">
                            {editingBranch ? 'Edit Branch' : 'Create New Branch'}
                        </h5>
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label">
                                        Branch Code <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control modern-input"
                                        name="branchCode"
                                        value={formData.branchCode}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., CO"
                                        maxLength="5"
                                        disabled={editingBranch}
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                    <small className="text-muted">Max 5 characters, uppercase</small>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">
                                        Branch Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control modern-input"
                                        name="branchName"
                                        value={formData.branchName}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., Computer Engineering"
                                    />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">
                                        Duration (Years) <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control modern-input"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleChange}
                                        required
                                        min="1"
                                        max="6"
                                        step="1"
                                    />
                                    <small className="text-muted">1 to 6 years</small>
                                </div>
                                <div className="col-md-2 d-flex align-items-end">
                                    <button 
                                        type="submit" 
                                        className="btn btn-gradient btn-modern w-100"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            editingBranch ? 'Update' : 'Create'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading && !showForm ? (
                <div className="text-center py-4">
                    <div className="modern-spinner"></div>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Branch Code</th>
                                <th>Branch Name</th>
                                <th>Duration</th>
                                <th>Batches</th>
                                <th>Students</th>
                                <th>Created Date</th>
                                <th>Created By</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {branches.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-4">
                                        <p className="text-muted mb-0">No branches found. Click "Add Branch" to create one.</p>
                                    </td>
                                </tr>
                            ) : (
                                branches.map(branch => (
                                    <tr key={branch._id}>
                                        <td><span className="fw-bold badge bg-primary">{branch.branchCode}</span></td>
                                        <td>{branch.branchName}</td>
                                        <td>{branch.duration} Years</td>
                                        <td><span className="badge bg-info">{branch.totalBatches || 0}</span></td>
                                        <td><span className="badge bg-success">{branch.totalStudents || 0}</span></td>
                                        <td>
                                            {new Date(branch.createdAt).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })}
                                            <br />
                                            <small className="text-muted">
                                                {new Date(branch.createdAt).toLocaleTimeString('en-IN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </small>
                                        </td>
                                        <td>
                                            {branch.createdBy?.name || 'System'}
                                            <br />
                                            <small className="text-muted">{branch.createdBy?.userId}</small>
                                        </td>
                                        <td>
                                            <span className={`badge ${branch.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                                {branch.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                className="btn btn-sm btn-outline-primary me-2"
                                                onClick={() => handleEdit(branch)}
                                                title="Edit"
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            {branch.isActive && (
                                                <button 
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(branch._id)}
                                                    title="Deactivate"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default BranchManagement;