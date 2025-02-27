import React from 'react';
import './LoadingSpinner.css';

/**
 * Loading spinner component with configurable size and color
 * @param {Object} props - Component props
 * @param {string} [props.size='medium'] - Size of the spinner (small, medium, large)
 * @param {string} [props.color='blue'] - Color of the spinner (blue, gray, white)
 * @returns {JSX.Element}
 */
const LoadingSpinner = ({ size = 'medium', color = 'blue' }) => {
    const sizeClass = `spinner-${size}`;
    const colorClass = `spinner-${color}`;

    return (
        <div className={`spinner ${sizeClass} ${colorClass}`}>
            <div className="spinner-circle"></div>
        </div>
    );
};

export default LoadingSpinner;