require('dotenv').config();

const config = {
    port: process.env.PORT || 4000,
    ollama: {
        url: process.env.OLLAMA_URL || 'http://ollama:11434',
        model: process.env.OLLAMA_MODEL || 'deepseek-r1:1.5b',
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    },
    llmProvider: process.env.LLM_PROVIDER || 'ollama', // 'ollama', 'openai', or 'gemini'
    chroma: {
        url: process.env.CHROMA_URL || 'http://chromadb:8000',
    },
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
};

module.exports = config;
