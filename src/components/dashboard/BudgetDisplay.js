import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const BudgetDisplay = ({ expenses, statements }) => {
    const [chartData, setChartData] = useState({
        labels: ['Food', 'Rent', 'Utilities', 'Clothing', 'Vehicle', 'Other'],
        datasets: [{
            label: 'Monthly Expenses',
            data: [0, 0, 0, 0, 0, 0],
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
            borderWidth: 1
        }]
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalExpenses, setTotalExpenses] = useState(0);

    // Create an object to map categories to array indices
    const categoryIndices = {
        'food': 0,
        'rent': 1,
        'utilities': 2,
        'clothes': 3,
        'clothing': 3, // Allow for both naming conventions
        'vehicle': 4,
        'other': 5
    };

    useEffect(() => {
        // Process form expenses (manually added by user)
        if (expenses && expenses.length > 0) {
            processExpenses(expenses);
        }
    }, [expenses]);

    useEffect(() => {
        // Process bank statement data when statements change
        if (statements && statements.length > 0) {
            const processedStatements = statements.filter(statement => statement.isProcessed);

            if (processedStatements.length > 0) {
                fetchStatementData(processedStatements);
            }
        }
    }, [statements]);

    const fetchStatementData = async (processedStatements) => {
        setLoading(true);
        setError(null);

        try {
            // Sort by most recent first
            const latestStatement = processedStatements.sort((a, b) =>
                new Date(b.uploadDate) - new Date(a.uploadDate)
            )[0];

            // Fetch the detailed ML results for this statement
            const response = await axios.get(`/api/bankStatements/analysis/${latestStatement._id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data && response.data.mlResults) {
                processMLResults(response.data.mlResults);
            }
        } catch (err) {
            console.error('Error fetching statement analysis:', err);
            setError('Could not load expense analysis. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const processExpenses = (expenseList) => {
        // Copy the current chart data
        const newData = [...chartData.datasets[0].data];
        let newTotal = 0;

        // Process each expense
        expenseList.forEach(expense => {
            const category = expense.category.toLowerCase();
            const amount = parseFloat(expense.amount);

            if (!isNaN(amount)) {
                const index = categoryIndices[category] !== undefined ?
                    categoryIndices[category] : categoryIndices['other'];

                newData[index] += amount;
                newTotal += amount;
            }
        });

        // Update the chart data
        setChartData(prev => ({
            ...prev,
            datasets: [{
                ...prev.datasets[0],
                data: newData
            }]
        }));

        setTotalExpenses(newTotal);
    };

    const processMLResults = (mlResults) => {
        // Copy the current chart data to avoid direct state mutation
        const newData = [0, 0, 0, 0, 0, 0]; // Reset data
        let newTotal = 0;

        // Process each expense from ML results
        if (mlResults.expenses && mlResults.expenses.length > 0) {
            mlResults.expenses.forEach(expense => {
                const category = expense.category.toLowerCase();
                const amount = parseFloat(expense.amount);

                if (!isNaN(amount)) {
                    const index = categoryIndices[category] !== undefined ?
                        categoryIndices[category] : categoryIndices['other'];

                    newData[index] += amount;
                    newTotal += amount;
                }
            });
        } else if (mlResults.totalExpenses) {
            // If we only have total but no breakdown, put it in "other"
            newData[5] = mlResults.totalExpenses;
            newTotal = mlResults.totalExpenses;
        }

        // Update the chart data
        setChartData(prev => ({
            ...prev,
            datasets: [{
                ...prev.datasets[0],
                data: newData
            }]
        }));

        setTotalExpenses(newTotal);
    };

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
                        const percentage = totalExpenses ?
                            Math.round((value / totalExpenses) * 100) : 0;
                        return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                    }
                }
            }
        },
        cutout: '60%'
    };

    return (
        <div className="section">
            <h2>Expense Overview</h2>
            <p>Track your monthly expenses and see where your money goes.</p>
            {loading && <div className="chart-loading">Loading expense data...</div>}
            {error && <div className="chart-error">{error}</div>}

            <div className="chart-container">
                <Doughnut data={chartData} options={chartOptions} />
            </div>

            <div className="expense-summary">
                <p className="total-expenses">Total Expenses: ${totalExpenses.toFixed(2)}</p>
                {totalExpenses > 0 && (
                    <div className="expense-breakdown">
                        {chartData.labels.map((category, index) => (
                            <div key={category} className="expense-category">
                                <span className="category-color"
                                      style={{backgroundColor: chartData.datasets[0].backgroundColor[index]}}></span>
                                <span className="category-name">{category}</span>
                                <span className="category-amount">${chartData.datasets[0].data[index].toFixed(2)}</span>
                                <span className="category-percent">
                                    {Math.round((chartData.datasets[0].data[index] / totalExpenses) * 100)}%
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BudgetDisplay;