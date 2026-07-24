// import React, { useState, useEffect } from 'react';
// import { adminService } from '../services/api';
// import axios from 'axios';

// function TeacherManagement() {
//     const [teachers, setTeachers] = useState([]);
//     const [branches, setBranches] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [showForm, setShowForm] = useState(false);
//     const [editingTeacher, setEditingTeacher] = useState(null);
//     const [formData, setFormData] = useState({
//         name: '',
//         email: '',
//         phoneNumber: '',
//         branch: '',
//         assignedBatches: []
//     });
//     const [message, setMessage] = useState({ type: '', text: '' });
//     const [generatedCredentials, setGeneratedCredentials] = useState(null);

//     useEffect(() => {
//         fetchData();
//     }, []);

//     const fetchData = async () => {
//         try {
//             setLoading(true);
            
//             const branchesData = await adminService.getBranches();
//             setBranches(branchesData.branches || []);
            
//             const token = localStorage.getItem('token');
//             const response = await axios.get('http://localhost:5000/api/admin/teachers', {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             setTeachers(response.data.teachers || []);
            
//         } catch (error) {
//             console.error('Error fetching data:', error);
//             setMessage({ 
//                 type: 'danger', 
//                 text: 'Failed to load teachers. Please refresh.' 
//             });
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleChange = (e) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value
//         });
//     };

//     const resetForm = () => {
//         setFormData({
//             name: '',
//             email: '',
//             phoneNumber: '',
//             branch: '',
//             assignedBatches: []
//         });
//         setEditingTeacher(null);
//         setShowForm(false);
//         setGeneratedCredentials(null);
//     };

//     const handleEdit = (teacher) => {
//         setEditingTeacher(teacher);
//         setFormData({
//             name: teacher.name,
//             email: teacher.email,
//             phoneNumber: teacher.phoneNumber || '',
//             branch: teacher.branch?._id || '',
//             assignedBatches: teacher.assignedBatches || []
//         });
//         setShowForm(true);
//         setGeneratedCredentials(null);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setMessage({ type: '', text: '' });

//         try {
//             if (!formData.name || !formData.email || !formData.phoneNumber || !formData.branch) {
//                 throw new Error('Please fill all required fields');
//             }

//             const token = localStorage.getItem('token');
            
//             if (editingTeacher) {
//                 const response = await axios.put(
//                     `http://localhost:5000/api/admin/teachers/${editingTeacher._id}`,
//                     formData,
//                     { headers: { Authorization: `Bearer ${token}` } }
//                 );
//                 setMessage({ type: 'success', text: 'Teacher updated successfully!' });
//             } else {
//                 const response = await axios.post(
//                     'http://localhost:5000/api/admin/teachers',
//                     formData,
//                     { headers: { Authorization: `Bearer ${token}` } }
//                 );
//                 setMessage({ type: 'success', text: 'Teacher created successfully!' });
//                 setGeneratedCredentials(response.data.credentials);
//             }
            
//             fetchData();
//             resetForm();

