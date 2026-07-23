import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import axios from 'axios';

function StudentManagement() {
    const [students, setStudents] = useState([]);
    const [branches, setBranches] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [filters, setFilters] = useState({
        branch: '',
        batch: '',
        semester: '',
        search: ''
    });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        branch: '',
        batch: '',
        semester: 1,
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        address: '',
        dateOfBirth: '',
        gender: 'Male'
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [generatedCredentials, setGeneratedCredentials] = useState(null);

    useEffect(() => {
        fetchBranches();
        fetchStudents();
    }, [filters]);

    const fetchBranches = async () => {
        try {
            const data = await adminService.getBranches();
            setBranches(data.branches || []);
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    const fetchBatches = async (branchId) => {
        if (!branchId) {
            setBatches([]);
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/admin/batches?branch=${branchId}&isActive=true`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBatches(response.data.batches || []);
        } catch (error) {
            console.error('Error fetching batches:', error);
            setBatches([]);
        }
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const data = await adminService.getStudents(filters);
            setStudents(data.students || []);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBranchChange = async (e) => {
        const branchId = e.target.value;
        setFormData({
            ...formData,
            branch: branchId,
            batch: ''
        });
        
        if (branchId) {
            await fetchBatches(branchId);
        } else {
            setBatches([]);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phoneNumber: '',
            branch: '',
            batch: '',
            semester: 1,
            parentName: '',
            parentPhone: '',
            parentEmail: '',
            address: '',
            dateOfBirth: '',
            gender: 'Male'
        });
        setBatches([]);
        setEditingStudent(null);
        setShowForm(false);
        setGeneratedCredentials(null);
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        setFormData({
            name: student.name,
            email: student.email,
            phoneNumber: student.phoneNumber,
            branch: student.branch?._id || '',
            batch: student.batch?._id || '',
            semester: student.semester,
            parentName: student.parentName,
            parentPhone: student.parentPhone,
            parentEmail: student.parentEmail,
            address: student.address,
            dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
            gender: student.gender
        });
        
        if (student.branch?._id) {
            fetchBatches(student.branch._id);
        }
        
        setShowForm(true);
    };

    // Update the downloadStudentPDF function to handle errors better
const downloadStudentPDF = async (studentId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
            `http://localhost:5000/api/admin/students/${studentId}/pdf`,
            { 
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            }
        );
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `student-${studentId}-credentials.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        // Show success message
        setMessage({ type: 'success', text: 'PDF downloaded successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        
    } catch (error) {
        console.error('Error downloading PDF:', error);
        alert('Failed to download PDF. Please try again.');
    }
};

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            if (!formData.name || !formData.email || !formData.phoneNumber || 
                !formData.branch || !formData.batch || !formData.semester ||
                !formData.parentName || !formData.parentPhone || !formData.parentEmail ||
                !formData.address || !formData.dateOfBirth) {
                throw new Error('Please fill all required fields');
            }

            const token = localStorage.getItem('token');
            
            if (editingStudent) {
                const response = await axios.put(
                    `http://localhost:5000/api/admin/students/${editingStudent._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMessage({ type: 'success', text: 'Student updated successfully!' });
            } else {
                const response = await axios.post(
                    'http://localhost:5000/api/admin/students',
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMessage({ type: 'success', text: 'Student created successfully!' });
                setGeneratedCredentials(response.data.credentials);
            }
            
            fetchStudents();
            resetForm();

            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } catch (error) {
            setMessage({ 
                type: 'danger', 
                text: error.response?.data?.error || error.message || 'Failed to save student' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (studentId) => {
        if (!window.confirm('Are you sure you want to deactivate this student?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/admin/students/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setMessage({ type: 'success', text: 'Student deactivated successfully!' });
            fetchStudents();
            
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ 
                type: 'danger', 
                text: error.response?.data?.error || 'Failed to deactivate student' 
            });
        }
    };

    const applyFilters = () => {
        fetchStudents();
    };

    const clearFilters = () => {
        setFilters({
            branch: '',
            batch: '',
            semester: '',
            search: ''
        });
    };

    return (
        <div className="modern-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">
                    <i className="bi bi-mortarboard me-2"></i>
                    Student Management
                </h4>
                <button 
                    className="btn btn-gradient btn-modern"
                    onClick={() => {
                        resetForm();
                        setShowForm(!showForm);
                    }}
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    {showForm ? 'Cancel' : 'Add Student'}
                </button>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type} alert-dismissible fade show`}>
                    {message.text}
                    <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
                </div>
            )}

            {generatedCredentials && (
                <div className="alert alert-success">
                    <h5 className="alert-heading">✅ Student Created Successfully!</h5>
                    <p><strong>Enrollment No:</strong> {generatedCredentials.enrollmentNo}</p>
                    <p><strong>Password:</strong> {generatedCredentials.password}</p>
                    <hr />
                    <button 
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => downloadStudentPDF(generatedCredentials.enrollmentNo)}
                    >
                        <i className="bi bi-file-pdf me-2"></i>
                        Download PDF
                    </button>
                    <button 
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setGeneratedCredentials(null)}
                    >
                        Close
                    </button>
                    <p className="mt-2 mb-0 text-warning">⚠️ Please save/download these credentials. They won't be shown again.</p>
                </div>
            )}

            {/* Filter Section */}
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <input
                        type="text"
                        className="form-control modern-input"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Search by name or enrollment"
                    />
                </div>
                <div className="col-md-2">
                    <select 
                        className="form-select modern-select"
                        name="branch"
                        value={filters.branch}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Branches</option>
                        {branches.map(branch => (
                            <option key={branch._id} value={branch._id}>
                                {branch.branchName}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-md-2">
                    <select 
                        className="form-select modern-select"
                        name="semester"
                        value={filters.semester}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Semesters</option>
                        {[1,2,3,4,5,6,7,8].map(s => (
                            <option key={s} value={s}>Semester {s}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-gradient btn-modern w-100" onClick={applyFilters}>
                        <i className="bi bi-search me-2"></i>
                        Filter
                    </button>
                </div>
                <div className="col-md-2">
                    <button className="btn btn-outline-secondary btn-modern w-100" onClick={clearFilters}>
                        <i className="bi bi-x-circle me-2"></i>
                        Clear
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title mb-3">
                            {editingStudent ? 'Edit Student' : 'Add New Student'}
                        </h5>
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Full Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control modern-input"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter student's full name"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Email <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control modern-input"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="student@example.com"
                                        disabled={editingStudent}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Phone Number <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control modern-input"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter phone number"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Date of Birth <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control modern-input"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">
                                        Branch <span className="text-danger">*</span>
                                    </label>
                                    <select 
                                        className="form-select modern-select"
                                        name="branch"
                                        value={formData.branch}
                                        onChange={handleBranchChange}
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
                                <div className="col-md-4">
                                    <label className="form-label">
                                        Batch <span className="text-danger">*</span>
                                    </label>
                                    <select 
                                        className="form-select modern-select"
                                        name="batch"
                                        value={formData.batch}
                                        onChange={handleChange}
                                        required
                                        disabled={!formData.branch}
                                    >
                                        <option value="">Select Batch</option>
                                        {batches.map(batch => (
                                            <option key={batch._id} value={batch._id}>
                                                {batch.batchName} (Sem {batch.semester})
                                            </option>
                                        ))}
                                    </select>
                                    {!formData.branch && (
                                        <small className="text-muted">First select a branch</small>
                                    )}
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
                                            <option key={s} value={s}>Sem {s}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">
                                        Gender <span className="text-danger">*</span>
                                    </label>
                                    <select 
                                        className="form-select modern-select"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                
                                <div className="col-12">
                                    <h6 className="mt-3 mb-3 fw-bold">Parent/Guardian Details</h6>
                                </div>
                                
                                <div className="col-md-4">
                                    <label className="form-label">
                                        Parent Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control modern-input"
                                        name="parentName"
                                        value={formData.parentName}
                                        onChange={handleChange}
                                        required
                                        placeholder="Parent's full name"
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">
                                        Parent Phone <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control modern-input"
                                        name="parentPhone"
                                        value={formData.parentPhone}
                                        onChange={handleChange}
                                        required
                                        placeholder="Parent's phone number"
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">
                                        Parent Email <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control modern-input"
                                        name="parentEmail"
                                        value={formData.parentEmail}
                                        onChange={handleChange}
                                        required
                                        placeholder="parent@example.com"
                                    />
                                </div>
                                
                                <div className="col-12">
                                    <label className="form-label">
                                        Address <span className="text-danger">*</span>
                                    </label>
                                    <textarea
                                        className="form-control modern-input"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows="2"
                                        required
                                        placeholder="Enter full address"
                                    ></textarea>
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
                                                {editingStudent ? 'Updating...' : 'Creating...'}
                                            </>
                                        ) : (
                                            editingStudent ? 'Update Student' : 'Create Student'
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

            {loading ? (
                <div className="text-center py-4">
                    <div className="modern-spinner"></div>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Enrollment No</th>
                                <th>Name</th>
                                <th>Branch</th>
                                <th>Batch</th>
                                <th>Semester</th>
                                <th>Phone</th>
                                <th>Parent</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-4">
                                        <p className="text-muted mb-0">No students found. Click "Add Student" to create one.</p>
                                    </td>
                                </tr>
                            ) : (
                                students.map(student => (
                                    <tr key={student._id}>
                                        <td>
                                            <span className="fw-bold badge bg-primary">
                                                {student.enrollmentNo}
                                            </span>
                                        </td>
                                        <td>{student.name}</td>
                                        <td>{student.branch?.branchName || 'N/A'}</td>
                                        <td>{student.batch?.batchName || 'N/A'}</td>
                                        <td>Semester {student.semester}</td>
                                        <td>{student.phoneNumber}</td>
                                        <td>
                                            {student.parentName}
                                            <br />
                                            <small className="text-muted">{student.parentPhone}</small>
                                        </td>
                                        <td>
                                            <span className={`badge ${student.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                                {student.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                className="btn btn-sm btn-outline-primary me-2"
                                                title="Download PDF"
                                                onClick={() => downloadStudentPDF(student._id)}
                                            >
                                                <i className="bi bi-file-pdf"></i>
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-outline-secondary me-2" 
                                                title="Edit"
                                                onClick={() => handleEdit(student)}
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            {student.isActive && (
                                                <button 
                                                    className="btn btn-sm btn-outline-danger" 
                                                    title="Deactivate"
                                                    onClick={() => handleDelete(student._id)}
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

export default StudentManagement;