/**
 * Abstract Class LLMProvider.
 *
 * @class LLMProvider
 */
class LLMProvider {
    constructor() {
        if (this.constructor === LLMProvider) {
            throw new TypeError('Abstract class "LLMProvider" cannot be instantiated directly.');
        }
    }

    /**
     * Generate an answer based on query and context.
     * @param {string} query
     * @param {Array} context
     * @returns {Promise<Object>}
     */
    async generateAnswer(query, context) {
        throw new Error('Method "generateAnswer()" must be implemented.');
    }

    /**
     * Generate a streaming answer based on query and context.
     * @param {string} query
     * @param {Array} context
     * @param {Function} onChunk
     * @returns {Promise<void>}
     */
    async generateAnswerStreaming(query, context, onChunk) {
        throw new Error('Method "generateAnswerStreaming()" must be implemented.');
    }

    /**
     * Helper to build the prompt.
     * @param {string} query
     * @param {Array} context
     * @returns {string}
     */
    buildPrompt(query, context) {
        const contextText = context
            .map((chunk, idx) => `[Source ${idx + 1}]:\n${chunk.text}`)
            .join('\n\n---\n\n');

        return `You are a precise and helpful assistant. Use the following pieces of retrieved context to answer the user's question. 
If the question is about the document overall, summarize the key points found in the context.
If you don't know the answer based on the context, just say that you don't have enough information, don't try to make up an answer.

### Context:
${contextText}

### Question:
${query}

### Answer:`;
    }
}

module.exports = LLMProvider;
