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
    llmProvider: process.env.LLM_PROVIDER || 'ollama', // 'ollama' or 'openai'
    chroma: {
        url: process.env.CHROMA_URL || 'http://chromadb:8000',
    },
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
};

module.exports = config;
