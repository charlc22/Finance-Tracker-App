// BudgetDisplay.js - Modified with thicker, centered placeholder chart
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

    // Initialize empty chart data with theme colors - using your actual category colors
    const [emptyChartData] = useState({
        labels: ['Education & Learning', 'E-Commerce', 'Entertainment & Recreation',
            'Automotive & Gas', 'Other', 'Retail & Clothing',
            'Restaurants & Fast Food', 'Groceries', 'Health & Fitness',
            'Travel & Transportation'],
        datasets: [{
            label: 'No Data',
            data: [25, 15, 15, 12, 8, 7, 7, 5, 3, 3],
            backgroundColor: [
                '#F3722C', // Education & Learning
                '#FF6384', // E-Commerce
                '#8AC926', // Entertainment & Recreation
                '#6A4C93', // Automotive & Gas
                '#9C9C9C', // Other
                '#1982C4', // Retail & Clothing
                '#4BC0C0', // Restaurants & Fast Food
                '#FFCE56', // Groceries
                '#FF6B6B', // Health & Fitness
                '#FF9F40'  // Travel & Transportation
            ],
            borderColor: [
                '#F3722C', '#FF6384', '#8AC926', '#6A4C93', '#9C9C9C',
                '#1982C4', '#4BC0C0', '#FFCE56', '#FF6B6B', '#FF9F40'
            ],
            borderWidth: 1
        }]
    });

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

    useEffect(() => {
        console.log("Statements changed:", statements?.length);
        setLoading(true);

        // Find the most recently processed statement
        const processedStatements = statements?.filter(s => s.isProcessed) || [];

        if (processedStatements.length > 0) {
            // Sort by upload date descending and take the first one
            const mostRecent = processedStatements.sort(
                (a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)
            )[0];

            console.log("Selected most recent statement:", mostRecent._id);
            setSelectedStatement(mostRecent);
            prepareChartData(mostRecent);
        } else {
            console.log("No processed statements found");
            setLoading(false);
        }
    }, [statements]);

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

    // Determine if we have real data or if we're showing the empty placeholder
    const hasRealData = !loading && !error && chartData &&
        !chartData.datasets[0].label.includes('No Data');

    // Chart options - same for both real and placeholder data
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '55%', // Thicker donut (was 70%)
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
                        // If this is the placeholder chart
                        if (!hasRealData) {
                            return 'Upload a statement to see your actual expenses';
                        }

                        // For real data, show dollar amount and percentage
                        const value = context.raw;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `$${value.toFixed(2)} (${percentage}%)`;
                    }
                }
            }
        }
    };

    return (
        <section className="section">
            <h2>Your Spending Summary</h2>

            {statements && statements.filter(s => s.isProcessed).length > 0 && (
                <div className="statement-selector">
                    <label htmlFor="statement-select">Select Statement: </label>
                    <select
                        id="statement-select"
                        value={selectedStatement?._id || ''}
                        onChange={handleStatementSelect}
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

                {!loading && !error && (
                    <Doughnut
                        data={hasRealData ? chartData : emptyChartData}
                        options={chartOptions}
                    />
                )}
            </div>

            {hasRealData ? (
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
            ) : (
                <div className="no-data-message">
                    <p>No expense data available. Process a bank statement to see your spending breakdown.</p>
                </div>
            )}
        </section>
    );
};

export default BudgetDisplay;