const OllamaProvider = require('./OllamaProvider');
const OpenAIProvider = require('./OpenAIProvider');
const GeminiProvider = require('./GeminiProvider');
const config = require('../../config');

class LLMFactory {
    static getProvider() {
        const providerType = config.llmProvider.toLowerCase();

        switch (providerType) {
            case 'ollama':
                return new OllamaProvider();
            case 'openai':
                return new OpenAIProvider();
            case 'gemini':
                return new GeminiProvider();
            default:
                throw new Error(`Unsupported LLM provider: ${providerType}`);
        }
    }
}

module.exports = LLMFactory;
