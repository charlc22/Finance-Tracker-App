// BudgetDisplay.js - Updated for dynamic categories
import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import './BudgetDisplay.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const TestBudgetDisplay = ({ expenses, statements }) => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatement, setSelectedStatement] = useState(null);

    // Color palette for consistent category colors
    const colorPalette = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
        '#9966FF', '#FF9F40', '#8AC926', '#1982C4',
        '#6A4C93', '#F3722C', '#F94144', '#90BE6D',
        '#577590', '#43AA8B', '#F8961E', '#277DA1'
    ];

    useEffect(() => {
        setLoading(true);

        // Find the most recently processed statement
        const processedStatements = statements?.filter(s => s.isProcessed) || [];

        if (processedStatements.length > 0) {
            // Sort by upload date descending and take the first one
            const mostRecent = processedStatements.sort(
                (a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)
            )[0];

            setSelectedStatement(mostRecent);
            prepareChartData(mostRecent);
        } else {
            setLoading(false);
        }
    }, [statements]);

    // Handle selecting a different statement
    const handleStatementSelect = (statementId) => {
        const statement = statements.find(s => s._id === statementId);
        if (statement && statement.isProcessed) {
            setSelectedStatement(statement);
            prepareChartData(statement);
        }
    };

    // Prepare chart data from statement data
    const prepareChartData = (statement) => {
        setLoading(true);
        setError(null);

        try {
            if (!statement || !statement.mlResults || !statement.mlResults.expenses) {
                throw new Error('No expense data found in statement');
            }

            const transactions = statement.mlResults.expenses;

            // Group by category and calculate totals
            const categoryTotals = transactions.reduce((acc, transaction) => {
                const { category, amount } = transaction;
                acc[category] = (acc[category] || 0) + amount;
                return acc;
            }, {});

            // Convert to arrays for chart.js
            const categories = Object.keys(categoryTotals);
            const amounts = Object.values(categoryTotals);

            // Sort categories by amount (largest first)
            const sortedIndexes = amounts.map((_, i) => i)
                .sort((a, b) => amounts[b] - amounts[a]);

            const sortedCategories = sortedIndexes.map(i => categories[i]);
            const sortedAmounts = sortedIndexes.map(i => amounts[i]);

            // Generate colors
            const colors = sortedCategories.map((_, i) =>
                colorPalette[i % colorPalette.length]
            );

            setChartData({
                labels: sortedCategories,
                datasets: [{
                    data: sortedAmounts,
                    backgroundColor: colors,
                    borderColor: colors.map(color => color.replace('0.8', '1')),
                    borderWidth: 1
                }]
            });
        } catch (err) {
            console.error('Error preparing chart data:', err);
            setError('Could not prepare chart data: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Calculate total expenses
    const totalExpenses = selectedStatement?.mlResults?.totalExpenses ||
        (chartData?.datasets[0]?.data?.reduce((sum, val) => sum + val, 0) || 0);

    return (
        <section className="section">
            <h2>Your Spending Summary</h2>

            {statements && statements.filter(s => s.isProcessed).length > 0 && (
                <div className="statement-selector">
                    <label htmlFor="statement-select">Select Statement:</label>
                    <select
                        id="statement-select"
                        value={selectedStatement?._id || ''}
                        onChange={(e) => handleStatementSelect(e.target.value)}
                    >
                        {statements
                            .filter(s => s.isProcessed)
                            .map(s => (
                                <option key={s._id} value={s._id}>
                                    {s.title} ({new Date(s.uploadDate).toLocaleDateString()})
                                </option>
                            ))
                        }
                    </select>
                </div>
            )}

            <div className="chart-container">
                {loading && (
                    <div className="chart-loading">
                        Loading expense data...
                    </div>
                )}

                {error && (
                    <div className="chart-error">
                        {error}
                    </div>
                )}

                {!loading && !error && chartData && (
                    <Doughnut
                        data={chartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'right',
                                    labels: {
                                        font: {
                                            size: 12
                                        }
                                    }
                                },
                                tooltip: {
                                    callbacks: {
                                        label: (context) => {
                                            const value = context.raw;
                                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                            const percentage = Math.round((value / total) * 100);
                                            return `$${value.toFixed(2)} (${percentage}%)`;
                                        }
                                    }
                                }
                            }
                        }}
                    />
                )}
            </div>

            {!loading && !error && chartData && (
                <div className="expense-summary">
                    <div className="total-expenses">
                        Total Expenses: ${totalExpenses.toFixed(2)}
                    </div>

                    <div className="expense-breakdown">
                        {chartData.labels.map((category, index) => {
                            const amount = chartData.datasets[0].data[index];
                            const percentage = Math.round((amount / totalExpenses) * 100);

                            return (
                                <div className="expense-category" key={category}>
                                    <span
                                        className="category-color"
                                        style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
                                    ></span>
                                    <span className="category-name">{category}</span>
                                    <span className="category-amount">${amount.toFixed(2)}</span>
                                    <span className="category-percent">{percentage}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {!loading && !error && !chartData && (
                <div className="no-data-message">
                    <p>No expense data available. Process a bank statement to see your spending breakdown.</p>
                </div>
            )}
        </section>
    );
};

export default BudgetDisplay;