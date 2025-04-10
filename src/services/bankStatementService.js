// src/services/bankStatementService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:55000/api';

// Configure axios with auth token interceptor
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to include auth token
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
 * Upload a Wells Fargo bank statement PDF
 * @param {File} file - The PDF file to upload
 * @param {string} title - Optional title for the statement
 * @returns {Promise<Object>} - The upload response
 */
export const uploadBankStatement = async (file, title = '') => {
    try {
        const formData = new FormData();
        formData.append('statement', file);
        formData.append('title', title || file.name);

        console.log('Uploading bank statement:', file.name, 'size:', file.size, 'type:', file.type);

        // Log the FormData contents
        for (let pair of formData.entries()) {
            console.log('FormData contains:', pair[0], pair[1]);
        }

        console.log('Making API request to:', API_URL + '/bankStatements/upload');

        const response = await api.post('/bankStatements/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            timeout: 30000, // 30 second timeout
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log(`Upload progress: ${percentCompleted}%`);
            }
        });

        console.log('Upload response received:', response.data);
        return response.data;
    } catch (error) {
        console.error('Upload failed:', error.message);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        }
        throw error;
    }
};

/**
 * Fetch all bank statements for the current user
 * @returns {Promise<Array>} - Array of bank statements
 */
export const fetchBankStatements = async () => {
    try {
        const response = await api.get('/bankStatements/statements');
        return response.data;
    } catch (error) {
        console.error('Error fetching bank statements:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Request processing for a bank statement that wasn't automatically processed
 * @param {string} statementId - ID of the statement to process
 * @returns {Promise<Object>} - The processing response
 */
export const analyzeBankStatement = async (statementId) => {
    try {
        const response = await api.post(`/bankStatements/analyze/${statementId}`);
        return response.data;
    } catch (error) {
        console.error('Error analyzing bank statement:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Get analysis results for a processed bank statement
 * @param {string} statementId - ID of the processed statement
 * @returns {Promise<Object>} - The analysis results
 */
export const getAnalysisResults = async (statementId) => {
    try {
        const response = await api.get(`/bankStatements/analysis/${statementId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching analysis results:', error.response?.data || error.message);
        throw error;
    }
};

export default {
    uploadBankStatement,
    fetchBankStatements,
    analyzeBankStatement,
    getAnalysisResults
};