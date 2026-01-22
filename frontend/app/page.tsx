"use client";

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ChatInterface from '@/components/ChatInterface';
import { PanelLeftClose, PanelLeftOpen, FileText } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
    const [fileUploaded, setFileUploaded] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <main className="flex h-screen bg-[#0f172a] text-slate-100 overflow-hidden">
            {/* Sidebar */}
            <div
                className={`transition-all duration-300 ease-in-out border-r border-slate-700/50 bg-[#0a0f1e]/80 backdrop-blur-xl flex flex-col ${isSidebarOpen ? 'w-80' : 'w-0'
                    }`}
            >
                <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
                    <div className="flex items-center gap-2 px-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                            <FileText size={18} className="text-white" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">RAG System</h1>
                    </div>

                    <div className="space-y-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">Documents</p>
                        <FileUpload onUpload={() => setFileUploaded(true)} />
                    </div>
                </div>

                <div className="p-4 border-t border-slate-700/50">
                    <Link
                        href="/doc"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-700/30 transition-all text-slate-400 hover:text-white"
                    >
                        <FileText size={18} />
                        <span className="text-sm font-medium">Documentation</span>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
                {/* Header/Toggle */}
                <header className="h-16 flex items-center px-4 border-b border-slate-700/10 z-10">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg hover:bg-slate-700/30 text-slate-400 hover:text-white transition-all"
                        title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                    >
                        {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                    </button>
                </header>

                <div className="flex-1 overflow-hidden">
                    <ChatInterface active={fileUploaded} />
                </div>
            </div>
        </main>
    );
}
