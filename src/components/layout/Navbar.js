// components/layout/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="bg-blue-600 p-4">
            <Link to="/" className="text-white text-xl font-bold">Finance Tracker</Link>
        </nav>
    );
};

// components/layout/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div className="w-64 bg-gray-100 min-h-screen p-4">
            <NavLink to="/" className="block py-2">Dashboard</NavLink>
            <NavLink to="/transactions" className="block py-2">Transactions</NavLink>
            <NavLink to="/upload-receipt" className="block py-2">Upload Receipt</NavLink>
            <NavLink to="/bank-statement" className="block py-2">Bank Statement</NavLink>
            <NavLink to="/analysis" className="block py-2">Analysis</NavLink>
        </div>
    );
};

// components/dashboard/Dashboard.js
import React from 'react';

const Dashboard = () => {
    return <div className="p-4"><h1>Dashboard</h1></div>;
};

// components/transactions/TransactionList.js
import React from 'react';

const TransactionList = () => {
    return <div className="p-4"><h1>Transactions</h1></div>;
};

// components/auth/Login.js
import React from 'react';

const Login = () => {
    return <div className="p-4"><h1>Login</h1></div>;
};

// components/auth/Register.js
import React from 'react';

const Register = () => {
    return <div className="p-4"><h1>Register</h1></div>;
};

// components/forms/ReceiptUpload.js
import React from 'react';

const ReceiptUpload = () => {
    return <div className="p-4"><h1>Upload Receipt</h1></div>;
};

// components/forms/BankStatementForm.js
import React from 'react';

const BankStatementForm = () => {
    return <div className="p-4"><h1>Bank Statement Upload</h1></div>;
};

// components/analysis/SpendingChart.js
import React from 'react';

const SpendingChart = () => {
    return <div className="p-4"><h1>Spending Analysis</h1></div>;
};

export {
    Navbar,
    Sidebar,
    Dashboard,
    TransactionList,
    Login,
    Register,
    ReceiptUpload,
    BankStatementForm,
    SpendingChart
};