"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import axios from 'axios';

interface User {
    id: number;
    name: string;
    mobile: string;
    dob?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (mobile: string, otp: string, name?: string, dob?: string) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        const storedToken = getCookie('rag_token') as string;
        if (storedToken) {
            setToken(storedToken);
            try {
                const response = await axios.get(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${storedToken}` }
                });
                setUser(response.data.user);
            } catch (error) {
                console.error('Failed to fetch user:', error);
                logout();
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (mobile: string, otp: string, name?: string, dob?: string) => {
        try {
            const response = await axios.post(`${API_URL}/auth/verify-otp`, {
                mobile,
                otp,
                name,
                dob
            });

            const { token, user } = response.data;
            setToken(token);
            setUser(user);
            setCookie('rag_token', token, { maxAge: 60 * 60 * 24 * 7 }); // 7 days
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Login failed');
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        deleteCookie('rag_token');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
