// src/components/common/LoadingExample.js
import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

const LoadingExample = () => {
    const [isLoading, setIsLoading] = useState(false);

    // Simulate loading
    const handleClick = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    };

    return (
        <div className="p-4 space-y-8">
            {/* Full page loading overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-lg">
                        <LoadingSpinner size="large" color="blue" />
                        <p className="mt-2 text-center">Loading...</p>
                    </div>
                </div>
            )}

            {/* Different spinner sizes */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold">Spinner Sizes</h2>
                <div className="flex space-x-4 items-center">
                    <LoadingSpinner size="small" />
                    <LoadingSpinner size="medium" />
                    <LoadingSpinner size="large" />
                </div>
            </div>

            {/* Different spinner colors */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold">Spinner Colors</h2>
                <div className="flex space-x-4 items-center">
                    <LoadingSpinner color="blue" />
                    <LoadingSpinner color="gray" />
                    <div className="p-4 bg-blue-500">
                        <LoadingSpinner color="white" />
                    </div>
                </div>
            </div>

            {/* Button with loading state */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold">Loading Button Example</h2>
                <button
                    onClick={handleClick}
                    disabled={isLoading}
                    className="bg-blue-500 text-white px-4 py-2 rounded flex items-center space-x-2"
                >
                    {isLoading ? (
                        <>
                            <LoadingSpinner size="small" color="white" />
                            <span>Loading...</span>
                        </>
                    ) : (
                        <span>Click to Load</span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default LoadingExample;