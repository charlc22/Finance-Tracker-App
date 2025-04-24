import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import BudgetDisplay from './BudgetDisplay';
import StatementComparison from './StatementComparison'; // Import the comparison component
import { ChevronDown, Upload, FileText, BarChart2 } from 'lucide-react'; // Import icons
import './Dashboard.css';
import {
    uploadBankStatement,
    fetchBankStatements,
    analyzeBankStatement,
    getAnalysisResults,
    deleteBankStatement
} from '../../services/bankStatementService.js';

const Dashboard = () => {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [statements, setStatements] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [activeTab, setActiveTab] = useState('analysis'); // Default tab
    const [newExpense, setNewExpense] = useState({
        name: '',
        amount: '',
        category: 'food'
    });

    useEffect(() => {
        loadStatements();
    }, []);

    const headerRef = useRef(null);
    // EFFECT TO MOVE THE GLOW ON MOUSEMOVE
    useEffect(() => {
        const header = headerRef.current;
        const glow   = header.querySelector('.cursor-glow');
            const onMove = e => {
            const { left, top } = header.getBoundingClientRect();
            const x = e.clientX - left;
            const y = e.clientY - top;
            glow.style.transition = 'transform 0.1s ease-out';
            glow.style.transform = `translate(${x}px, ${y}px) scale(1)`;
            };
        const onLeave = () => {
            glow.style.transition = 'transform 0.1s ease-out';
            glow.style.transform  = 'translate(-50%, -50%) scale(0)';
            };
        header.addEventListener('mousemove', onMove);
        header.addEventListener('mouseleave', onLeave);
        return () => {
            header.removeEventListener('mousemove', onMove);
            header.removeEventListener('mouseleave', onLeave);
            };
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

    const handleDeleteStatement = async (statementId) => {
        if (!window.confirm("Are you sure you want to delete this statement?")) return;
        try {
            await deleteBankStatement(statementId);
            await loadStatements(); // Refresh the list
        } catch (error) {
            console.error('Error deleting statement:', error);
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

            // Switch to analysis tab when viewing analysis
            setActiveTab('analysis');
        } catch (error) {
            console.error('Error fetching analysis:', error);
        }
    };

    // Navigation tabs for the dashboard with icons
    const renderTabs = () => {
        return (
            <div className="dashboard-tabs">
                <button
                    className={`tab-button ${activeTab === 'analysis' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analysis')}
                >
                    <BarChart2 size={18} className="mr-2" />
                    Spending Analysis
                </button>
                <button
                    className={`tab-button ${activeTab === 'comparison' ? 'active' : ''}`}
                    onClick={() => setActiveTab('comparison')}
                >
                    <FileText size={18} className="mr-2" />
                    Compare Statements
                </button>
                <button
                    className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
                    onClick={() => setActiveTab('upload')}
                >
                    <Upload size={18} className="mr-2" />
                    Manage Statements
                </button>
            </div>
        );
    };

    return (
        <div className="dashboard-container">
            <div className="welcome-header" ref={headerRef}>
                <h2 className="text-2xl font-bold">Your Profile</h2>
                <p className="welcome-message">Welcome back, {user?.name || 'User'}!</p>
                <div className="cursor-glow" />
            </div>

            {renderTabs()}

            {activeTab === 'analysis' && (
                <BudgetDisplay expenses={expenses} statements={statements} />
            )}

            {activeTab === 'comparison' && (
                <StatementComparison statements={statements} />
            )}

            {activeTab === 'upload' && (
                <>


                    <section className="section">
                        <h2 className="text-2xl font-bold mb-6">Your Bank Statements</h2>
                        <div className="upload-section">
                            <h3 className="text-xl font-semibold mb-4">Upload Statement</h3>

                            <div className="file-upload-container">
                                <label className="file-upload-label">
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handleFileUpload}
                                        disabled={uploading || processing}
                                        className="file-input-hidden"
                                    />
                                    <div className="file-upload-button">
                                        <Upload size={20} className="mr-2" />
                                        Choose PDF File
                                    </div>
                                </label>
                                <span className="file-upload-text">
                                        Supported Banks: Wells Fargo
                                    </span>
                            </div>

                            {uploading && (
                                <div className="upload-status">
                                    <div className="loading-spinner-small"></div>
                                    <span>Uploading your statement...</span>
                                </div>
                            )}

                            {processing && (
                                <div className="upload-status">
                                    <div className="loading-spinner-small"></div>
                                    <span>Processing statement data...</span>
                                </div>
                            )}

                            {uploadError && (
                                <div className="error-message">
                                    {uploadError}
                                </div>
                            )}

                            {statements.length > 0 && (
                                <div className="statements-list">
                                    <h3 className="text-xl font-semibold my-6">Uploaded Statements</h3>
                                    <div className="statements-grid">
                                        {statements.map(statement => (
                                            <div key={statement._id} className="statement-card">
                                                <div className="statement-card-header">
                                                    <div className="statement-icon">
                                                        <FileText size={24} />
                                                    </div>
                                                    <div className="statement-details">
                                                        <h4 className="statement-title">{statement.title}</h4>
                                                        <p className="statement-date">
                                                            {new Date(statement.uploadDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="statement-card-footer">
                                                    <div className={`status-badge ${statement.isProcessed ? 'status-processed' : 'status-pending'}`}>
                                                        {statement.isProcessed ? 'Processed' : 'Pending'}
                                                    </div>

                                                    <div className="statement-actions">
                                                        <button
                                                            onClick={() => handleDeleteStatement(statement._id)}
                                                            className="delete-button"
                                                        >
                                                            Delete
                                                        </button>
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
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default Dashboard;