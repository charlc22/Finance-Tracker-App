// src/components/dashboard/PercentageChangeTable.js
import React from 'react';
import './PercentageChangeTable.css';

/**
 * Component to display percentage changes between two statements
 * @param {Object} props
 * @param {Array} props.categories - List of categories to display
 * @param {Array} props.firstValues - Values from first statement
 * @param {Array} props.secondValues - Values from second statement
 * @param {Object} props.firstStatement - First statement object (for date)
 * @param {Object} props.secondStatement - Second statement object (for date)
 * @returns {JSX.Element}
 */
const PercentageChangeTable = ({
                                   categories,
                                   firstValues,
                                   secondValues,
                                   firstStatement,
                                   secondStatement
                               }) => {
    if (!categories || !firstValues || !secondValues || categories.length === 0) {
        return null;
    }

    // Extract dates for column headers
    const getStatementDate = (statement) => {
        const date = new Date(statement.uploadDate);
        return date.toLocaleString('default', { month: 'short', year: 'numeric' });
    };

    const firstDate = getStatementDate(firstStatement);
    const secondDate = getStatementDate(secondStatement);

    // Calculate percentage changes and sort by absolute change
    const data = categories.map((category, index) => {
        const firstVal = firstValues[index] || 0;
        const secondVal = secondValues[index] || 0;
        const difference = secondVal - firstVal;

        // Handle division by zero
        let percentChange = 0;
        if (firstVal === 0 && secondVal === 0) {
            percentChange = 0;
        } else if (firstVal === 0) {
            percentChange = 100; // New category
        } else {
            percentChange = (difference / firstVal) * 100;
        }

        return {
            category,
            firstVal,
            secondVal,
            difference,
            percentChange
        };
    });

    // Filter out categories with zero values in both statements
    const filteredData = data.filter(item =>
        !(item.firstVal === 0 && item.secondVal === 0)
    );

    // Sort by absolute percentage change (descending)
    filteredData.sort((a, b) =>
        Math.abs(b.percentChange) - Math.abs(a.percentChange)
    );

    return (
        <div className="percent-change-table-container">
            <h3>Spending Change Overview</h3>

            <div className="percent-change-table">
                <div className="percent-change-header">
                    <div className="category-cell">Category</div>
                    <div className="value-cell">{firstDate}</div>
                    <div className="value-cell">{secondDate}</div>
                    <div className="change-cell">Change</div>
                </div>

                {filteredData.map((item, index) => (
                    <div
                        key={item.category}
                        className={`percent-change-row ${index % 2 === 0 ? 'even' : 'odd'}`}
                    >
                        <div className="category-cell">{item.category}</div>
                        <div className="value-cell">${item.firstVal.toFixed(2)}</div>
                        <div className="value-cell">${item.secondVal.toFixed(2)}</div>
                        <div className={`change-cell ${item.percentChange > 0 ? 'increase' : item.percentChange < 0 ? 'decrease' : 'neutral'}`}>
                            {item.percentChange === 0 ? 'No change' :
                                item.firstVal === 0 ? 'New' :
                                    item.secondVal === 0 ? 'Eliminated' :
                                        `${item.percentChange > 0 ? '+' : ''}${item.percentChange.toFixed(1)}%`}
                        </div>
                    </div>
                ))}
            </div>

            {filteredData.length === 0 && (
                <div className="no-data-message">
                    No comparable spending categories found.
                </div>
            )}
        </div>
    );
};

export default PercentageChangeTable;