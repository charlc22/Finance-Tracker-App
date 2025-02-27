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

    useEffect(() => {
        loadStatements();
    }, []);

    const loadStatements = async () => {
        try {
            const statementsData = await fetchBankStatements();
            setStatements(statementsData);

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
                <div className="upload-section">
                    <h3>Upload Statement</h3>
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
                                {statements.map(statement => (
                                    <li key={statement._id} className="statement-item">
                                        <span>{statement.title}</span>
                                        <span>{new Date(statement.uploadDate).toLocaleDateString()}</span>
                                        <span className={statement.isProcessed ? 'status-processed' : 'status-pending'}>
                                            {statement.isProcessed ? 'Processed' : 'Pending'}
                                        </span>
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
