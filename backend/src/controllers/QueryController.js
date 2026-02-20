const RAGService = require('../services/RAGService');

class QueryController {
    async query(req, res) {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        try {
            console.log(`❓ Query: ${question}`);
            const result = await RAGService.answerQuestion(question);
            res.json(result);
        } catch (error) {
            console.error('❌ Query error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Socket logic will be handled directly in server.js or a separate Socket manager
    // but we can expose the logic here if needed.
}

module.exports = new QueryController();
