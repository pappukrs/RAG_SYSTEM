"use client";

import React, { useState, ChangeEvent } from 'react';
import { Upload, File, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

interface FileUploadProps {
    onUpload: () => void;
}

export default function FileUpload({ onUpload }: FileUploadProps) {
    const { token } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setUploadStatus('idle');
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setUploadStatus('idle');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
            const uploadUrl = `${apiUrl.replace(/\/$/, '')}/upload`;
            await axios.post(uploadUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            setUploadStatus('success');
            onUpload();
            setTimeout(() => {
                setFile(null);
                setUploadStatus('idle');
            }, 3000);
        } catch (error) {
            console.error('Upload failed:', error);
            setUploadStatus('error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`relative border-2 border-dashed rounded-[1.5rem] p-8 transition-all duration-300 group ${file
                    ? 'border-primary bg-primary/5 shadow-inner'
                    : 'border-border/60 hover:border-primary/50 bg-secondary/20 hover:bg-primary/5'
                    }`}
            >
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept=".pdf,.docx,.txt"
                />
                <div className="flex flex-col items-center justify-center gap-4 text-center pointer-events-none">
                    <div className={`p-4 rounded-2xl transition-all duration-500 transform group-hover:rotate-6 ${file ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110' : 'bg-background text-muted-foreground shadow-sm'
                        }`}>
                        {file ? <File size={28} /> : <Upload size={28} />}
                    </div>
                    <div className="space-y-1">
                        <p className={`text-sm font-bold truncate max-w-[200px] transition-colors ${file ? 'text-primary' : 'text-foreground/80'}`}>
                            {file ? file.name : "Drop documents here"}
                        </p>
                        <p className="text-[9px] text-muted-foreground/60 uppercase racking-[0.3em] font-black">
                            PDF • TXT • DOCX
                        </p>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {file && (
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={handleUpload}
                        disabled={uploading}
                        className={`w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl transform active:scale-95 ${uploadStatus === 'success'
                            ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                            : uploadStatus === 'error'
                                ? 'bg-destructive text-destructive-foreground shadow-destructive/20'
                                : 'bg-primary text-primary-foreground shadow-primary/30 hover:bg-primary/90'
                            }`}
                    >
                        {uploading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Processing Engine...</span>
                            </>
                        ) : uploadStatus === 'success' ? (
                            <>
                                <CheckCircle2 size={16} />
                                <span>Analysis Complete</span>
                            </>
                        ) : uploadStatus === 'error' ? (
                            <>
                                <AlertCircle size={16} />
                                <span>Error Occurred</span>
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} />
                                <span>Start Analysis</span>
                            </>
                        )}
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
