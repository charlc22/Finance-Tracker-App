import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import BudgetDisplay from './BudgetDisplay';
import './Dashboard.css';

// Create an axios instance with proper config
const api = axios.create({
    baseURL: 'http://localhost:55000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor for auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('Request config:', {
            url: config.url,
            headers: config.headers,
            method: config.method
        });
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const Dashboard = () => {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [statements, setStatements] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [newExpense, setNewExpense] = useState({
        name: '',
        amount: '',
        category: 'food'
    });

    useEffect(() => {
        fetchStatements();
        console.log('Current token:', localStorage.getItem('token'));
    }, []);

    const fetchStatements = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('\n=== Fetch Statements Debug ===');
            console.log('Token being used:', token ? `${token.substring(0, 20)}...` : 'none');

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };
            console.log('Request config:', config);

            const response = await api.get('/bankStatements/statements', config);
            console.log('Response:', response.data);

            setStatements(response.data);
        } catch (error) {
            console.error('Error fetching statements:', error.response?.data || error.message);
            if (error.response?.status === 401) {
                console.log('Token validation failed - you might need to log in again');
            }
        }
    };

    const handleExpenseSubmit = (e) => {
        e.preventDefault();
        if (!newExpense.name || !newExpense.amount) return;

        const expense = {
            ...newExpense,
            id: Date.now(),
            date: new Date().toISOString()
        };

        setExpenses([...expenses, expense]);
        setNewExpense({
            name: '',
            amount: '',
            category: 'food'
        });
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setNewExpense(prev => ({
            ...prev,
            [id.replace('expense', '').toLowerCase()]: value
        }));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadError('');

        const formData = new FormData();
        formData.append('statement', file);
        formData.append('title', file.name);

        try {
            await api.post('/bankStatements/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            await fetchStatements();
        } catch (error) {
            console.error('Upload error:', error);
            setUploadError(error.response?.data?.error || 'Error uploading file');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="welcome-header">
                <h2>Your Profile</h2>
                <p className="welcome-message">Welcome back, {user?.name || 'User'}!</p>
            </div>

            <BudgetDisplay expenses={expenses} />

            <section id="track" className="section">
                <h2>Track Your Expenses</h2>
                <form onSubmit={handleExpenseSubmit} className="styled-form">
                    <input
                        type="text"
                        id="expenseName"
                        placeholder="Expense Name"
                        value={newExpense.name}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="number"
                        id="expenseAmount"
                        placeholder="Amount"
                        value={newExpense.amount}
                        onChange={handleInputChange}
                        required
                    />
                    <select
                        id="expenseCategory"
                        value={newExpense.category}
                        onChange={handleInputChange}
                    >
                        <option value="food">Food</option>
                        <option value="rent">Rent</option>
                        <option value="utilities">Utilities</option>
                        <option value="clothes">Clothing</option>
                        <option value="vehicle">Vehicle</option>
                        <option value="other">Other</option>
                    </select>
                    <button type="submit" className="styled-button">
                        Add Expense
                    </button>
                </form>
            </section>

            <section id="uploads" className="section">
                <h2>Your Bank Statements</h2>
                <div className="upload-section">
                    <h3>Upload Statement</h3>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="file-input"
                    />
                    {uploading && <p className="upload-status">Uploading...</p>}
                    {uploadError && <p className="error-message">{uploadError}</p>}

                    {statements.length > 0 && (
                        <div className="statements-list">
                            <h3>Uploaded Statements</h3>
                            <ul>
                                {statements.map(statement => (
                                    <li key={statement._id} className="statement-item">
                                        <span>{statement.title}</span>
                                        <span>{new Date(statement.uploadDate).toLocaleDateString()}</span>
                                        <span>{statement.isProcessed ? 'Processed' : 'Pending'}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Dashboard;