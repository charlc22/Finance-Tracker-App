import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            checkAuthStatus(token);
        } else {
            setLoading(false);
        }
    }, []);

    const checkAuthStatus = async (token) => {
        try {
            // Updated port to 5001
            const response = await fetch('http://localhost:55000/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                logout();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            console.log('Attempting registration with:', userData);
            const response = await fetch('http://localhost:55000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            console.log('Registration response status:', response.status);
            const data = await response.json();
            console.log('Registration response data:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            localStorage.setItem('token', data.token);
            setUser(data.user);
            return true;
        } catch (error) {
            console.error('Detailed registration error:', error);
            throw error;
        }
    };

    const login = async (email, password) => {
        try {
            console.log('Attempting login for:', email);
            const response = await fetch('http://localhost:55000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            console.log('Login response status:', response.status);
            const data = await response.json();
            console.log('Login response data:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            localStorage.setItem('token', data.token);
            setUser(data.user);
            return true;
        } catch (error) {
            console.error('Detailed login error:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated: !!user }}>
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