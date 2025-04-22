// BudgetDisplay.js - Enhanced for multi-bank support
import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import './BudgetDisplay.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const BudgetDisplay = ({ statements }) => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatement, setSelectedStatement] = useState(null);
    const [selectedBank, setSelectedBank] = useState('all');
    const [availableBanks, setAvailableBanks] = useState([]);

    // Color palette for consistent category colors
    const categoryColors = {
        'E-Commerce': '#FF6384',
        'Subscriptions & Streaming': '#36A2EB',
        'Groceries': '#FFCE56',
        'Restaurants & Fast Food': '#4BC0C0',
        'Utilities': '#9966FF',
        'Travel & Transportation': '#FF9F40',
        'Entertainment & Recreation': '#8AC926',
        'Health & Fitness': '#FF6B6B',
        'Retail & Clothing': '#1982C4',
        'Automotive & Gas': '#6A4C93',
        'Education & Learning': '#F3722C',
        'Home Improvement': '#43AA8B',
        'Insurance': '#577590',
        'Charity & Donations': '#F9C74F',
        'Financial Services & Banks': '#90BE6D',
        'Other': '#9C9C9C'
    };

    // Default color for categories not in our mapping
    const defaultColor = '#9C9C9C';

    // Find a color for a category
    const getCategoryColor = (category) => {
        return categoryColors[category] || defaultColor;
    };

    // Bank logo/icon color mapping
    const bankColors = {
        'Wells Fargo': '#D71E28', // Red
        'TD Bank': '#2E8B57',     // Green
        'Chase': '#1A3766',       // Blue
        'Unknown Bank': '#777777' // Gray
    };

    // Get a color for a bank (for UI elements)
    const getBankColor = (bankName) => {
        return bankColors[bankName] || '#777777';
    };

    useEffect(() => {
        console.log("Statements changed:", statements?.length);
        setLoading(true);

        if (statements?.length > 0) {
            // Extract unique banks from statements
            const banks = [...new Set(statements
                .filter(s => s.isProcessed)
                .map(s => s.bankName || 'Unknown Bank'))];

            setAvailableBanks(banks);

            // Find processed statements
            const processedStatements = statements.filter(s => s.isProcessed);

            if (processedStatements.length > 0) {
                // If a bank filter is active, apply it
                const filteredStatements = selectedBank !== 'all'
                    ? processedStatements.filter(s => s.bankName === selectedBank)
                    : processedStatements;

                if (filteredStatements.length > 0) {
                    // Sort by upload date descending and take the first one
                    const mostRecent = filteredStatements.sort(
                        (a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)
                    )[0];

                    console.log("Selected most recent statement:", mostRecent._id);
                    setSelectedStatement(mostRecent);
                    prepareChartData(mostRecent);
                } else {
                    setLoading(false);
                    setChartData(null);
                    setSelectedStatement(null);
                }
            } else {
                console.log("No processed statements found");
                setLoading(false);
            }
        } else {
            setAvailableBanks([]);
            setLoading(false);
        }
    }, [statements, selectedBank]);

    // Handle selecting a different statement
    const handleStatementSelect = (e) => {
        const statementId = e.target.value;
        console.log("Selected statement ID:", statementId);

        const statement = statements.find(s => s._id === statementId);
        if (statement && statement.isProcessed) {
            setSelectedStatement(statement);
            prepareChartData(statement);
        }
    };

    // Handle bank filter change
    const handleBankChange = (e) => {
        setSelectedBank(e.target.value);
    };

    // Prepare chart data from statement data
    const prepareChartData = (statement) => {
        setLoading(true);
        setError(null);

        try {
            console.log("Preparing chart data for statement:", statement._id);

            if (!statement || !statement.isProcessed) {
                throw new Error('Statement is not processed');
            }

            if (!statement.mlResults) {
                throw new Error('No ML results found in statement');
            }

            // First try to use the categoryBreakdown from the parser
            if (statement.mlResults.categoryBreakdown) {
                console.log("Using categoryBreakdown from parser");

                // Convert the category breakdown object to arrays for chart.js
                const categories = Object.keys(statement.mlResults.categoryBreakdown);
                const amounts = Object.values(statement.mlResults.categoryBreakdown);

                // Filter out zero-amount categories
                const filteredData = categories.map((cat, index) => ({
                    category: cat,
                    amount: amounts[index]
                })).filter(item => item.amount > 0);

                // Sort by amount (largest first)
                filteredData.sort((a, b) => b.amount - a.amount);

                const sortedCategories = filteredData.map(item => item.category);
                const sortedAmounts = filteredData.map(item => item.amount);

                // Generate colors
                const colors = sortedCategories.map(category => getCategoryColor(category));

                setChartData({
                    labels: sortedCategories,
                    datasets: [{
                        label: 'Expenses',
                        data: sortedAmounts,
                        backgroundColor: colors,
                        borderColor: colors,
                        borderWidth: 1
                    }]
                });
            } else if (statement.mlResults.expenses && statement.mlResults.expenses.length > 0) {
                console.log("Calculating categories from expenses");

                const transactions = statement.mlResults.expenses;

                // Group by category and calculate totals
                const categoryTotals = transactions.reduce((acc, transaction) => {
                    const { category, amount } = transaction;
                    if (!category) return acc;

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
                const colors = sortedCategories.map(category => getCategoryColor(category));

                setChartData({
                    labels: sortedCategories,
                    datasets: [{
                        label: 'Expenses',
                        data: sortedAmounts,
                        backgroundColor: colors,
                        borderColor: colors,
                        borderWidth: 1
                    }]
                });
            } else {
                throw new Error('No expense data found in statement');
            }
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

            {/* Statement selector */}
            {statements && statements.filter(s => s.isProcessed && (selectedBank === 'all' || s.bankName === selectedBank)).length > 0 && (
                <div className="statement-selector">
                    <label htmlFor="statement-select">Select Statement: </label>
                    <select
                        id="statement-select"
                        value={selectedStatement?._id || ''}
                        onChange={handleStatementSelect}
                        style={{
                            borderLeftColor: selectedStatement ? getBankColor(selectedStatement.bankName) : 'transparent',
                            borderLeftWidth: '4px'
                        }}
                    >
                        {statements
                            .filter(s => s.isProcessed && (selectedBank === 'all' || s.bankName === selectedBank))
                            .map(s => (
                                <option key={s._id} value={s._id}>
                                    {s.bankName} - {s.title} ({new Date(s.uploadDate).toLocaleDateString()})
                                </option>
                            ))
                        }
                    </select>
                </div>
            )}

            {/* Display bank information if a statement is selected */}
            {selectedStatement && (
                <div className="bank-info"
                     style={{
                         borderLeft: `4px solid ${getBankColor(selectedStatement.bankName)}`,
                         paddingLeft: '10px',
                         marginTop: '15px',
                         marginBottom: '20px'
                     }}>
                    <h3>{selectedStatement.bankName} Statement</h3>
                    <p>
                        <strong>Statement: </strong>{selectedStatement.title}<br />
                        <strong>Uploaded: </strong>{new Date(selectedStatement.uploadDate).toLocaleDateString()}<br />
                        <strong>Transactions: </strong>{selectedStatement.mlResults?.totalTransactions || 0}
                    </p>
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

            {!loading && !error && (!chartData || chartData.labels.length === 0) && (
                <div className="no-data-message">
                    <p>No expense data available. Process a bank statement to see your spending breakdown.</p>
                </div>
            )}
        </section>
    );
};

export default BudgetDisplay;