"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, User, Calendar, ShieldCheck, ArrowRight, Loader2, Sparkles, MessageCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

interface AuthModalProps {
    isOpen: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function AuthModal({ isOpen }: AuthModalProps) {
    const { login } = useAuth();
    const [step, setStep] = useState<'mobile' | 'details' | 'otp'>('mobile');
    const [mobile, setMobile] = useState('');
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleMobileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mobile || mobile.length < 10) return setError('Invalid mobile number');

        setLoading(true);
        setError('');

        try {
            await axios.post(`${API_URL}/auth/send-otp`, { mobile });
            setStep('otp');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || otp.length < 6) return setError('Invalid OTP');

        setLoading(true);
        setError('');

        try {
            await login(mobile, otp, name, dob);
        } catch (err: any) {
            if (err.message.includes('Name is required')) {
                setStep('details');
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return setError('Name is required');

        setLoading(true);
        setError('');
        try {
            await login(mobile, otp, name, dob);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-background/40 backdrop-blur-2xl"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative w-full max-w-md bg-card/60 backdrop-blur-3xl border border-border/50 rounded-[2.5rem] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.5)] overflow-hidden"
            >
                {/* Decorative backgrounds */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />

                <div className="p-8 sm:p-12 flex flex-col items-center relative z-10">
                    <motion.div
                        initial={{ rotate: -10, scale: 0.8 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="w-20 h-20 bg-gradient-to-br from-primary via-primary/80 to-primary/40 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/40 mb-8 relative group"
                    >
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="absolute inset-0 bg-white/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"
                        />
                        <Sparkles size={38} className="text-primary-foreground relative z-10" />
                    </motion.div>

                    <h2 className="text-4xl font-black tracking-tighter text-center mb-3 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                        {step === 'mobile' ? 'Welcome Back' : step === 'details' ? 'Almost There' : 'Verify Identity'}
                    </h2>
                    <p className="text-muted-foreground text-center text-[15px] mb-10 font-medium leading-relaxed opacity-80">
                        {step === 'mobile'
                            ? 'Enter your mobile number to get started with RAG'
                            : step === 'details'
                                ? 'Please provide your details for first-time setup'
                                : `Enter the 6-digit code sent to ${mobile}`}
                    </p>

                    <form onSubmit={step === 'mobile' ? handleMobileSubmit : step === 'details' ? handleDetailsSubmit : handleOtpVerify} className="w-full space-y-5">
                        <AnimatePresence mode="wait">
                            {step === 'mobile' && (
                                <motion.div
                                    key="mobile"
                                    initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                                    className="space-y-4"
                                >
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-all duration-300">
                                            <Phone size={22} />
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="Mobile Number"
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                            className="w-full bg-secondary/40 border border-border/50 rounded-2xl py-5 pl-14 pr-5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all text-xl font-medium tracking-tight shadow-inner"
                                            required
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {step === 'details' && (
                                <motion.div
                                    key="details"
                                    initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                                    className="space-y-4"
                                >
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-all duration-300">
                                            <User size={22} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-secondary/30 border border-white/5 rounded-2xl py-5 pl-14 pr-5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-lg font-medium"
                                            required
                                        />
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-all duration-300">
                                            <Calendar size={22} />
                                        </div>
                                        <input
                                            type="date"
                                            placeholder="Date of Birth"
                                            value={dob}
                                            onChange={(e) => setDob(e.target.value)}
                                            className="w-full bg-secondary/30 border border-white/5 rounded-2xl py-5 pl-14 pr-5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-lg font-medium"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {step === 'otp' && (
                                <motion.div
                                    key="otp"
                                    initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                                    className="space-y-6"
                                >
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-all duration-300">
                                            <ShieldCheck size={22} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="000000"
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full bg-secondary/30 border border-white/5 rounded-2xl py-5 pl-14 pr-5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-3xl tracking-[0.6em] font-black text-center"
                                            required
                                        />
                                    </div>
                                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/70 text-center animate-pulse">
                                            Master OTP: 123456
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className="text-destructive text-xs font-bold text-center bg-destructive/10 py-3 px-4 rounded-xl border border-destructive/20"
                            >
                                {error}
                            </motion.div>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-primary-foreground rounded-2xl py-5 font-black flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-primary/40 transition-all disabled:opacity-50 relative overflow-hidden group"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            {loading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>
                                    <span className="tracking-tight text-lg">{step === 'otp' ? 'Complete Verification' : 'Continue'}</span>
                                    <ArrowRight size={22} />
                                </>
                            )}
                        </motion.button>
                    </form>

                    {step !== 'mobile' && (
                        <button
                            type="button"
                            onClick={() => setStep(step === 'details' ? 'otp' : 'mobile')}
                            className="mt-8 text-[11px] font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-[0.25em] opacity-60 hover:opacity-100 flex items-center gap-2 mx-auto"
                        >
                            ← Back to Previous Step
                        </button>
                    )}
                </div>

                <div className="bg-secondary/20 p-6 border-t border-border/30">
                    <div className="flex items-center gap-3 justify-center opacity-50">
                        <MessageCircle size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.25em]">End-to-End Encrypted Access</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
