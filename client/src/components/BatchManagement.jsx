import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import axios from 'axios';

function BatchManagement() {
    const [batches, setBatches] = useState([]);
    const [branches, setBranches] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBatch, setEditingBatch] = useState(null);
    const [formData, setFormData] = useState({
        batchCode: '',
        batchName: '',
        branch: '',
        year: new Date().getFullYear(),
        semester: 1,
        classTeacher: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Fetch branches
            const branchesData = await adminService.getBranches();
            setBranches(branchesData.branches || []);
            
            // Fetch teachers
            const token = localStorage.getItem('token');
            const teachersResponse = await axios.get('http://localhost:5000/api/admin/teachers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTeachers(teachersResponse.data.teachers || []);
            
            // Fetch batches
            fetchBatches();
            
        } catch (error) {
            console.error('Error fetching data:', error);
            setMessage({ 
                type: 'danger', 
                text: 'Failed to load data. Please refresh.' 
            });
        }
    };

    const fetchBatches = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/admin/batches', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBatches(response.data.batches || []);
        } catch (error) {
            console.error('Error fetching batches:', error);
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
            batchCode: '',
            batchName: '',
            branch: '',
            year: new Date().getFullYear(),
            semester: 1,
            classTeacher: ''
        });
        setEditingBatch(null);
        setShowForm(false);
    };

    const handleEdit = (batch) => {
        setEditingBatch(batch);
        setFormData({
            batchCode: batch.batchCode,
            batchName: batch.batchName,
            branch: batch.branch._id,
            year: batch.year,
            semester: batch.semester,
            classTeacher: batch.classTeacher?._id || ''
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const submitData = {
                batchCode: formData.batchCode,
                batchName: formData.batchName,
                branch: formData.branch,
                year: parseInt(formData.year),
                semester: parseInt(formData.semester),
                classTeacher: formData.classTeacher || null
            };

            let response;
            if (editingBatch) {
                response = await axios.put(
                    `http://localhost:5000/api/admin/batches/${editingBatch._id}`,
                    submitData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMessage({ type: 'success', text: 'Batch updated successfully!' });
            } else {
                response = await axios.post(
                    'http://localhost:5000/api/admin/batches',
                    submitData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMessage({ type: 'success', text: 'Batch created successfully!' });
            }

            fetchBatches();
            resetForm();

            setTimeout(() => setMessage({ type: '', text: '' }), 3000);

        } catch (error) {
            console.error('Submit error:', error);
            setMessage({ 
                type: 'danger', 
                text: error.response?.data?.error || 'Failed to save batch' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (batchId) => {
        if (!window.confirm('Are you sure you want to deactivate this batch?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/admin/batches/${batchId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setMessage({ type: 'success', text: 'Batch deactivated successfully!' });
            fetchBatches();
            
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ 
                type: 'danger', 
                text: error.response?.data?.error || 'Failed to deactivate batch' 
            });
        }
    };

    return (
        <div className="modern-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">
                    <i className="bi bi-people me-2"></i>
                    Batch Management
                </h4>
                <button 
                    className="btn btn-gradient btn-modern"
                    onClick={() => {
                        resetForm();
                        setShowForm(!showForm);
                    }}
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    {showForm ? 'Cancel' : 'Create Batch'}
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
                            {editingBatch ? 'Edit Batch' : 'Create New Batch'}
                        </h5>
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-3">
                                    <label className="form-label">
                                        Batch Code <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control modern-input"
                                        name="batchCode"
                                        value={formData.batchCode}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., B2024"
                                        disabled={editingBatch}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">
                                        Batch Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control modern-input"
                                        name="batchName"
                                        value={formData.batchName}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., Batch 2024"
                                    />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">
                                        Branch <span className="text-danger">*</span>
                                    </label>
                                    <select 
                                        className="form-select modern-select"
                                        name="branch"
                                        value={formData.branch}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Branch</option>
                                        {branches.map(branch => (
                                            <option key={branch._id} value={branch._id}>
                                                {branch.branchName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">
                                        Year <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control modern-input"
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        required
                                        min="2000"
                                        max="2100"
                                    />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">
                                        Semester <span className="text-danger">*</span>
                                    </label>
                                    <select 
                                        className="form-select modern-select"
                                        name="semester"
                                        value={formData.semester}
                                        onChange={handleChange}
                                        required
                                    >
                                        {[1,2,3,4,5,6,7,8].map(s => (
                                            <option key={s} value={s}>Semester {s}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">
                                        Class Teacher (Optional)
                                    </label>
                                    <select 
                                        className="form-select modern-select"
                                        name="classTeacher"
                                        value={formData.classTeacher}
                                        onChange={handleChange}
                                    >
                                        <option value="">-- No Class Teacher --</option>
                                        {teachers.map(teacher => (
                                            <option key={teacher._id} value={teacher._id}>
                                                {teacher.name} ({teacher.userId})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12">
                                    <button 
                                        type="submit" 
                                        className="btn btn-gradient btn-modern me-2"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            editingBatch ? 'Update Batch' : 'Create Batch'
                                        )}
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-secondary btn-modern"
                                        onClick={resetForm}
                                    >
                                        Cancel
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
                                <th>Batch Code</th>
                                <th>Batch Name</th>
                                <th>Branch</th>
                                <th>Year</th>
                                <th>Semester</th>
                                <th>Class Teacher</th>
                                <th>Students</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {batches.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-4">
                                        <p className="text-muted mb-0">No batches found. Click "Create Batch" to create one.</p>
                                    </td>
                                </tr>
                            ) : (
                                batches.map(batch => (
                                    <tr key={batch._id}>
                                        <td><span className="fw-bold">{batch.batchCode}</span></td>
                                        <td>{batch.batchName}</td>
                                        <td>{batch.branch?.branchName || 'N/A'}</td>
                                        <td>{batch.year}</td>
                                        <td>Semester {batch.semester}</td>
                                        <td>
                                            {batch.classTeacher ? (
                                                <span className="badge bg-success">
                                                    {batch.classTeacher.name}
                                                </span>
                                            ) : (
                                                <span className="badge bg-secondary">Not Assigned</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className="badge bg-info">
                                                {batch.totalStudents || 0} Students
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${batch.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                                {batch.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                className="btn btn-sm btn-outline-primary me-2"
                                                onClick={() => handleEdit(batch)}
                                                title="Edit"
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            {batch.isActive && (
                                                <button 
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(batch._id)}
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

export default BatchManagement;