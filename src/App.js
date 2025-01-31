// App.js
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Page Components
import Dashboard from './components/dashboard/Dashboard';
import TransactionList from './components/transactions/TransactionList';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ReceiptUpload from './components/forms/ReceiptUpload';
import BankStatementForm from './components/forms/BankStatementForm';
import SpendingChart from './components/analysis/SpendingChart';

// Auth Guard Component
const PrivateRoute = ({ children }) => {
  // Replace this with your actual auth check
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
      <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <div className="flex">
            <Sidebar />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route path="/" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />

                <Route path="/transactions" element={
                  <PrivateRoute>
                    <TransactionList />
                  </PrivateRoute>
                } />

                <Route path="/upload-receipt" element={
                  <PrivateRoute>
                    <ReceiptUpload />
                  </PrivateRoute>
                } />

                <Route path="/bank-statement" element={
                  <PrivateRoute>
                    <BankStatementForm />
                  </PrivateRoute>
                } />

                <Route path="/analysis" element={
                  <PrivateRoute>
                    <SpendingChart />
                  </PrivateRoute>
                } />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
      </AuthProvider>
  );
}

export default App;
