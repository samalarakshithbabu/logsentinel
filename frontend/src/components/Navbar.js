import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="fas fa-bug me-2"></i>
          Error Logger
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
          {isAuthenticated ? (
            <>
              <ul className="navbar-nav me-auto">
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">
                    <i className="fas fa-tachometer-alt me-1"></i>
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/logs">
                    <i className="fas fa-list me-1"></i>
                    Error Logs
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/analytics">
                    <i className="fas fa-chart-line me-1"></i>
                    Analytics
                  </Link>
                </li>
              </ul>
              
              <div className="d-flex align-items-center">
                <span className="navbar-text me-3">
                  <i className="fas fa-user me-1"></i>
                  {user?.name || user?.email}
                </span>
                <button 
                  className="btn btn-outline-light btn-sm"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt me-1"></i>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="ms-auto">
              <Link className="btn btn-outline-light btn-sm" to="/login">
                <i className="fas fa-sign-in-alt me-1"></i>
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;