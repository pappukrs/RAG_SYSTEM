const OllamaProvider = require('./OllamaProvider');
const OpenAIProvider = require('./OpenAIProvider');
const config = require('../../config');

class LLMFactory {
    static getProvider() {
        const providerType = config.llmProvider.toLowerCase();

        switch (providerType) {
            case 'ollama':
                return new OllamaProvider();
            case 'openai':
                return new OpenAIProvider();
            default:
                throw new Error(`Unsupported LLM provider: ${providerType}`);
        }
    }
}

module.exports = LLMFactory;
