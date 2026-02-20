"use client";

import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Command, Paperclip, FileText, Copy, Edit, RotateCcw, Check, X, Terminal } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAuth } from '@/context/AuthContext';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    isStreaming?: boolean;
    isUploading?: boolean;
}

interface ChatInterfaceProps {
    active: boolean;
    onUploadSuccess?: () => void;
}

export default function ChatInterface({ active, onUploadSuccess }: ChatInterfaceProps) {
    const { token, user } = useAuth();
    const [query, setQuery] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [uploading, setUploading] = useState<boolean>(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [copiedCodeIndex, setCopiedCodeIndex] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading, uploading]);

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

    const sendMessage = (question: string, startFromIndex?: number) => {
        if (!socketRef.current) return;

        const assistantPlaceholder: Message = {
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            isStreaming: true
        };

        if (startFromIndex !== undefined) {
            setMessages(prev => [...prev.slice(0, startFromIndex + 1), assistantPlaceholder]);
        } else {
            setMessages(prev => [...prev, assistantPlaceholder]);
        }

        setLoading(true);
        if (socketRef.current) {
            socketRef.current.emit('query', { question, token });
        }
    };

    const handleSend = async () => {
        if (!query.trim() || loading || !socketRef.current) return;

        const userMessage: Message = {
            role: 'user',
            content: query,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        const q = query;
        setQuery('');
        sendMessage(q);
    };

    const handleCopy = (content: string, index: number) => {
        navigator.clipboard.writeText(content);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleCopyCode = (code: string, codeId: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCodeIndex(codeId);
        setTimeout(() => setCopiedCodeIndex(null), 2000);
    };

    const MarkdownComponents = {
        code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const codeContent = String(children).replace(/\n$/, '');
            const codeId = React.useMemo(() => Math.random().toString(36).substr(2, 9), []);

            return !inline && match ? (
                <div className="rounded-xl overflow-hidden border border-white/5 my-6 group/code bg-[#1a1b26] shadow-2xl">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <Terminal size={12} className="text-primary" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{match[1]}</span>
                        </div>
                        <button
                            onClick={() => handleCopyCode(codeContent, codeId)}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors bg-white/5 hover:bg-white/10"
                        >
                            {copiedCodeIndex === codeId ? (
                                <><Check size={10} className="text-emerald-500" /> Copied!</>
                            ) : (
                                <><Copy size={10} /> Copy</>
                            )}
                        </button>
                    </div>
                    <SyntaxHighlighter
                        style={atomDark}
                        language={match[1]}
                        PreTag="div"
                        className="!m-0 !bg-transparent !p-4 custom-syntax-highlighter"
                        {...props}
                    >
                        {codeContent}
                    </SyntaxHighlighter>
                </div>
            ) : (
                <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-mono text-[13px] font-medium" {...props}>
                    {children}
                </code>
            );
        },
        p({ children }: any) {
            return <p className="mb-4 last:mb-0 leading-relaxed text-[15px]">{children}</p>;
        },
        ul({ children }: any) {
            return <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>;
        },
        ol({ children }: any) {
            return <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>;
        },
        li({ children }: any) {
            return <li className="marker:text-primary">{children}</li>;
        },
        h1({ children }: any) {
            return <h1 className="text-2xl font-bold mt-8 mb-4 tracking-tight">{children}</h1>;
        },
        h2({ children }: any) {
            return <h2 className="text-xl font-bold mt-6 mb-3 tracking-tight">{children}</h2>;
        },
        h3({ children }: any) {
            return <h3 className="text-lg font-bold mt-5 mb-2 tracking-tight">{children}</h3>;
        },
        blockquote({ children }: any) {
            return <blockquote className="border-l-4 border-primary/30 pl-4 py-1 my-4 italic text-muted-foreground bg-primary/5 rounded-r-lg">{children}</blockquote>;
        }
    };

    const startEditing = (index: number, content: string) => {
        setEditingIndex(index);
        setEditValue(content);
    };

    const handleEditSave = (index: number) => {
        if (!editValue.trim() || !socketRef.current) return;

        const updatedMessages = [...messages];
        updatedMessages[index] = { ...updatedMessages[index], content: editValue };
        setMessages(updatedMessages.slice(0, index + 1));

        const q = editValue;
        setEditingIndex(null);
        setEditValue('');
        sendMessage(q, index);
    };

    const handleRegenerate = (index: number) => {
        if (loading || !socketRef.current) return;

        // Find the corresponding user message (should be index - 1)
        const userMessageIndex = index - 1;
        if (userMessageIndex < 0 || messages[userMessageIndex].role !== 'user') return;

        const question = messages[userMessageIndex].content;
        sendMessage(question, userMessageIndex);
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            await uploadFile(file);
        }
    };

    const uploadFile = async (file: File) => {
        setUploading(true);
        const uploadMessage: Message = {
            role: 'system',
            content: `Analyzing ${file.name}...`,
            timestamp: new Date(),
            isUploading: true
        };
        setMessages(prev => [...prev, uploadMessage]);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
            const uploadUrl = `${apiUrl.replace(/\/$/, '')}/upload`;
            await axios.post(uploadUrl, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessages(prev => [
                ...prev.slice(0, -1),
                {
                    role: 'system',
                    content: `Success! ${file.name} has been analyzed. You can now start asking questions.`,
                    timestamp: new Date()
                }
            ]);
            if (onUploadSuccess) onUploadSuccess();
        } catch (error) {
            console.error('Upload failed:', error);
            setMessages(prev => [
                ...prev.slice(0, -1),
                {
                    role: 'system',
                    content: `Error: Failed to upload ${file.name}. Please try again.`,
                    timestamp: new Date()
                }
            ]);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col h-full bg-background/30">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-8 lg:px-8 custom-scrollbar">
                <div className="max-w-3xl mx-auto space-y-10">
                    <AnimatePresence initial={false}>
                        {messages.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="h-full flex flex-col items-center justify-center text-center space-y-8 py-20"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                                    <div className="relative w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-[2.5rem] flex items-center justify-center border border-primary/20 shadow-2xl">
                                        <Sparkles className="text-primary w-12 h-12" />
                                    </div>
                                </div>
                                <div className="space-y-3 max-w-md">
                                    <h2 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50">
                                        Welcome to RAG
                                    </h2>
                                    <p className="text-muted-foreground text-lg font-medium leading-relaxed px-4">
                                        {active || messages.some(m => m.role === 'system')
                                            ? "Your documents are ready. Ask me anything to begin the analysis."
                                            : "Start by uploading a document to power our conversation."}
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            messages.map((m, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex gap-4 lg:gap-6 group relative ${m.content === '' && m.isStreaming ? 'opacity-80' : ''}`}
                                >
                                    <div className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105 ${m.role === 'user'
                                        ? 'bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-primary/20'
                                        : m.role === 'system'
                                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                            : 'bg-card border border-border/50 text-primary shadow-sm hover:border-primary/30 transition-colors'
                                        }`}>
                                        {m.role === 'user' ? <User size={22} /> : m.role === 'system' ? <FileText size={22} /> : <Bot size={22} />}
                                    </div>
                                    <div className="flex-1 space-y-2.5 pt-1.5 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-[0.2em] px-1">
                                                    {m.role === 'user' ? 'YOU' : m.role === 'system' ? 'SYSTEM' : 'RAG ASSISTANT'}
                                                </span>
                                                {(m.isStreaming || m.isUploading) && (
                                                    <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            {m.role !== 'system' && !m.isStreaming && !m.isUploading && (
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {m.role === 'user' ? (
                                                        <button
                                                            onClick={() => startEditing(i, m.content)}
                                                            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                                                            title="Edit message"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleCopy(m.content, i)}
                                                                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                                                                title="Copy response"
                                                            >
                                                                {copiedIndex === i ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                                            </button>
                                                            <button
                                                                onClick={() => handleRegenerate(i)}
                                                                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                                                                title="Regenerate response"
                                                            >
                                                                <RotateCcw size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className={`text-[15px] leading-relaxed break-words transition-all ${m.role === 'assistant'
                                            ? 'bg-card/60 backdrop-blur-xl p-6 rounded-[2rem] rounded-tl-xl border border-border/40 shadow-lg hover:shadow-primary/5 hover:border-primary/20'
                                            : m.role === 'system'
                                                ? 'bg-emerald-500/5 backdrop-blur-md p-5 rounded-2xl border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                                : editingIndex === i
                                                    ? 'bg-card/60 backdrop-blur-md p-0 rounded-2xl border border-primary/30'
                                                    : 'text-foreground font-medium px-5 py-4 bg-primary/10 rounded-[2rem] rounded-tr-xl inline-block'
                                            }`}>
                                            {editingIndex === i ? (
                                                <div className="p-1">
                                                    <textarea
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="w-full bg-transparent p-4 focus:outline-none resize-none min-h-[100px] text-foreground"
                                                        autoFocus
                                                    />
                                                    <div className="flex justify-end gap-2 p-3 border-t border-border/20">
                                                        <button
                                                            onClick={() => { setEditingIndex(null); setEditValue(''); }}
                                                            className="px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-secondary flex items-center gap-1.5 transition-all text-muted-foreground"
                                                        >
                                                            <X size={14} /> Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditSave(i)}
                                                            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground flex items-center gap-1.5 transition-all shadow-lg shadow-primary/20"
                                                        >
                                                            <Check size={14} /> Save & Submit
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : m.content === '' && m.isStreaming ? (
                                                <div className="flex items-center gap-2 h-6">
                                                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                                                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                                                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                                                </div>
                                            ) : m.isUploading ? (
                                                <div className="flex items-center gap-3">
                                                    <Loader2 size={16} className="animate-spin text-primary" />
                                                    <span className="font-semibold text-primary shimmer bg-clip-text">Analyzing documents...</span>
                                                </div>
                                            ) : (
                                                <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-code:text-primary">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={MarkdownComponents}
                                                    >
                                                        {m.content}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-6 md:p-10 pt-4 mt-auto">
                <div className="max-w-3xl mx-auto relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-[2.5rem] blur-lg opacity-0 group-focus-within:opacity-100 transition duration-1000 pointer-events-none"></div>
                    <div className="relative bg-card/80 backdrop-blur-[40px] rounded-[2rem] border border-border/40 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
                        <div className="flex items-end pr-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".pdf,.doc,.docx,.txt"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="p-4 mb-1 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                                title="Attach document"
                            >
                                <Paperclip size={22} />
                            </button>
                            <textarea
                                rows={1}
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = Math.min(e.target.scrollHeight, 192) + 'px';
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder={active || messages.some(m => m.role === 'system') ? "Type message..." : "Upload a document to start..."}
                                className={`flex-1 bg-transparent pl-2 pr-16 py-5 focus:outline-none transition-all resize-none text-[15px] text-foreground placeholder:text-muted-foreground/60 ${loading || uploading ? 'cursor-not-allowed' : ''}`}
                                disabled={loading || uploading}
                            />
                            <div className="absolute right-3 bottom-3 flex items-center gap-2">
                                <button
                                    onClick={handleSend}
                                    disabled={loading || uploading || !query.trim()}
                                    className={`p-2.5 rounded-2xl transition-all ${query.trim() && !loading && !uploading
                                        ? 'bg-primary text-primary-foreground hover:scale-105 active:scale-95 shadow-lg shadow-primary/30'
                                        : 'bg-muted/50 text-muted-foreground opacity-50 cursor-not-allowed'
                                        }`}
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-6 mt-5 opacity-40">
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        <Command size={10} />
                        <span>ENTER TO SEND</span>
                    </div>
                    <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        ENCRYPTED SEARCH
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: hsl(var(--muted));
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: hsl(var(--primary) / 0.3);
                }
                .custom-syntax-highlighter {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255,255,255,0.1) transparent;
                }
                .custom-syntax-highlighter::-webkit-scrollbar {
                    height: 4px;
                }
                .custom-syntax-highlighter::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
