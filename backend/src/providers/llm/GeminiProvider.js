const { GoogleGenerativeAI } = require('@google/generative-ai');
const LLMProvider = require('./LLMProvider');
const config = require('../../config');

class GeminiProvider extends LLMProvider {
    constructor() {
        super();
        if (!config.gemini.apiKey) {
            throw new Error('GEMINI_API_KEY is not configured in .env');
        }
        this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
        this.modelName = config.gemini.model;
    }

    async generateAnswer(query, context) {
        try {
            const model = this.genAI.getGenerativeModel({ model: this.modelName });
            const prompt = this.buildPrompt(query, context);

            const result = await model.generateContent(prompt);
            const text = result.response.text();

            return {
                answer: text,
                sources: context.map((c) => c.metadata),
            };
        } catch (error) {
            throw new Error(`Gemini generation failed: ${error.message}`);
        }
    }

    async generateAnswerStreaming(query, context, onChunk) {
        try {
            const model = this.genAI.getGenerativeModel({ model: this.modelName });
            const prompt = this.buildPrompt(query, context);

            const result = await model.generateContentStream(prompt);

            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                if (onChunk) onChunk(chunkText);
            }
        } catch (error) {
            throw new Error(`Gemini streaming generation failed: ${error.message}`);
        }
    }
}

module.exports = GeminiProvider;
