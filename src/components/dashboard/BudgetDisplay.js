import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const BudgetDisplay = ({ expenses }) => {
    // Chart data
    const chartData = {
        labels: ['Food', 'Rent', 'Utilities', 'Clothing', 'Vehicle', 'Other'],
        datasets: [{
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
            borderWidth: 1
        }]
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
                        return `${label}: $${value.toFixed(2)}`;
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
            <div className="chart-container">
                <Doughnut data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

export default BudgetDisplay;