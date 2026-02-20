const LLMFactory = require('../providers/llm/LLMFactory');
const VectorService = require('./VectorService');
const EmbeddingService = require('./EmbeddingService');

class RAGService {
    constructor() {
        this.llmProvider = LLMFactory.getProvider();
    }

    /**
     * Orchestrates the Q&A process.
     * @param {string} question
     * @param {number} topK
     * @returns {Promise<Object>}
     */
    async answerQuestion(question, topK = 5) {
        // 1. Generate embedding for query
        const queryEmbedding = await EmbeddingService.generateEmbedding(question);

        // 2. Search vector store
        const relevantChunks = await VectorService.query(queryEmbedding, topK);

        // 3. Generate answer using LLM
        return await this.llmProvider.generateAnswer(question, relevantChunks);
    }

    /**
     * Orchestrates the streaming Q&A process.
     * @param {string} question
     * @param {Function} onChunk
     * @param {number} topK
     * @returns {Promise<void>}
     */
    async answerQuestionStreaming(question, onChunk, topK = 5) {
        // 1. Generate embedding
        const queryEmbedding = await EmbeddingService.generateEmbedding(question);

        // 2. Search vector store
        const relevantChunks = await VectorService.query(queryEmbedding, topK);

        // 3. Stream from LLM
        await this.llmProvider.generateAnswerStreaming(question, relevantChunks, onChunk);

        return { sources: relevantChunks.map((c) => c.metadata) };
    }
}

module.exports = new RAGService();
