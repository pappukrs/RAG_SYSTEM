"use client";

import React, { useState } from 'react';
import { FileText, Database, Cpu, MessageSquare, Upload, Search, Layers, Server, Container } from 'lucide-react';

const RAGArchitecture = () => {
    const [activeTab, setActiveTab] = useState<string>('architecture');

    const ArchitectureDiagram: React.FC = () => (
        <div className="space-y-8">
            <h3 className="text-xl font-semibold mb-4 text-slate-100">System Architecture Flow</h3>

            {/* Layer 1: Frontend */}
            <div className="border-2 border-blue-500/30 rounded-lg p-6 bg-slate-800/50">
                <div className="flex items-center gap-3 mb-4">
                    <Container className="w-6 h-6 text-blue-400" />
                    <h4 className="font-bold text-lg text-blue-300">Frontend Layer (Next.js)</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 shadow-lg">
                        <Upload className="w-5 h-5 mb-2 text-blue-400" />
                        <p className="font-semibold text-slate-100">File Upload</p>
                        <p className="text-sm text-slate-400">PDF, DOCX, TXT</p>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 shadow-lg">
                        <MessageSquare className="w-5 h-5 mb-2 text-blue-400" />
                        <p className="font-semibold text-slate-100">Chat Interface</p>
                        <p className="text-sm text-slate-400">Ask questions</p>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 shadow-lg">
                        <Search className="w-5 h-5 mb-2 text-blue-400" />
                        <p className="font-semibold text-slate-100">Results Display</p>
                        <p className="text-sm text-slate-400">Answers + Sources</p>
                    </div>
                </div>
            </div>

            {/* Layer 2: Backend */}
            <div className="border-2 border-emerald-500/30 rounded-lg p-6 bg-slate-800/50">
                <div className="flex items-center gap-3 mb-4">
                    <Server className="w-6 h-6 text-emerald-400" />
                    <h4 className="font-bold text-lg text-emerald-300">Backend Layer (Node.js + Express)</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 shadow-lg">
                        <FileText className="w-5 h-5 mb-2 text-emerald-400" />
                        <p className="font-semibold text-slate-100">Document Processing</p>
                        <p className="text-sm text-slate-400">Parse & chunk files</p>
                        <ul className="text-xs mt-2 space-y-1 text-slate-300">
                            <li>• pdf-parse (PDF)</li>
                            <li>• mammoth (DOCX)</li>
                            <li>• Text chunking (500-1000 chars)</li>
                        </ul>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 shadow-lg">
                        <Layers className="w-5 h-5 mb-2 text-emerald-400" />
                        <p className="font-semibold text-slate-100">Embedding Generator</p>
                        <p className="text-sm text-slate-400">Convert text to vectors</p>
                        <ul className="text-xs mt-2 space-y-1 text-slate-300">
                            <li>• transformers.js (local)</li>
                            <li>• all-MiniLM-L6-v2 model</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Layer 3: Vector DB */}
            <div className="border-2 border-purple-500/30 rounded-lg p-6 bg-slate-800/50">
                <div className="flex items-center gap-3 mb-4">
                    <Database className="w-6 h-6 text-purple-400" />
                    <h4 className="font-bold text-lg text-purple-300">Vector Database (ChromaDB)</h4>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 shadow-lg">
                    <p className="font-semibold mb-2 text-slate-100">Storage & Retrieval</p>
                    <ul className="text-sm space-y-1 text-slate-300">
                        <li>• Store document chunks with embeddings</li>
                        <li>• Similarity search (cosine similarity)</li>
                        <li>• Return top K relevant chunks</li>
                        <li>• Metadata: filename, page, chunk index</li>
                    </ul>
                </div>
            </div>

            {/* Layer 4: LLM */}
            <div className="border-2 border-amber-500/30 rounded-lg p-6 bg-slate-800/50">
                <div className="flex items-center gap-3 mb-4">
                    <Cpu className="w-6 h-6 text-amber-400" />
                    <h4 className="font-bold text-lg text-amber-300">LLM Layer (DeepSeek via Ollama)</h4>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 shadow-lg">
                    <p className="font-semibold mb-2 text-slate-100">Answer Generation</p>
                    <ul className="text-sm space-y-1 text-slate-300">
                        <li>• Ollama server running DeepSeek</li>
                        <li>• Receives: query + retrieved context</li>
                        <li>• Generates: answer based on context</li>
                        <li>• Node.js client via HTTP API</li>
                    </ul>
                </div>
            </div>
        </div>
    );

    const TechStack: React.FC = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4 text-slate-100">Complete Technology Stack</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-slate-700 rounded-lg p-4 bg-slate-800/30 shadow-md">
                    <h4 className="font-bold mb-3 text-blue-400">Frontend</h4>
                    <ul className="space-y-2 text-sm text-slate-300">
                        <li><strong className="text-slate-100">Next.js 15:</strong> React framework (Turbopack)</li>
                        <li><strong className="text-slate-100">TypeScript:</strong> Type safety</li>
                        <li><strong className="text-slate-100">Tailwind CSS:</strong> Styling</li>
                        <li><strong className="text-slate-100">Axios:</strong> API calls</li>
                    </ul>
                </div>

                <div className="border border-slate-700 rounded-lg p-4 bg-slate-800/30 shadow-md">
                    <h4 className="font-bold mb-3 text-emerald-400">Backend</h4>
                    <ul className="space-y-2 text-sm text-slate-300">
                        <li><strong className="text-slate-100">Node.js + Express:</strong> CommonJS API server</li>
                        <li><strong className="text-slate-100">Multer:</strong> File uploads</li>
                        <li><strong className="text-slate-100">pdf-parse:</strong> PDF processing</li>
                        <li><strong className="text-slate-100">mammoth:</strong> DOCX processing</li>
                    </ul>
                </div>

                <div className="border border-slate-700 rounded-lg p-4 bg-slate-800/30 shadow-md">
                    <h4 className="font-bold mb-3 text-purple-400">Vector & Embeddings</h4>
                    <ul className="space-y-2 text-sm text-slate-300">
                        <li><strong className="text-slate-100">ChromaDB:</strong> Vector database</li>
                        <li><strong className="text-slate-100">chromadb (npm):</strong> JS client</li>
                        <li><strong className="text-slate-100">transformers.js:</strong> Local embeddings</li>
                        <li><strong className="text-slate-100">all-MiniLM-L6-v2:</strong> Embedding model</li>
                    </ul>
                </div>

                <div className="border border-slate-700 rounded-lg p-4 bg-slate-800/30 shadow-md">
                    <h4 className="font-bold mb-3 text-amber-400">LLM</h4>
                    <ul className="space-y-2 text-sm text-slate-300">
                        <li><strong className="text-slate-100">Ollama:</strong> Local LLM server</li>
                        <li><strong className="text-slate-100">DeepSeek:</strong> Open source model</li>
                    </ul>
                </div>

                <div className="border border-slate-700 rounded-lg p-4 bg-slate-800/30 col-span-1 md:col-span-2 shadow-md">
                    <h4 className="font-bold mb-3 text-slate-300">Docker & Infrastructure</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><strong className="text-slate-100">Docker:</strong> Containerization</li>
                        <li><strong className="text-slate-100">Docker Compose:</strong> Multi-container orchestration</li>
                        <li><strong className="text-slate-100">Volumes:</strong> Persistent storage for ChromaDB, Ollama & models</li>
                    </ul>
                </div>
            </div>
        </div>
    );

    const DataFlow: React.FC = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4 text-slate-100">Data Flow Process</h3>

            <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-500/10 rounded-r-lg">
                    <h4 className="font-bold text-blue-400">Step 1: Document Upload & Processing</h4>
                    <ol className="list-decimal ml-5 mt-2 space-y-1 text-sm text-slate-300">
                        <li>User uploads file via Next.js frontend</li>
                        <li>File sent to Node.js backend via REST API</li>
                        <li>Backend extracts text (pdf-parse/mammoth)</li>
                        <li>Text split into chunks (500-1000 characters with overlap)</li>
                        <li>Each chunk gets metadata (filename, upload date, index)</li>
                    </ol>
                </div>

                <div className="border-l-4 border-purple-500 pl-4 py-3 bg-purple-500/10 rounded-r-lg">
                    <h4 className="font-bold text-purple-400">Step 2: Embedding Generation & Storage</h4>
                    <ol className="list-decimal ml-5 mt-2 space-y-1 text-sm text-slate-300">
                        <li>Each chunk converted to embedding vector (384 dimensions)</li>
                        <li>Using transformers.js with all-MiniLM-L6-v2 model</li>
                        <li>Chunk + embedding + metadata stored in ChromaDB</li>
                    </ol>
                </div>

                <div className="border-l-4 border-emerald-500 pl-4 py-3 bg-emerald-500/10 rounded-r-lg">
                    <h4 className="font-bold text-emerald-400">Step 3: Question Processing</h4>
                    <ol className="list-decimal ml-5 mt-2 space-y-1 text-sm text-slate-300">
                        <li>User asks question via chat interface</li>
                        <li>Question converted to embedding vector</li>
                        <li>Vector similarity search in ChromaDB</li>
                        <li>Retrieve top relevant chunks</li>
                    </ol>
                </div>

                <div className="border-l-4 border-amber-500 pl-4 py-3 bg-amber-500/10 rounded-r-lg">
                    <h4 className="font-bold text-amber-400">Step 4: Answer Generation</h4>
                    <ol className="list-decimal ml-5 mt-2 space-y-1 text-sm text-slate-300">
                        <li>Construct prompt: question + retrieved context chunks</li>
                        <li>Send to DeepSeek via Ollama API</li>
                        <li>LLM generates answer based on provided context</li>
                        <li>Return answer + source references to frontend</li>
                    </ol>
                </div>
            </div>
        </div>
    );

    const DockerSetup: React.FC = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4 text-slate-100">Docker Configuration</h3>

            <div className="bg-slate-900 border border-slate-700 text-slate-300 p-4 rounded-lg overflow-x-auto shadow-xl">
                <pre className="text-sm">
                    {`# docker-compose.yml excerpts

services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:4000

  backend:
    build: ./backend
    ports: ["4000:4000"]
    volumes:
      - ./backend/uploads:/app/uploads
      - model-cache:/app/model-cache
    environment:
      - CHROMA_URL=http://chromadb:8000
      - OLLAMA_URL=http://ollama:11434

  chromadb:
    image: chromadb/chroma:latest
    ports: ["8000:8000"]
    volumes:
      - chroma-data:/chroma/chroma

  ollama:
    image: ollama/ollama:latest
    ports: ["11434:11434"]
    volumes:
      - ollama-data:/root/.ollama`}
                </pre>
            </div>

            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <h4 className="font-bold text-amber-400 mb-2 underline decoration-amber-500/50">Important Setup Commands:</h4>
                <div className="space-y-2 text-sm text-slate-300 font-mono">
                    <p><span className="text-amber-500">$</span> docker-compose up -d --build</p>
                    <p><span className="text-amber-500">$</span> docker exec -it ollama ollama pull deepseek-r1:1.5b</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-transparent p-6 text-slate-200">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 p-6 bg-slate-800/40 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-sm">
                    <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">RAG System Architecture</h1>
                    <p className="text-slate-400 text-lg">Node.js + DeepSeek (Ollama) + ChromaDB + Next.js 15</p>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-700/50">
                    {['architecture', 'tech-stack', 'data-flow', 'docker'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 font-semibold transition-all duration-300 rounded-t-lg ${activeTab === tab
                                ? 'bg-slate-800/60 border-b-4 border-blue-500 text-blue-400 shadow-[0_4px_20px_-5px_rgba(59,130,246,0.3)]'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                                }`}
                        >
                            {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm shadow-2xl">
                    {activeTab === 'architecture' && <ArchitectureDiagram />}
                    {activeTab === 'tech-stack' && <TechStack />}
                    {activeTab === 'data-flow' && <DataFlow />}
                    {activeTab === 'docker' && <DockerSetup />}
                </div>

                {/* Key Features */}
                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-500/5 p-6 rounded-2xl border border-blue-500/20 hover:bg-blue-500/10 transition-colors shadow-lg">
                        <h4 className="font-bold text-blue-400 mb-2 text-xl flex items-center gap-2">
                            <Layers size={20} /> 100% Local
                        </h4>
                        <p className="text-sm text-slate-400 leading-relaxed">Privacy-first design. No external API keys or cloud services required.</p>
                    </div>
                    <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors shadow-lg">
                        <h4 className="font-bold text-emerald-400 mb-2 text-xl flex items-center gap-2">
                            <Cpu size={20} /> Full JS Stack
                        </h4>
                        <p className="text-sm text-slate-400 leading-relaxed">Unified development experience with Node.js backend and Next.js frontend.</p>
                    </div>
                    <div className="bg-purple-500/5 p-6 rounded-2xl border border-purple-500/20 hover:bg-purple-500/10 transition-colors shadow-lg">
                        <h4 className="font-bold text-purple-400 mb-2 text-xl flex items-center gap-2">
                            <Container size={20} /> Docker Ready
                        </h4>
                        <p className="text-sm text-slate-400 leading-relaxed">Production-ready orchestration with Docker Compose for all components.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RAGArchitecture;