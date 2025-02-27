// src/services/bankStatementService.js
import axios from 'axios';

const API_URL = 'http://localhost:55000/api';

// Configure axios
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor for auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Uploads a bank statement PDF and returns the response
 * @param {File} file - The PDF file to upload
 * @param {string} title - Optional title for the statement
 * @returns {Promise} - Promise with upload response
 */
export const uploadBankStatement = async (file, title = '') => {
    try {
        const formData = new FormData();
        formData.append('statement', file);
        formData.append('title', title || file.name);

        const response = await api.post('/bankStatements/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error uploading bank statement:', error);
        throw error;
    }
};

/**
 * Fetch all bank statements for the current user
 * @returns {Promise} - Promise with list of statements
 */
export const fetchBankStatements = async () => {
    try {
        const response = await api.get('/bankStatements/statements');
        return response.data;
    } catch (error) {
        console.error('Error fetching bank statements:', error);
        throw error;
    }
};

/**
 * Request ML analysis for a bank statement
 * @param {string} statementId - ID of the statement to analyze
 * @returns {Promise} - Promise with analysis job status
 */
export const analyzeBankStatement = async (statementId) => {
    try {
        const response = await api.post(`/bankStatements/analyze/${statementId}`);
        return response.data;
    } catch (error) {
        console.error('Error requesting statement analysis:', error);
        throw error;
    }
};

/**
 * Check the status of an analysis job
 * @param {string} jobId - ID of the analysis job
 * @returns {Promise} - Promise with analysis status
 */
export const checkAnalysisStatus = async (jobId) => {
    try {
        const response = await api.get(`/bankStatements/analysis/status/${jobId}`);
        return response.data;
    } catch (error) {
        console.error('Error checking analysis status:', error);
        throw error;
    }
};

/**
 * Get the analysis results for a bank statement
 * @param {string} statementId - ID of the statement
 * @returns {Promise} - Promise with analysis results
 */
export const getAnalysisResults = async (statementId) => {
    try {
        const response = await api.get(`/bankStatements/analysis/${statementId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching analysis results:', error);
        throw error;
    }
};

export default {
    uploadBankStatement,
    fetchBankStatements,
    analyzeBankStatement,
    checkAnalysisStatus,
    getAnalysisResults
};