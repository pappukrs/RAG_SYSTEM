"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isStreaming?: boolean;
}

interface ChatInterfaceProps {
    active: boolean;
}

export default function ChatInterface({ active }: ChatInterfaceProps) {
    const [query, setQuery] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
        const socket = io(socketUrl);
        socketRef.current = socket;

        socket.on('chunk', (chunk: string) => {
            setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.role === 'assistant' && lastMessage.isStreaming) {
                    return [
                        ...prev.slice(0, -1),
                        { ...lastMessage, content: lastMessage.content + chunk }
                    ];
                }
                return prev;
            });
            setLoading(false);
        });

        socket.on('done', () => {
            setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                    return [
                        ...prev.slice(0, -1),
                        { ...lastMessage, isStreaming: false }
                    ];
                }
                return prev;
            });
        });

        socket.on('error', (err: string) => {
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: `Error: ${err}`, timestamp: new Date() }
            ]);
            setLoading(false);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleSend = async () => {
        if (!query.trim() || loading || !socketRef.current) return;

        const userMessage: Message = {
            role: 'user',
            content: query,
            timestamp: new Date()
        };

        const assistantPlaceholder: Message = {
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            isStreaming: true
        };

        setMessages(prev => [...prev, userMessage, assistantPlaceholder]);
        setQuery('');
        setLoading(true);

        socketRef.current.emit('query', { question: query });
    };

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 mb-2">
                                <Sparkles className="text-blue-500 w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-100">How can I help you today?</h2>
                            <p className="text-slate-400 max-w-sm">
                                {active ? "Ask questions about your uploaded documents to get AI-powered insights." : "Upload a document in the sidebar to start chatting."}
                            </p>
                        </div>
                    ) : (
                        messages.map((m, i) => (
                            <div
                                key={i}
                                className={`flex gap-6 animate-in slide-in-from-bottom-2 duration-300 ${m.content === '' && m.isStreaming ? 'opacity-50' : ''}`}
                            >
                                <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${m.role === 'user' ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-slate-700 border border-slate-600'
                                    }`}>
                                    {m.role === 'user' ? <User size={18} /> : <Bot size={18} className="text-blue-400" />}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                        {m.role === 'user' ? 'You' : 'Assistant'}
                                    </p>
                                    <div className="text-slate-200 leading-relaxed prose prose-invert max-w-none min-h-[1.5em]">
                                        {m.content === '' && m.isStreaming ? (
                                            <div className="flex items-center gap-1 h-6">
                                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                                            </div>
                                        ) : (
                                            m.content.split('\n').map((line, idx) => (
                                                <p key={idx} className={idx > 0 ? "mt-2" : ""}>{line}</p>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-8 pt-0 mt-auto">
                <div className="max-w-3xl mx-auto relative group">
                    <textarea
                        rows={1}
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder={active ? "Send a message..." : "Upload a document to enable chat..."}
                        className={`w-full bg-[#1e293b]/50 backdrop-blur-md border ${active ? 'border-slate-700 focus:border-blue-500 group-hover:border-slate-600' : 'border-slate-800 opacity-50 cursor-not-allowed'
                            } rounded-2xl pl-6 pr-14 py-4 focus:outline-none transition-all resize-none shadow-2xl min-h-[60px] max-h-48 text-slate-100 placeholder:text-slate-500`}
                        disabled={!active || loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!active || loading || !query.trim()}
                        className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all ${query.trim() && active && !loading
                                ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    </button>
                    <p className="text-[10px] text-slate-600 mt-2 text-center">
                        AI can make mistakes. Consider checking important information.
                    </p>
                </div>
            </div>
        </div>
    );
}
