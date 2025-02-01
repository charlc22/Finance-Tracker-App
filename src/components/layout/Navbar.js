// src/components/layout/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="bg-blue-600 p-4">
            <Link to="/" className="text-white text-xl font-bold">Finance Tracker</Link>
        </nav>
    );
};

export default Navbar;