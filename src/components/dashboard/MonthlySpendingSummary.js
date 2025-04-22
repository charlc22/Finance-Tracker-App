// src/components/dashboard/MonthlySpendingSummary.js
import React from 'react';
import './MonthlySpendingSummary.css';

/**
 * Component to display a summary of total spending changes between two statements
 * @param {Object} props
 * @param {Object} props.firstStatement - First statement object
 * @param {Object} props.secondStatement - Second statement object
 * @returns {JSX.Element}
 */
const MonthlySpendingSummary = ({ firstStatement, secondStatement }) => {
    if (!firstStatement || !secondStatement) {
        return null;
    }

    // Extract dates
    const getStatementDate = (statement) => {
        const date = new Date(statement.uploadDate);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    const firstDate = getStatementDate(firstStatement);
    const secondDate = getStatementDate(secondStatement);

    // Get totals from statements
    const firstTotal = firstStatement.mlResults?.totalExpenses || 0;
    const secondTotal = secondStatement.mlResults?.totalExpenses || 0;

    // Calculate change
    const difference = secondTotal - firstTotal;
    const percentChange = firstTotal > 0 ? (difference / firstTotal) * 100 : 0;
    const isIncrease = difference > 0;

    // Get most expensive category from each statement
    const getMostExpensiveCategory = (statement) => {
        if (!statement.mlResults?.categoryBreakdown) {
            return { category: 'Unknown', amount: 0 };
        }

        const categories = Object.keys(statement.mlResults.categoryBreakdown);
        const amounts = Object.values(statement.mlResults.categoryBreakdown);

        if (categories.length === 0) {
            return { category: 'Unknown', amount: 0 };
        }

        let maxIndex = 0;
        let maxAmount = amounts[0];

        for (let i = 1; i < amounts.length; i++) {
            if (amounts[i] > maxAmount) {
                maxAmount = amounts[i];
                maxIndex = i;
            }
        }

        return {
            category: categories[maxIndex],
            amount: maxAmount
        };
    };

    const firstTopCategory = getMostExpensiveCategory(firstStatement);
    const secondTopCategory = getMostExpensiveCategory(secondStatement);

    return (
        <div className="monthly-summary-container">
            <h3>Monthly Spending Summary</h3>

            <div className="monthly-summary-cards">
                <div className="summary-card">
                    <div className="summary-header">{firstDate}</div>
                    <div className="summary-total">${firstTotal.toFixed(2)}</div>
                    <div className="summary-detail">
                        <span className="detail-label">Top Category:</span>
                        <span className="detail-value">{firstTopCategory.category}</span>
                    </div>
                    <div className="summary-detail">
                        <span className="detail-label">Top Spending:</span>
                        <span className="detail-value">${firstTopCategory.amount.toFixed(2)}</span>
                    </div>
                </div>

                <div className="summary-change">
                    <div className={`change-indicator ${isIncrease ? 'increase' : 'decrease'}`}>
                        {isIncrease ? '↑' : '↓'}
                    </div>
                    <div className="change-value">
                        {isIncrease ? '+' : ''}{difference.toFixed(2)}
                    </div>
                    <div className="change-percent">
                        {isIncrease ? '+' : ''}{percentChange.toFixed(1)}%
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-header">{secondDate}</div>
                    <div className="summary-total">${secondTotal.toFixed(2)}</div>
                    <div className="summary-detail">
                        <span className="detail-label">Top Category:</span>
                        <span className="detail-value">{secondTopCategory.category}</span>
                    </div>
                    <div className="summary-detail">
                        <span className="detail-label">Top Spending:</span>
                        <span className="detail-value">${secondTopCategory.amount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="summary-trend">
                {isIncrease ? (
                    <p className="trend-increase">
                        Your spending increased by ${Math.abs(difference).toFixed(2)} ({Math.abs(percentChange).toFixed(1)}%)
                        from {firstDate} to {secondDate}.
                    </p>
                ) : (
                    <p className="trend-decrease">
                        Your spending decreased by ${Math.abs(difference).toFixed(2)} ({Math.abs(percentChange).toFixed(1)}%)
                        from {firstDate} to {secondDate}.
                    </p>
                )}
            </div>
        </div>
    );
};

export default MonthlySpendingSummary;