import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <NavLink
                to="/"
                className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                }
            >
                Dashboard
            </NavLink>
            <NavLink
                to="/transactions"
                className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                }
            >
                Transactions
            </NavLink>
            <NavLink
                to="/reports"
                className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                }
            >
                Reports
            </NavLink>
            <NavLink
                to="/settings"
                className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                }
            >
                Settings
            </NavLink>
        </div>
    );
};

export default Sidebar;