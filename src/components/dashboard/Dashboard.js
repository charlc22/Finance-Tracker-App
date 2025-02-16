import React, { useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [newExpense, setNewExpense] = useState({
        name: '',
        amount: '',
        category: 'food'
    });

    // Chart.js data configuration
    const chartData = {
        labels: ['Food', 'Rent', 'Utilities', 'Clothing', 'Vehicle', 'Other'],
        datasets: [
            {
                label: 'Monthly Expenses',
                data: [850, 1200, 300, 400, 550, 250],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    // Chart.js options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: {
                        size: 14,
                        family: '"Nirmala Text", sans-serif'
                    },
                    padding: 20
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        return `${label}: $${value}`;
                    }
                }
            }
        },
        cutout: '60%'
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
                    <Doughnut
                        data={chartData}
                        options={chartOptions}
                    />
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
                    <h3>Upload Your Statement PDF</h3>
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