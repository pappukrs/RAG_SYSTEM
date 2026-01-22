const express = require('express');
const embeddingService = require('../services/embeddingService');
const vectorStore = require('../services/vectorStore');
const llmService = require('../services/llmService');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        console.log(`❓ Query: ${question}`);
        const totalStart = Date.now();

        // Step 1: Generate query embedding
        const embeddingStart = Date.now();
        const queryEmbedding = await embeddingService.generateEmbedding(question);
        const embeddingTime = ((Date.now() - embeddingStart) / 1000).toFixed(2);
        console.log(`⏱️  Embedding generation: ${embeddingTime}s`);

        // Step 2: Retrieve relevant chunks
        const searchStart = Date.now();
        const relevantChunks = await vectorStore.query(queryEmbedding, 5);
        const searchTime = ((Date.now() - searchStart) / 1000).toFixed(2);
        console.log(`⏱️  Vector search: ${searchTime}s`);
        console.log(`✅ Retrieved ${relevantChunks.length} relevant chunks`);

        // Step 3: Generate answer using LLM
        const llmStart = Date.now();
        const result = await llmService.generateAnswer(question, relevantChunks);
        const llmTime = ((Date.now() - llmStart) / 1000).toFixed(2);
        console.log(`⏱️  LLM generation: ${llmTime}s`);

        const totalTime = ((Date.now() - totalStart) / 1000).toFixed(2);
        console.log(`⏱️  TOTAL TIME: ${totalTime}s`);

        res.json({
            success: true,
            question,
            answer: result.answer,
            sources: result.sources,
            relevantChunks: relevantChunks.length,
            timing: {
                embedding: `${embeddingTime}s`,
                search: `${searchTime}s`,
                llm: `${llmTime}s`,
                total: `${totalTime}s`
            }
        });

    } catch (error) {
        console.error('❌ Query error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;