//             setTimeout(() => setMessage({ type: '', text: '' }), 5000);
//         } catch (error) {
//             setMessage({ 
//                 type: 'danger', 
//                 text: error.response?.data?.error || error.message || 'Failed to save teacher' 
//             });
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleDelete = async (teacherId) => {
//         if (!window.confirm('Are you sure you want to deactivate this teacher?')) return;

//         try {
//             const token = localStorage.getItem('token');
//             await axios.delete(`http://localhost:5000/api/admin/teachers/${teacherId}`, {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
            
//             setMessage({ type: 'success', text: 'Teacher deactivated successfully!' });
//             fetchData();
            
//             setTimeout(() => setMessage({ type: '', text: '' }), 3000);
//         } catch (error) {
//             setMessage({ 
//                 type: 'danger', 
//                 text: error.response?.data?.error || 'Failed to deactivate teacher' 
//             });
//         }
//     };

//     // Update the downloadTeacherPDF function to handle errors better
// const downloadTeacherPDF = async (teacherId) => {
//     try {
//         const token = localStorage.getItem('token');
//         const response = await axios.get(
//             `http://localhost:5000/api/admin/teachers/${teacherId}/pdf`,
//             { 
//                 headers: { Authorization: `Bearer ${token}` },
//                 responseType: 'blob'
//             }
//         );
        
//         const url = window.URL.createObjectURL(new Blob([response.data]));
//         const link = document.createElement('a');
//         link.href = url;
//         link.setAttribute('download', `teacher-${teacherId}-credentials.pdf`);
//         document.body.appendChild(link);
//         link.click();
//         link.remove();
        
//         // Show success message
//         setMessage({ type: 'success', text: 'PDF downloaded successfully!' });
//         setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        
//     } catch (error) {
//         console.error('Error downloading PDF:', error);
//         alert('Failed to download PDF. Please try again.');
//     }
// };

//     return (
//         <div className="modern-card">
//             <div className="d-flex justify-content-between align-items-center mb-4">
//                 <h4 className="fw-bold mb-0">
//                     <i className="bi bi-person-badge me-2"></i>
//                     Teacher Management
//                 </h4>
//                 <button 
//                     className="btn btn-gradient btn-modern"
//                     onClick={() => {
//                         resetForm();
//                         setShowForm(!showForm);
//                     }}
//                 >
//                     <i className="bi bi-plus-circle me-2"></i>
//                     {showForm ? 'Cancel' : 'Add Teacher'}
//                 </button>
//             </div>

//             {message.text && (
//                 <div className={`alert alert-${message.type} alert-dismissible fade show`}>
//                     {message.text}
//                     <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
//                 </div>
//             )}

//             {generatedCredentials && (
//                 <div className="alert alert-success">
//                     <h5 className="alert-heading">✅ Teacher Created Successfully!</h5>
//                     <p><strong>Teacher ID:</strong> {generatedCredentials.userId}</p>
//                     <p><strong>Password:</strong> {generatedCredentials.password}</p>
//                     <hr />
//                     <button 
//                         className="btn btn-sm btn-primary me-2"
//                         onClick={() => downloadTeacherPDF(generatedCredentials.userId)}
//                     >
//                         <i className="bi bi-file-pdf me-2"></i>
//                         Download PDF
//                     </button>
//                     <button 
//                         className="btn btn-sm btn-outline-secondary"
//                         onClick={() => setGeneratedCredentials(null)}
//                     >
//                         Close
//                     </button>
//                     <p className="mt-2 mb-0 text-warning">⚠️ Please save/download these credentials. They won't be shown again.</p>
//                 </div>
//             )}

//             {showForm && (
//                 <div className="card mb-4">
//                     <div className="card-body">
//                         <h5 className="card-title mb-3">
//                             {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
//                         </h5>
//                         <form onSubmit={handleSubmit}>
//                             <div className="row g-3">
//                                 <div className="col-md-6">
//                                     <label className="form-label">
//                                         Full Name <span className="text-danger">*</span>
//                                     </label>
//                                     <input
//                                         type="text"
//                                         className="form-control modern-input"
//                                         name="name"
//                                         value={formData.name}
//                                         onChange={handleChange}
//                                         required
//                                         placeholder="Enter teacher's full name"
//                                     />
//                                 </div>
//                                 <div className="col-md-6">
//                                     <label className="form-label">
//                                         Email <span className="text-danger">*</span>
//                                     </label>
//                                     <input
//                                         type="email"
//                                         className="form-control modern-input"
//                                         name="email"
//                                         value={formData.email}
//                                         onChange={handleChange}
//                                         required
//                                         placeholder="teacher@example.com"
//                                         disabled={editingTeacher}
//                                     />
//                                 </div>
//                                 <div className="col-md-6">
//                                     <label className="form-label">
//                                         Phone Number <span className="text-danger">*</span>
//                                     </label>
//                                     <input
//                                         type="text"
//                                         className="form-control modern-input"
//                                         name="phoneNumber"
//                                         value={formData.phoneNumber}
//                                         onChange={handleChange}
//                                         required
//                                         placeholder="Enter phone number"
//                                     />
//                                 </div>
//                                 <div className="col-md-6">
//                                     <label className="form-label">
//                                         Branch <span className="text-danger">*</span>
//                                     </label>
//                                     <select 
//                                         className="form-select modern-select"
//                                         name="branch"
//                                         value={formData.branch}
//                                         onChange={handleChange}
//                                         required
//                                     >
//                                         <option value="">Select Branch</option>
//                                         {branches.map(branch => (
//                                             <option key={branch._id} value={branch._id}>
//                                                 {branch.branchName} ({branch.branchCode})
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//                                 <div className="col-12">
//                                     <button 
//                                         type="submit" 
//                                         className="btn btn-gradient btn-modern me-2"
//                                         disabled={loading}
//                                     >
//                                         {loading ? (
//                                             <>
//                                                 <span className="spinner-border spinner-border-sm me-2"></span>
//                                                 {editingTeacher ? 'Updating...' : 'Creating...'}
//                                             </>
//                                         ) : (
//                                             editingTeacher ? 'Update Teacher' : 'Create Teacher'
//                                         )}
//                                     </button>
//                                     <button 
//                                         type="button" 
//                                         className="btn btn-outline-secondary btn-modern"
//                                         onClick={resetForm}
//                                     >
//                                         Cancel
//                                     </button>
//                                 </div>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {loading ? (
//                 <div className="text-center py-4">
//                     <div className="modern-spinner"></div>
//                 </div>
//             ) : (
//                 <div className="table-responsive">
//                     <table className="modern-table">
//                         <thead>
//                             <tr>
//                                 <th>Teacher ID</th>
//                                 <th>Name</th>
//                                 <th>Email</th>
//                                 <th>Phone</th>
//                                 <th>Branch</th>
//                                 <th>Assigned Batches</th>
//                                 <th>Status</th>
//                                 <th>Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {teachers.length === 0 ? (
//                                 <tr>
//                                     <td colSpan="8" className="text-center py-4">
//                                         <p className="text-muted mb-0">No teachers found. Click "Add Teacher" to create one.</p>
//                                     </td>
//                                 </tr>
//                             ) : (
//                                 teachers.map(teacher => (
//                                     <tr key={teacher._id}>
//                                         <td>
//                                             <span className="fw-bold badge bg-primary">
//                                                 {teacher.userId}
//                                             </span>
//                                         </td>
//                                         <td>{teacher.name}</td>
//                                         <td>{teacher.email}</td>
//                                         <td>{teacher.phoneNumber || 'N/A'}</td>
//                                         <td>{teacher.branch?.branchName || 'N/A'}</td>
//                                         <td>
//                                             {teacher.assignedBatches?.length > 0 ? (
//                                                 teacher.assignedBatches.map(batch => (
//                                                     <span key={batch._id} className="badge bg-info me-1">
//                                                         {batch.batchCode}
//                                                     </span>
//                                                 ))
//                                             ) : (
//                                                 <span className="badge bg-secondary">None</span>
//                                             )}
//                                         </td>
//                                         <td>
//                                             <span className={`badge ${teacher.isActive ? 'bg-success' : 'bg-secondary'}`}>
//                                                 {teacher.isActive ? 'Active' : 'Inactive'}
//                                             </span>
//                                         </td>
//                                         <td>
//                                             <button 
//                                                 className="btn btn-sm btn-outline-primary me-2" 
//                                                 title="Download PDF"
//                                                 onClick={() => downloadTeacherPDF(teacher._id)}
//                                             >
//                                                 <i className="bi bi-file-pdf"></i>
//                                             </button>
//                                             <button 
//                                                 className="btn btn-sm btn-outline-secondary me-2" 
//                                                 title="Edit"
//                                                 onClick={() => handleEdit(teacher)}
//                                             >
//                                                 <i className="bi bi-pencil"></i>
//                                             </button>
//                                             {teacher.isActive && (
//                                                 <button 
//                                                     className="btn btn-sm btn-outline-danger" 
//                                                     title="Deactivate"
//                                                     onClick={() => handleDelete(teacher._id)}
//                                                 >
//                                                     <i className="bi bi-trash"></i>
//                                                 </button>
//                                             )}
//                                         </td>
//                                     </tr>
//                                 ))
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default TeacherManagement;



































import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';

function TeacherManagement() {
    const [teachers, setTeachers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        branch: '',
        assignedBatches: []
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [generatedCredentials, setGeneratedCredentials] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setMessage({ type: '', text: '' });
            
            // Fetch both branches and teachers simultaneously
            const [branchesData, teachersData] = await Promise.all([
                adminService.getBranches(),
                adminService.getTeachers()
            ]);
            
            setBranches(branchesData.branches || []);
            setTeachers(teachersData.teachers || []);
            
        } catch (error) {
            console.error('Error fetching data:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to load teachers';
            setMessage({ 
                type: 'danger', 
                text: `${errorMessage}. Please refresh.` 
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
            name: '',
            email: '',
            phoneNumber: '',
            branch: '',
            assignedBatches: []
        });
        setEditingTeacher(null);
        setShowForm(false);
        setGeneratedCredentials(null);
    };

    const handleEdit = (teacher) => {
        setEditingTeacher(teacher);
        setFormData({
            name: teacher.name,
            email: teacher.email,
            phoneNumber: teacher.phoneNumber || '',
            branch: teacher.branch?._id || teacher.branch || '',
            assignedBatches: teacher.assignedBatches || []
        });
        setShowForm(true);
        setGeneratedCredentials(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            if (!formData.name || !formData.email || !formData.phoneNumber || !formData.branch) {
                setMessage({ type: 'danger', text: 'Please fill all required fields' });
                setLoading(false);
                return;
            }

            const submitData = {
                name: formData.name,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                branch: formData.branch,
                assignedBatches: formData.assignedBatches
            };

            let response;
            if (editingTeacher) {
                response = await adminService.updateTeacher(editingTeacher._id, submitData);
                setMessage({ type: 'success', text: 'Teacher updated successfully!' });
            } else {
                response = await adminService.createTeacher(submitData);
                setMessage({ type: 'success', text: 'Teacher created successfully!' });
                if (response.credentials) {
                    setGeneratedCredentials(response.credentials);
                }
            }
            
            // Refresh teacher list
            const teachersData = await adminService.getTeachers();
            setTeachers(teachersData.teachers || []);
            
            if (!editingTeacher) {
                resetForm();
            }

            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } catch (error) {
            console.error('Submit error:', error);
            setMessage({ 
                type: 'danger', 
                text: error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to save teacher' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (teacherId) => {
        if (!window.confirm('Are you sure you want to deactivate this teacher?')) return;

        try {
            setLoading(true);
            await adminService.deleteTeacher(teacherId);
            
            setMessage({ type: 'success', text: 'Teacher deactivated successfully!' });
            
            // Refresh teacher list
            const teachersData = await adminService.getTeachers();
            setTeachers(teachersData.teachers || []);
            
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Delete error:', error);
            setMessage({ 
                type: 'danger', 
                text: error.response?.data?.error || 'Failed to deactivate teacher' 
            });
        } finally {
            setLoading(false);
        }
    };

    // Download teacher PDF credentials
    const downloadTeacherPDF = async (teacherId) => {
        try {
            setMessage({ type: '', text: '' });
            
            // Use the adminService to get the PDF
            const response = await adminService.getTeacherPDF(teacherId);
            
            // If the API returns a blob directly
            if (response instanceof Blob) {
                const url = window.URL.createObjectURL(response);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `teacher-${teacherId}-credentials.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            }
            
            setMessage({ type: 'success', text: 'PDF downloaded successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            
        } catch (error) {
            console.error('Error downloading PDF:', error);
            setMessage({ 
                type: 'danger', 
                text: 'Failed to download PDF. Please try again.' 
            });
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        }
    };

    return (
        <div className="modern-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">
                    <i className="bi bi-person-badge me-2"></i>
                    Teacher Management
                </h4>
                <button 
                    className="btn btn-gradient btn-modern"
                    onClick={() => {
                        resetForm();
                        setShowForm(!showForm);
                    }}
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    {showForm ? 'Cancel' : 'Add Teacher'}
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
                    <h5 className="alert-heading">✅ Teacher Created Successfully!</h5>
                    <p><strong>Teacher ID:</strong> {generatedCredentials.userId}</p>
                    <p><strong>Password:</strong> {generatedCredentials.password}</p>
                    <hr />
                    <button 
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => downloadTeacherPDF(generatedCredentials.userId)}
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

            {showForm && (
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title mb-3">
                            {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
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
                                        placeholder="Enter teacher's full name"
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
                                        placeholder="teacher@example.com"
                                        disabled={!!editingTeacher}
                                    />
                                    {editingTeacher && (
                                        <small className="text-muted">Email cannot be changed</small>
                                    )}
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
                                                {branch.branchName} ({branch.branchCode})
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
                                                {editingTeacher ? 'Updating...' : 'Creating...'}
                                            </>
                                        ) : (
                                            editingTeacher ? 'Update Teacher' : 'Create Teacher'
                                        )}
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-secondary btn-modern"
                                        onClick={resetForm}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading && teachers.length === 0 ? (
                <div className="text-center py-4">
                    <div className="modern-spinner"></div>
                    <p className="text-muted mt-2">Loading teachers...</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Teacher ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Branch</th>
                                <th>Assigned Batches</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-4">
                                        <p className="text-muted mb-0">No teachers found. Click "Add Teacher" to create one.</p>
                                    </td>
                                </tr>
                            ) : (
                                teachers.map(teacher => (
                                    <tr key={teacher._id}>
                                        <td>
                                            <span className="fw-bold badge bg-primary">
                                                {teacher.userId}
                                            </span>
                                        </td>
                                        <td>{teacher.name}</td>
                                        <td>{teacher.email}</td>
                                        <td>{teacher.phoneNumber || 'N/A'}</td>
                                        <td>{teacher.branch?.branchName || 'N/A'}</td>
                                        <td>
                                            {teacher.assignedBatches?.length > 0 ? (
                                                teacher.assignedBatches.map((batch, index) => (
                                                    <span key={batch._id || index} className="badge bg-info me-1">
                                                        {batch.batchCode || batch}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="badge bg-secondary">None</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge ${teacher.isActive !== false ? 'bg-success' : 'bg-secondary'}`}>
                                                {teacher.isActive !== false ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="btn-group btn-group-sm">
                                                <button 
                                                    className="btn btn-outline-primary" 
                                                    title="Download PDF"
                                                    onClick={() => downloadTeacherPDF(teacher._id)}
                                                >
                                                    <i className="bi bi-file-pdf"></i>
                                                </button>
                                                <button 
                                                    className="btn btn-outline-secondary" 
                                                    title="Edit"
                                                    onClick={() => handleEdit(teacher)}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                {teacher.isActive !== false && (
                                                    <button 
                                                        className="btn btn-outline-danger" 
                                                        title="Deactivate"
                                                        onClick={() => handleDelete(teacher._id)}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                )}
                                            </div>
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

export default TeacherManagement;