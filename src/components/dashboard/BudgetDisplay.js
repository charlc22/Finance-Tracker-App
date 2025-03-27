// TestBudgetDisplay.js - With hardcoded values for testing
import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import './BudgetDisplay.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const BudgetDisplay = () => {
    // Hardcoded test data
    const chartData = {
        labels: ['Food', 'Rent', 'Utilities', 'Entertainment', 'Travel', 'Other'],
        datasets: [
            {
                label: 'Monthly Expenses',
                data: [350, 1200, 250, 200, 300, 150],
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

    // Calculate total (for hardcoded data)
    const totalExpenses = chartData.datasets[0].data.reduce((sum, val) => sum + val, 0);

    return (
        <section className="section">
            <h2>Your Spending Summary (Test Data)</h2>
            <div className="chart-container">
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
                                        return `$${value} (${percentage}%)`;
                                    }
                                }
                            }
                        }
                    }}
                />
            </div>

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
        </section>
    );
};

export default TestBudgetDisplay;