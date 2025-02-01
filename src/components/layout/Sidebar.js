// src/components/layout/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div className="w-64 bg-gray-100 min-h-screen p-4">
            <NavLink to="/" className="block py-2">Dashboard</NavLink>
        </div>
    );
};

export default Sidebar;