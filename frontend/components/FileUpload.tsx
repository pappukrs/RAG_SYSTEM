"use client";

import React, { useState, ChangeEvent } from 'react';
import { Upload, File, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

interface FileUploadProps {
    onUpload: () => void;
}

export default function FileUpload({ onUpload }: FileUploadProps) {
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
            // Ensure no double slashes
            const uploadUrl = `${apiUrl.replace(/\/$/, '')}/upload`;
            await axios.post(uploadUrl, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUploadStatus('success');
            onUpload();
            // Clear file after successful upload
            setTimeout(() => setFile(null), 3000);
        } catch (error) {
            console.error('Upload failed:', error);
            setUploadStatus('error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className={`relative border-2 border-dashed rounded-2xl p-6 transition-all group ${file ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
                }`}>
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept=".pdf,.docx,.txt"
                />
                <div className="flex flex-col items-center justify-center gap-2 text-center pointer-events-none">
                    <div className="p-3 bg-slate-700/50 rounded-xl mb-1 group-hover:scale-110 transition-transform">
                        <Upload size={22} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-300">
                        {file ? file.name : "Click or drag to upload"}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">PDF, DOCX, TXT</p>
                </div>
            </div>

            {file && (
                <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className={`w-full py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${uploadStatus === 'success'
                        ? 'bg-emerald-600 text-white'
                        : uploadStatus === 'error'
                            ? 'bg-red-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/10'
                        }`}
                >
                    {uploading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            <span>Processing...</span>
                        </>
                    ) : uploadStatus === 'success' ? (
                        <>
                            <CheckCircle2 size={18} />
                            <span>Ready to Chat</span>
                        </>
                    ) : uploadStatus === 'error' ? (
                        <>
                            <AlertCircle size={18} />
                            <span>Try Again</span>
                        </>
                    ) : (
                        <span>Analyze Document</span>
                    )}
                </button>
            )}
        </div>
    );
}
