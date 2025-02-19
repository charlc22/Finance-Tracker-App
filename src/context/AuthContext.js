import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const BASE_URL = 'http://localhost:55000/api';

    // Configure axios defaults
    axios.defaults.baseURL = BASE_URL;

    // Helper to clean token
    const cleanToken = (token) => {
        if (!token) return null;
        // Remove any existing Bearer prefix
        return token.replace(/^Bearer\s+/i, '');
    };

    // Axios interceptor for request debugging
    axios.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) {
            const cleanedToken = cleanToken(token);
            config.headers.Authorization = `Bearer ${cleanedToken}`;
            console.log('🔐 Request Headers:', {
                url: config.url,
                Authorization: config.headers.Authorization.substring(0, 20) + '...'
            });
        }
        return config;
    });

    // Axios interceptor for response debugging
    axios.interceptors.response.use(
        (response) => {
            console.log('✅ Response:', {
                url: response.config.url,
                status: response.status,
                data: response.data
            });
            return response;
        },
        (error) => {
            console.error('❌ Response Error:', {
                url: error.config?.url,
                status: error.response?.status,
                message: error.response?.data?.error || error.message
            });
            return Promise.reject(error);
        }
    );

    const login = async (email, password) => {
        try {
            console.log('🔑 Attempting login:', email);
            const response = await axios.post('/auth/login', { email, password });

            if (response.data.token) {
                console.log('✅ Login successful');
                // Store token without Bearer prefix
                localStorage.setItem('token', cleanToken(response.data.token));
                setUser(response.data.user);
                setError(null);
                return true;
            }
            throw new Error('No token received after login');
        } catch (error) {
            console.error('❌ Login failed:', error.response?.data || error.message);
            setError(error.response?.data?.error || error.message);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            console.log('📝 Starting registration...', userData.email);
            const response = await axios.post('/auth/register', userData);

            if (response.data.token) {
                console.log('✅ Registration successful');
                // Store token without Bearer prefix
                localStorage.setItem('token', cleanToken(response.data.token));
                setUser(response.data.user);
                setError(null);
                return true;
            }
            throw new Error('No token received after registration');
        } catch (error) {
            console.error('❌ Registration failed:', error.response?.data || error.message);
            setError(error.response?.data?.error || error.message);
            throw error;
        }
    };

    const logout = () => {
        console.log('👋 Logging out...');
        localStorage.removeItem('token');
        setUser(null);
        setError(null);
    };

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            console.log('🔄 Initializing Auth, Token exists:', !!token);
            if (token) {
                try {
                    await checkAuthStatus();
                } catch (error) {
                    console.error('❌ Auth initialization failed:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const checkAuthStatus = async () => {
        try {
            console.log('🔍 Checking auth status...');
            const response = await axios.get('/auth/verify');

            if (response.data.user) {
                console.log('✅ User verified:', response.data.user);
                setUser(response.data.user);
                setError(null);
            } else {
                console.log('❌ No user data in response');
                setUser(null);
                throw new Error('No user data received');
            }
        } catch (error) {
            console.error('❌ Auth check failed:', error.response?.data || error.message);
            setUser(null);
            setError(error.response?.data?.error || error.message);
            throw error;
        }
    };

    const value = {
        user,
        login,
        logout,
        register,
        loading,
        error,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;