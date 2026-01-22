const path = require('path');

class EmbeddingService {
    constructor() {
        this.embedder = null;
    }

    async initialize() {
        if (!this.embedder) {
            // Dynamically import ES module in CommonJS
            const { pipeline, env } = await import('@xenova/transformers');

            // Configure local cache for models
            env.cacheDir = process.env.MODEL_CACHE || path.join(__dirname, '../model-cache');

            console.log('🔄 Loading embedding model to:', env.cacheDir);
            this.embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            console.log('✅ Embedding model loaded');
        }
    }

    async generateEmbedding(text) {
        await this.initialize();

        const output = await this.embedder(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    }

    async generateEmbeddings(texts) {
        await this.initialize();

        const embeddings = [];
        for (const text of texts) {
            const embedding = await this.generateEmbedding(text);
            embeddings.push(embedding);
        }
        return embeddings;
    }
}

module.exports = new EmbeddingService();