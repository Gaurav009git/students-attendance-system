import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg modern-navbar">
      <div className="container">
        <Link className="navbar-brand navbar-brand-modern" to="/">
          <span className="me-2">📊</span> SmartAttendance
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {user ? (
              <>
                <li className="nav-item me-3">
                  <div className="d-flex align-items-center">
                    <div 
                      className="rounded-circle bg-gradient d-flex align-items-center justify-content-center me-2"
                      style={{ 
                        width: '40px', 
                        height: '40px',
                        background: 'linear-gradient(145deg, #667eea, #764ba2)',
                        color: 'white'
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="d-block fw-bold">{user.name}</span>
                      <span className="badge" style={{ 
                        background: 'linear-gradient(145deg, #667eea, #764ba2)',
                        color: 'white',
                        padding: '3px 10px',
                        borderRadius: '50px',
                        fontSize: '11px'
                      }}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                </li>
                <li className="nav-item">
                  <Link 
                    className="nav-link" 
                    to={user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : '/student'}
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item ms-2">
                  <button 
                    className="btn btn-gradient btn-modern"
                    onClick={handleLogout}
                    style={{ padding: '8px 20px' }}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="btn btn-gradient btn-modern" to="/login">
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;