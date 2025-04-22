// src/components/dashboard/StatementComparison.js
import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import PercentageChangeTable from './PercentageChangeTable';
import MonthlySpendingSummary from './MonthlySpendingSummary';
import './StatementComparison.css';

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatementComparison = ({ statements }) => {
    const [selectedStatements, setSelectedStatements] = useState({
        first: null,
        second: null
    });
    const [comparisonData, setComparisonData] = useState(null);
    const [insights, setInsights] = useState([]);
    const [error, setError] = useState(null);

    const processedStatements = statements?.filter(s => s.isProcessed) || [];

    // Category color mapping (same as in BudgetDisplay to maintain consistency)
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

    // Handle statement selection
    const handleStatementSelect = (position, statementId) => {
        const statement = statements.find(s => s._id === statementId);

        setSelectedStatements(prev => ({
            ...prev,
            [position]: statement
        }));
    };

    // Extract statement date from title or filename (simple approach)
    const extractStatementDate = (statement) => {
        const uploadDate = new Date(statement.uploadDate);
        return uploadDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    // Generate comparison when both statements are selected
    useEffect(() => {
        if (selectedStatements.first && selectedStatements.second) {
            compareStatements();
        } else {
            setComparisonData(null);
            setInsights([]);
        }
    }, [selectedStatements]);

    // Main comparison logic
    const compareStatements = () => {
        try {
            const { first, second } = selectedStatements;

            if (!first.mlResults || !second.mlResults) {
                throw new Error('One or both statements are missing analysis data');
            }

            // Check if categoryBreakdown exists, as that's the most direct way to compare
            if (!first.mlResults.categoryBreakdown || !second.mlResults.categoryBreakdown) {
                throw new Error('Category breakdown data is missing');
            }

            // Get the categories from both statements
            const firstCategories = Object.keys(first.mlResults.categoryBreakdown);
            const secondCategories = Object.keys(second.mlResults.categoryBreakdown);

            // Combine unique categories
            const allCategories = [...new Set([...firstCategories, ...secondCategories])];

            // Prepare data for comparison chart
            const firstValues = allCategories.map(category =>
                first.mlResults.categoryBreakdown[category] || 0
            );

            const secondValues = allCategories.map(category =>
                second.mlResults.categoryBreakdown[category] || 0
            );

            // Set chart data
            setComparisonData({
                labels: allCategories,
                datasets: [
                    {
                        label: extractStatementDate(first),
                        data: firstValues,
                        backgroundColor: allCategories.map(category => {
                            const color = categoryColors[category] || '#9C9C9C';
                            return color + '80'; // Add transparency
                        }),
                        borderColor: allCategories.map(category => categoryColors[category] || '#9C9C9C'),
                        borderWidth: 1
                    },
                    {
                        label: extractStatementDate(second),
                        data: secondValues,
                        backgroundColor: allCategories.map(category => {
                            const color = categoryColors[category] || '#9C9C9C';
                            return color + 'CC'; // Less transparency
                        }),
                        borderColor: allCategories.map(category => categoryColors[category] || '#9C9C9C'),
                        borderWidth: 1
                    }
                ]
            });

            // Generate insights
            generateInsights(first, second, allCategories, firstValues, secondValues);

        } catch (err) {
            console.error('Error comparing statements:', err);
            setError('Could not compare statements: ' + err.message);
        }
    };

    // Generate spending insights
    const generateInsights = (first, second, categories, firstValues, secondValues) => {
        const newInsights = [];
        const firstDate = extractStatementDate(first);
        const secondDate = extractStatementDate(second);

        // Total spending comparison
        const firstTotal = first.mlResults.totalExpenses || firstValues.reduce((sum, val) => sum + val, 0);
        const secondTotal = second.mlResults.totalExpenses || secondValues.reduce((sum, val) => sum + val, 0);
        const totalDifference = secondTotal - firstTotal;
        const totalPercentChange = (totalDifference / firstTotal) * 100;

        newInsights.push({
            type: 'total',
            text: `Your total spending ${totalDifference > 0 ? 'increased' : 'decreased'} by $${Math.abs(totalDifference).toFixed(2)} (${Math.abs(totalPercentChange).toFixed(1)}%) from ${firstDate} to ${secondDate}.`,
            impact: totalDifference > 0 ? 'negative' : 'positive'
        });

        // Find category with biggest increase
        let maxIncrease = 0;
        let maxIncreaseCategory = '';
        let maxIncreasePercent = 0;

        // Find category with biggest decrease
        let maxDecrease = 0;
        let maxDecreaseCategory = '';
        let maxDecreasePercent = 0;

        categories.forEach((category, index) => {
            const firstValue = firstValues[index];
            const secondValue = secondValues[index];
            const difference = secondValue - firstValue;

            // Skip categories with 0 in both statements
            if (firstValue === 0 && secondValue === 0) return;

            // Calculate percent change (handle division by zero)
            const percentChange = firstValue === 0
                ? Infinity
                : (difference / firstValue) * 100;

            if (difference > maxIncrease) {
                maxIncrease = difference;
                maxIncreaseCategory = category;
                maxIncreasePercent = percentChange;
            }

            if (difference < maxDecrease) {
                maxDecrease = difference;
                maxDecreaseCategory = category;
                maxDecreasePercent = percentChange;
            }
        });

        // Add insights about biggest changes
        if (maxIncreaseCategory) {
            newInsights.push({
                type: 'increase',
                text: `Biggest spending increase: ${maxIncreaseCategory} grew by $${maxIncrease.toFixed(2)} ${!isFinite(maxIncreasePercent) ? '(new category)' : `(${maxIncreasePercent.toFixed(1)}%)`}.`,
                impact: 'negative',
                category: maxIncreaseCategory
            });
        }

        if (maxDecreaseCategory) {
            newInsights.push({
                type: 'decrease',
                text: `Biggest spending decrease: ${maxDecreaseCategory} reduced by $${Math.abs(maxDecrease).toFixed(2)} (${Math.abs(maxDecreasePercent).toFixed(1)}%).`,
                impact: 'positive',
                category: maxDecreaseCategory
            });
        }

        // New categories that appeared
        const newCategories = categories.filter(
            (category, index) => firstValues[index] === 0 && secondValues[index] > 0
        );

        if (newCategories.length > 0) {
            newInsights.push({
                type: 'new',
                text: `New spending ${newCategories.length > 1 ? 'categories' : 'category'}: ${newCategories.join(', ')}.`,
                impact: 'neutral'
            });
        }

        // Categories that disappeared
        const goneCategories = categories.filter(
            (category, index) => firstValues[index] > 0 && secondValues[index] === 0
        );

        if (goneCategories.length > 0) {
            newInsights.push({
                type: 'gone',
                text: `You no longer spent money on: ${goneCategories.join(', ')}.`,
                impact: 'positive'
            });
        }

        setInsights(newInsights);
    };

    // If there are fewer than 2 processed statements, show a message
    if (processedStatements.length < 2) {
        return (
            <section className="section comparison-section">
                <h2>Statement Comparison</h2>
                <div className="comparison-message">
                    <p>You need at least two processed bank statements to use the comparison feature.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="section comparison-section">
            <h2>Statement Comparison</h2>

            <div className="comparison-selectors">
                <div className="selector-container">
                    <label htmlFor="first-statement">First Statement:</label>
                    <select
                        id="first-statement"
                        value={selectedStatements.first?._id || ''}
                        onChange={(e) => handleStatementSelect('first', e.target.value)}
                    >
                        <option value="">Select a statement</option>
                        {processedStatements.map(statement => (
                            <option key={`first-${statement._id}`} value={statement._id}>
                                {statement.title} ({new Date(statement.uploadDate).toLocaleDateString()})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="selector-container">
                    <label htmlFor="second-statement">Second Statement:</label>
                    <select
                        id="second-statement"
                        value={selectedStatements.second?._id || ''}
                        onChange={(e) => handleStatementSelect('second', e.target.value)}
                    >
                        <option value="">Select a statement</option>
                        {processedStatements.map(statement => (
                            <option key={`second-${statement._id}`} value={statement._id}>
                                {statement.title} ({new Date(statement.uploadDate).toLocaleDateString()})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <div className="comparison-error">
                    {error}
                </div>
            )}

            {comparisonData && (
                <>
                    {/* Add monthly spending summary at the top */}
                    <MonthlySpendingSummary
                        firstStatement={selectedStatements.first}
                        secondStatement={selectedStatements.second}
                    />

                    <div className="comparison-chart-container">
                        <Bar
                            data={comparisonData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'top',
                                    },
                                    title: {
                                        display: true,
                                        text: 'Spending Comparison by Category',
                                    },
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        title: {
                                            display: true,
                                            text: 'Amount ($)'
                                        }
                                    }
                                }
                            }}
                        />
                    </div>

                    {/* Percentage change table */}
                    <PercentageChangeTable
                        categories={comparisonData.labels}
                        firstValues={comparisonData.datasets[0].data}
                        secondValues={comparisonData.datasets[1].data}
                        firstStatement={selectedStatements.first}
                        secondStatement={selectedStatements.second}
                    />
                </>
            )}

            {insights.length > 0 && (
                <div className="insights-container">
                    <h3>Spending Insights</h3>
                    <div className="insights-list">
                        {insights.map((insight, index) => (
                            <div
                                key={index}
                                className={`insight-item insight-${insight.impact}`}
                            >
                                <span className="insight-icon">
                                    {insight.impact === 'positive' ? '↓' :
                                        insight.impact === 'negative' ? '↑' : '•'}
                                </span>
                                <span className="insight-text">{insight.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!selectedStatements.first || !selectedStatements.second ? (
                <div className="comparison-help">
                    <p>Select two bank statements to compare your spending habits over time.</p>
                    <p>You'll see insights about how your spending has changed between the two periods.</p>
                </div>
            ) : null}
        </section>
    );
};

export default StatementComparison;