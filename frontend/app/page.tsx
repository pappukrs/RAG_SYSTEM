"use client";

import { useState, useEffect } from 'react';
import FileUpload from '@/components/FileUpload';
import ChatInterface from '@/components/ChatInterface';
import { ThemeToggle } from '@/components/ThemeToggle';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/context/AuthContext';
import { PanelLeftClose, PanelLeftOpen, FileText, Menu, X, Sparkles, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
    const { user, loading, logout } = useAuth();
    const [fileUploaded, setFileUploaded] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Handle initial responsive state
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="text-primary"
                >
                    <Sparkles size={40} />
                </motion.div>
            </div>
        );
    }

    return (
        <main className="flex h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
            <AuthModal isOpen={!user} />

            {/* Sidebar - Desktop */}
            <motion.div
                initial={false}
                animate={{ width: isSidebarOpen ? 320 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 35 }}
                className="hidden lg:flex border-r border-border/30 bg-card/30 backdrop-blur-[40px] flex-col relative overflow-hidden z-20"
            >
                <div className="p-8 flex-1 flex flex-col gap-10 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-4 px-2">
                        <motion.div
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.5 }}
                            className="w-12 h-12 bg-gradient-to-br from-primary via-primary/80 to-primary/40 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30 relative group"
                        >
                            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Sparkles size={24} className="text-primary-foreground relative z-10" />
                        </motion.div>
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">RAG AI</h1>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] leading-tight">Insight Engine</span>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="px-2">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] mb-5 opacity-50">Content Management</p>
                            <FileUpload onUpload={() => setFileUploaded(true)} />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-white/[0.02]">
                    <Link
                        href="/doc"
                        className="flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-white/5 transition-all text-muted-foreground hover:text-primary group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                        <FileText size={20} className="group-hover:scale-110 transition-transform relative z-10" />
                        <span className="text-sm font-black tracking-tight relative z-10">Documentation</span>
                    </Link>
                </div>
            </motion.div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleMobileMenu}
                            className="fixed inset-0 z-50 bg-background/40 backdrop-blur-xl lg:hidden"
                        />
                        <motion.div
                            initial={{ x: "-100%", filter: "blur(10px)" }}
                            animate={{ x: 0, filter: "blur(0px)" }}
                            exit={{ x: "-100%", filter: "blur(10px)" }}
                            transition={{ type: "spring", stiffness: 300, damping: 35 }}
                            className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-[320px] bg-card/60 backdrop-blur-3xl border-r border-white/10 p-8 flex flex-col gap-10 lg:hidden shadow-[32px_0_64px_-16px_rgba(0,0,0,0.5)]"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30">
                                        <Sparkles size={24} className="text-primary-foreground" />
                                    </div>
                                    <h1 className="text-2xl font-black tracking-tighter">RAG AI</h1>
                                </div>
                                <button onClick={toggleMobileMenu} className="p-3 bg-secondary/30 hover:bg-secondary rounded-xl transition-all">
                                    <X size={22} />
                                </button>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] mb-5 opacity-50">Content Management</p>
                                    <FileUpload onUpload={() => {
                                        setFileUploaded(true);
                                        setIsMobileMenuOpen(false);
                                    }} />
                                </div>
                            </div>

                            <div className="mt-auto border-t border-white/5 pt-6">
                                <Link
                                    href="/doc"
                                    className="flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-white/5 transition-all text-muted-foreground hover:text-primary"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <FileText size={20} />
                                    <span className="text-sm font-black tracking-tight">Documentation</span>
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative overflow-hidden bg-background/50">
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-6 lg:px-10 border-b border-border/20 bg-background/40 backdrop-blur-3xl z-30 transition-all">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={toggleSidebar}
                            className="hidden lg:flex p-3 rounded-2xl hover:bg-white/5 text-muted-foreground hover:text-primary transition-all border border-transparent hover:border-white/10 group bg-card/30"
                            title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                        >
                            {isSidebarOpen ? <PanelLeftClose size={22} className="group-hover:-translate-x-0.5 transition-transform" /> : <PanelLeftOpen size={22} className="group-hover:translate-x-0.5 transition-transform" />}
                        </button>
                        <button
                            onClick={toggleMobileMenu}
                            className="lg:hidden p-3 rounded-2xl hover:bg-white/5 text-muted-foreground hover:text-primary transition-all border border-white/5 bg-card/30"
                        >
                            <Menu size={22} />
                        </button>
                        <div className="lg:hidden flex items-center gap-3">
                            <span className="text-xs font-black tracking-[0.3em] px-3.5 py-1.5 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/30">RAG</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <div className="hidden sm:flex p-1.5 bg-secondary/30 rounded-2xl border border-border/30 backdrop-blur-xl">
                            <ThemeToggle />
                        </div>

                        {user && (
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-4 pl-4 pr-3 py-2 rounded-[1.25rem] bg-secondary/20 hover:bg-secondary/40 transition-all border border-border/30 group shadow-lg hover:shadow-primary/10"
                                >
                                    <div className="flex flex-col items-end hidden md:flex">
                                        <span className="text-sm font-black tracking-tight leading-none mb-1">{user.name}</span>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none opacity-60">Verified Identity</span>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/40 flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/30 group-hover:scale-105 transition-all text-sm font-black">
                                        {user.name.charAt(0)}
                                    </div>
                                    <ChevronDown size={14} className={`text-muted-foreground transition-all duration-500 ${isProfileOpen ? 'rotate-180 text-primary' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: 15, filter: "blur(10px)" }}
                                                animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                                                exit={{ opacity: 0, scale: 0.95, y: 15, filter: "blur(10px)" }}
                                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                className="absolute right-0 mt-4 w-64 bg-card/90 backdrop-blur-[40px] border border-border/40 rounded-3xl shadow-[0_32px_80px_-16px_rgba(0,0,0,0.6)] p-3 z-50 overflow-hidden"
                                            >
                                                <div className="px-5 py-4 border-b border-border/20 mb-2 bg-secondary/20 rounded-2xl">
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] mb-2 opacity-60">Personal Profile</p>
                                                    <p className="text-sm font-black truncate tracking-tight">{user.mobile}</p>
                                                </div>
                                                <button className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl hover:bg-secondary/50 transition-all text-sm font-bold text-muted-foreground hover:text-foreground group">
                                                    <UserIcon size={18} className="group-hover:text-primary transition-colors" />
                                                    Account Settings
                                                </button>
                                                <button
                                                    onClick={() => { logout(); setIsProfileOpen(false); }}
                                                    className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl hover:bg-destructive/10 transition-all text-sm font-black text-destructive mt-1 group"
                                                >
                                                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                                                    Terminate Session
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-hidden relative">
                    {/* Background Decorative Elements */}
                    <div className="absolute top-1/4 -right-48 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none opacity-50" />
                    <div className="absolute bottom-1/4 -left-48 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none opacity-30" />

                    <ChatInterface
                        active={fileUploaded}
                        onUploadSuccess={() => setFileUploaded(true)}
                    />
                </div>
            </div>
        </main>
    );
}
