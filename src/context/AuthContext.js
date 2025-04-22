// In AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const BASE_URL = 'http://localhost:55000/api';

    // Create axios instance with credentials enabled
    const api = axios.create({
        baseURL: BASE_URL,
        withCredentials: true
    });

    // Log requests for debugging
    api.interceptors.request.use(
        (config) => {
            console.log(`Request: ${config.method?.toUpperCase()} ${config.url}`, { withCredentials: config.withCredentials });
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Log responses for debugging
    api.interceptors.response.use(
        (response) => {
            console.log(`Response: ${response.status} from ${response.config.url}`);
            return response;
        },
        (error) => Promise.reject(error)
    );

    const login = async (email, password) => {
        try {
            console.log('🔑 Attempting login:', email);
            const response = await api.post('/auth/login', { email, password });

            console.log('Login successful:', response.data);
            setUser(response.data.user);
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            setError(error.response?.data?.error || error.message);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            console.log('📝 Registering user:', userData.email);
            const response = await api.post('/auth/register', userData);

            setUser(response.data.user);
            return true;
        } catch (error) {
            setError(error.response?.data?.error || error.message);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
        localStorage.removeItem('token'); // Clean up legacy token
        setUser(null);
    };

    const checkAuthStatus = async () => {
        try {
            console.log('Checking auth status...');
            const response = await api.get('/auth/verify');

            if (response.data?.user) {
                console.log('User verified:', response.data.user);
                setUser(response.data.user);
                return true;
            }
            console.log('No user in response');
            setUser(null);
            return false;
        } catch (error) {
            console.log('Not authenticated:', error.message);
            setUser(null);
            return false;
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            setLoading(true);
            try {
                await checkAuthStatus();
            } catch (error) {
                console.log('Auth initialization failed');
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            error,
            login,
            register,
            logout,
            isAuthenticated: !!user
        }}>
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