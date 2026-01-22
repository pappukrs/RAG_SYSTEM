const express = require('express');
const documentProcessor = require('../services/documentProcessor');
const embeddingService = require('../services/embeddingService');
const vectorStore = require('../services/vectorStore');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log(`📄 Processing file: ${req.file.originalname}`);

        // Step 1: Extract text
        const text = await documentProcessor.processFile(req.file.path, req.file.mimetype);
        console.log(`✅ Extracted ${text.length} characters`);

        // Step 2: Chunk text
        const chunks = documentProcessor.chunkText(text);
        console.log(`✅ Created ${chunks.length} chunks`);

        // Step 3: Generate embeddings
        const embeddings = await embeddingService.generateEmbeddings(chunks.map(c => c.text));
        console.log(`✅ Generated embeddings`);

        // Step 4: Store in vector database
        const result = await vectorStore.addDocuments(chunks, embeddings, {
            filename: req.file.originalname,
            uploadDate: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'File processed successfully',
            filename: req.file.originalname,
            chunks: result.count
        });

    } catch (error) {
        console.error('❌ Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;