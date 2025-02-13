import React, { useState, useEffect } from 'react';
import { Line } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [newExpense, setNewExpense] = useState({
        name: '',
        amount: '',
        category: 'food'
    });

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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            // Handle PDF file upload
            const reader = new FileReader();
            reader.onload = (event) => {
                // Handle the PDF content
                console.log('PDF loaded');
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="welcome-header">
                <h2>Your Profile</h2>
                <p className="welcome-message">Welcome back, {user?.name || 'User'}!</p>
            </div>
            <section id="dashboard" className="section">
                <h2>Expense Overview</h2>
                <p>Track your monthly expenses and see where your money goes.</p>
                <div className="chart-container">
                    {/* Chart component will go here */}
                </div>
            </section>

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
                <ul className="expense-list">
                    {expenses.map(expense => (
                        <li key={expense.id} className="expense-item">
                            <span>{expense.name}</span>
                            <span>${expense.amount}</span>
                        </li>
                    ))}
                </ul>
            </section>

            <section id="comparison" className="section">
                <h2>How Do You Compare?</h2>
                <p>See how your spending compares to the national average.</p>
                <div className="chart-container">
                    {/* Comparison chart will go here */}
                </div>
            </section>

            <section id="uploads" className="section">
                <h2>Your Uploads</h2>
                <div className="upload-section">
                    <h3>Upload Your PDF</h3>
                    <input
                        type="file"
                        id="pdfInput"
                        accept="application/pdf"
                        onChange={handleFileChange}
                    />
                    <div id="pdfPreview" className="pdf-preview" />
                </div>
            </section>
        </div>
    );
};

export default Dashboard;