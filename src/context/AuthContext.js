import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const BASE_URL = 'http://localhost:55000/api';

    // Helper function for API calls
    const apiCall = async (endpoint, options = {}) => {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`API call failed to ${endpoint}:`, error);
            throw error;
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    await checkAuthStatus(token);
                } catch (error) {
                    console.error('Auth initialization failed:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const checkAuthStatus = async (token) => {
        try {
            const userData = await apiCall('/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setUser(userData);
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            console.log('Starting registration process...');
            const response = await apiCall('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });

            console.log('Registration successful');
            localStorage.setItem('token', response.token);
            setUser(response.user);
            return true;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const login = async (email, password) => {
        try {
            console.log('Starting login process...');
            const response = await apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            console.log('Login successful');
            localStorage.setItem('token', response.token);
            setUser(response.user);
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="text-lg">Loading...</div>
        </div>;
    }

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            register,
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