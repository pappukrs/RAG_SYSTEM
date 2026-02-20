const { ChromaClient } = require('chromadb');
const config = require('../config');

class VectorService {
    constructor() {
        this.url = config.chroma.url;
        this.client = new ChromaClient({
            path: this.url,
        });
        this.collectionName = 'documents';
        this.checkConnection();
    }

    async checkConnection() {
        try {
            await this.client.heartbeat();
            console.log(`✅ Connected to ChromaDB at ${this.url}`);
        } catch (error) {
            console.error(`❌ Failed to connect to ChromaDB at ${this.url}:`, error.message);
        }
    }

    async getOrCreateCollection() {
        try {
            return await this.client.getOrCreateCollection({
                name: this.collectionName,
                metadata: { 'hnsw:space': 'cosine' },
            });
        } catch (error) {
            throw new Error(`Failed to get/create collection: ${error.message}`);
        }
    }

    async addDocuments(chunks, embeddings, metadata) {
        const collection = await this.getOrCreateCollection();

        const ids = chunks.map((_, idx) => `doc_${Date.now()}_${idx}`);
        const documents = chunks.map((chunk) => chunk.text);
        const metadatas = chunks.map((chunk, idx) => ({
            ...metadata,
            ...chunk.metadata,
            chunkIndex: idx,
        }));

        await collection.add({
            ids,
            embeddings,
            documents,
            metadatas,
        });

        return { success: true, count: chunks.length };
    }

    async query(queryEmbedding, topK = 5) {
        const collection = await this.getOrCreateCollection();

        const results = await collection.query({
            queryEmbeddings: [queryEmbedding],
            nResults: topK,
        });

        // In case no results
        if (!results.documents || results.documents.length === 0) return [];

        return results.documents[0].map((doc, idx) => ({
            text: doc,
            metadata: results.metadatas[0][idx],
            distance: results.distances[0][idx],
        }));
    }
}

module.exports = new VectorService();
