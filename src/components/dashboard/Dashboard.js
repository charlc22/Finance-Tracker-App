import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import BudgetDisplay from './BudgetDisplay';
import './Dashboard.css';
import {
    uploadBankStatement,
    fetchBankStatements,
    analyzeBankStatement,
    getAnalysisResults
} from '../../services/bankStatementService.js';

const Dashboard = () => {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [statements, setStatements] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [newExpense, setNewExpense] = useState({
        name: '',
        amount: '',
        category: 'food'
    });
    const [selectedBankFilter, setSelectedBankFilter] = useState('all');
    const [availableBanks, setAvailableBanks] = useState([]);

    // Bank color mapping for UI elements
    const bankColors = {
        'Wells Fargo': '#D71E28', // Red
        'TD Bank': '#2E8B57',     // Green
        'Chase': '#1A3766',       // Blue
        'Unknown Bank': '#777777' // Gray
    };

    useEffect(() => {
        loadStatements();
    }, []);

    const loadStatements = async () => {
        try {
            const statementsData = await fetchBankStatements();
            setStatements(statementsData);

            // Extract unique banks from statements
            const banks = [...new Set(statementsData
                .map(s => s.bankName || 'Unknown Bank')
                .filter(bankName => bankName !== 'Unknown Bank'))];

            setAvailableBanks(banks);

            // If we have any unprocessed statements, offer to process them
            const unprocessedStatements = statementsData.filter(s => !s.isProcessed);
            if (unprocessedStatements.length > 0) {
                console.log('Found unprocessed statements:', unprocessedStatements.length);
            }
        } catch (error) {
            console.error('Error loading statements:', error);
        }
    };

    const handleExpenseSubmit = (e) => {
        e.preventDefault();
        if (!newExpense.name || !newExpense.amount) return;

        const expense = {
            ...newExpense,
            id: Date.now(),
            date: new Date().toISOString()
        };

        setExpenses([...expenses, expense]);
        setNewExpense({
            name: '',
            amount: '',
            category: 'food'
        });
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setNewExpense(prev => ({
            ...prev,
            [id.replace('expense', '').toLowerCase()]: value
        }));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadError('');

        try {
            const result = await uploadBankStatement(file, file.name);
            console.log('Upload successful:', result);

            // Reload statements after upload
            await loadStatements();

            // Offer to analyze the newly uploaded statement
            if (result.statementId) {
                processStatement(result.statementId);
            }
        } catch (error) {
            console.error('Upload error:', error);
            setUploadError(error.response?.data?.error || 'Error uploading file');
        } finally {
            setUploading(false);
        }
    };

    const processStatement = async (statementId) => {
        setProcessing(true);
        try {
            const result = await analyzeBankStatement(statementId);
            console.log('Processing result:', result);

            if (result.isProcessed) {
                // If processed immediately, reload to get updated data
                await loadStatements();
            }
        } catch (error) {
            console.error('Processing error:', error);
        } finally {
            setProcessing(false);
        }
    };

    const viewAnalysis = async (statementId) => {
        try {
            const result = await getAnalysisResults(statementId);
            console.log('Analysis results:', result);
            // Data will be used by BudgetDisplay component through the statements prop
            // Just reload statements to make sure we have latest data
            await loadStatements();
        } catch (error) {
            console.error('Error fetching analysis:', error);
        }
    };

    // Handle bank filter change
    const handleBankFilterChange = (e) => {
        setSelectedBankFilter(e.target.value);
    };

    // Get filtered statements based on selected bank
    const getFilteredStatements = () => {
        if (selectedBankFilter === 'all') {
            return statements;
        }
        return statements.filter(s => s.bankName === selectedBankFilter);
    };

    // Get bank color for styling
    const getBankColor = (bankName) => {
        return bankColors[bankName] || '#777777';
    };

    // Get bank icon/emoji
    const getBankIcon = (bankName) => {
        const icons = {
            'Wells Fargo': '🔴',
            'TD Bank': '🟢',
            'Chase': '🔵',
            'Unknown Bank': '⚪'
        };
        return icons[bankName] || '🏦';
    };

    return (
        <div className="dashboard-container">
            <div className="welcome-header">
                <h2>Your Profile</h2>
                <p className="welcome-message">Welcome back, {user?.name || 'User'}!</p>
            </div>

            <BudgetDisplay expenses={expenses} statements={statements} />

            <section id="track" className="section">
                <h2>Track Your Expenses</h2>
                <form onSubmit={handleExpenseSubmit} className="styled-form">
                    <input
                        type="text"
                        id="expenseName"
                        placeholder="Expense Name"
                        value={newExpense.name}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="number"
                        id="expenseAmount"
                        placeholder="Amount"
                        value={newExpense.amount}
                        onChange={handleInputChange}
                        required
                    />
                    <select
                        id="expenseCategory"
                        value={newExpense.category}
                        onChange={handleInputChange}
                    >
                        <option value="food">Food</option>
                        <option value="rent">Rent</option>
                        <option value="utilities">Utilities</option>
                        <option value="clothes">Clothing</option>
                        <option value="vehicle">Vehicle</option>
                        <option value="other">Other</option>
                    </select>
                    <button type="submit" className="styled-button">
                        Add Expense
                    </button>
                </form>
            </section>

            <section id="uploads" className="section">
                <h2>Your Bank Statements</h2>

                {/* Bank filter selector */}
                {availableBanks.length > 0 && (
                    <div className="bank-filter">
                        <label htmlFor="bank-filter">Filter by Bank: </label>
                        <select
                            id="bank-filter"
                            value={selectedBankFilter}
                            onChange={handleBankFilterChange}
                            className="bank-select"
                            style={{
                                borderLeft: selectedBankFilter !== 'all'
                                    ? `4px solid ${getBankColor(selectedBankFilter)}`
                                    : '4px solid transparent'
                            }}
                        >
                            <option value="all">All Banks</option>
                            {availableBanks.map(bank => (
                                <option key={bank} value={bank}>
                                    {bank}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="upload-section">
                    <h3>Upload Statement</h3>
                    <p className="upload-info">
                        We support multiple banks including Wells Fargo, TD Bank, and Chase.
                        Just upload your PDF statement and we'll automatically detect your bank.
                    </p>

                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileUpload}
                        disabled={uploading || processing}
                        className="file-input"
                    />
                    {uploading && <p className="upload-status">Uploading...</p>}
                    {processing && <p className="upload-status">Processing statement...</p>}
                    {uploadError && <p className="error-message">{uploadError}</p>}

                    {statements.length > 0 && (
                        <div className="statements-list">
                            <h3>Uploaded Statements</h3>
                            <ul>
                                {getFilteredStatements().map(statement => (
                                    <li
                                        key={statement._id}
                                        className="statement-item"
                                        style={{
                                            borderLeft: `4px solid ${getBankColor(statement.bankName || 'Unknown Bank')}`
                                        }}
                                    >
                                        <div className="statement-details">
                                            <span className="statement-bank">
                                                {getBankIcon(statement.bankName || 'Unknown Bank')} {statement.bankName || 'Unknown Bank'}
                                            </span>
                                            <span className="statement-name">{statement.title}</span>
                                            <span className="statement-date">{new Date(statement.uploadDate).toLocaleDateString()}</span>
                                            <span className={statement.isProcessed ? 'status-processed' : 'status-pending'}>
                                                {statement.isProcessed ? 'Processed' : 'Pending'}
                                            </span>
                                        </div>
                                        <div className="statement-actions">
                                            {!statement.isProcessed ? (
                                                <button
                                                    onClick={() => processStatement(statement._id)}
                                                    disabled={processing}
                                                    className="process-button"
                                                >
                                                    Process
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => viewAnalysis(statement._id)}
                                                    className="view-button"
                                                >
                                                    View Analysis
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Dashboard;