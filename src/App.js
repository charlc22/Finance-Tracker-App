import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Import components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import PrivateRoute from './components/auth/PrivateRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import About from './components/pages/About'; // Import the About component
import './App.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="flex flex-col min-h-screen bg-gray-50">

                    {/* ⬇️ Move Navbar outside */}
                    <Navbar />

                    <div className="app-wrapper">
                        <div className="glow-overlay"/>
                        <div className="main-content">
                            <main className="flex-grow w-full">
                                <Routes>
                                    <Route path="/login" element={<Login/>}/>
                                    <Route path="/register" element={<Register/>}/>
                                    <Route path="/about" element={<About/>}/>
                                    <Route
                                        path="/dashboard"
                                        element={
                                            <PrivateRoute>
                                                <Dashboard/>
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
                                </Routes>
                            </main>
                            <Footer/>
                        </div>
                    </div>
                </div>
            </Router>
        </AuthProvider>
    );
}
export default App;