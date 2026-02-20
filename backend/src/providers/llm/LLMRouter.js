const LLMFactory = require('./LLMFactory');
const config = require('../../config');

class LLMRouter {
    constructor() {
        this.primaryProvider = LLMFactory.getProvider();
    }

    async generateAnswer(query, context) {
        try {
            console.log(`[Router] Attempting primary provider: ${config.llmProvider}`);
            return await this.primaryProvider.generateAnswer(query, context);
        } catch (error) {
            console.warn(`[Router] Primary provider failed: ${error.message}`);
            return this.handleFallback(query, context, 'generateAnswer');
        }
    }

    async generateAnswerStreaming(query, context, onChunk) {
        try {
            console.log(`[Router] Attempting primary streaming: ${config.llmProvider}`);
            return await this.primaryProvider.generateAnswerStreaming(query, context, onChunk);
        } catch (error) {
            console.warn(`[Router] Primary streaming failed: ${error.message}`);

            // Fallback to normal generation if streaming fails
            console.log('[Router] Falling back to non-streaming generation...');
            const result = await this.handleFallback(query, context, 'generateAnswer');
            if (onChunk && result.answer) {
                onChunk(result.answer);
            }
            return result;
        }
    }

    async handleFallback(query, context, method) {
        // If Gemini fails, we could try OpenAI if key is present
        if (config.llmProvider === 'gemini' && config.openai.apiKey) {
            console.info('[Router] Switching to OpenAI fallback...');
            const OpenAIProvider = require('./OpenAIProvider');
            const fallback = new OpenAIProvider();
            return await fallback[method](query, context);
        }

        // If no other options, re-throw the original error or throw a graceful one
        throw new Error('LLM Router: All providers failed and no fallbacks available.');
    }
}

module.exports = new LLMRouter();
