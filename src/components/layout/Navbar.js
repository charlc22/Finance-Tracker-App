// src/components/layout/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav>
            <Link to="/" className="navbar-brand">
                Wallet Wise
            </Link>
            <div className="navbar-links">
                <Link to="/about" className="navbar-link">About</Link>
                {user ? (
                    <>
                        <span className="welcome-text">Welcome, {user.name}</span>
                        <button
                            onClick={logout}
                            className="logout-button"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="navbar-link">Login</Link>
                        <Link to="/register" className="navbar-link">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;