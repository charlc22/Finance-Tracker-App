import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle } from 'lucide-react';
import './Register.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { register } = useAuth();

    const { name, email, password, confirmPassword } = formData;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const payload = {
                name: name.trim(),
                email: email.trim(),
                password
            };
            await register(payload);
            navigate('/dashboard');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="register-container">
            <div className="register-form-container">
                <h2 className="register-title">
                    Create your account
                </h2>
                <p className="register-subtitle">
                    Already have an account?{' '}
                    <Link to="/login" className="register-link">
                        Sign in
                    </Link>
                </p>

                <form className="register-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="error-message">
                            <AlertCircle className="error-icon" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="name" className="form-label">
                            Full Name
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className="form-input"
                            placeholder="John Doe"
                            value={name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="form-input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            className="form-input"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit" className="submit-button">
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;