const axios = require('axios');

class LLMService {
    constructor() {
        this.ollamaUrl = process.env.OLLAMA_URL || 'http://ollama:11434';
        this.model = 'deepseek-r1:1.5b';
    }

    async generateAnswer(query, context) {
        let fullResponse = '';
        await this.generateAnswerStreaming(query, context, (chunk) => {
            fullResponse += chunk;
        });
        return {
            answer: fullResponse,
            sources: context.map(c => c.metadata)
        };
    }

    async generateAnswerStreaming(query, context, onChunk) {
        const contextText = context.map((chunk, idx) => `[Source ${idx + 1}]:\n${chunk.text}`).join('\n\n---\n\n');

        const prompt = `You are a precise and helpful assistant. Use the following pieces of retrieved context to answer the user's question. 
If the question is about the document overall, summarize the key points found in the context.
If you don't know the answer based on the context, just say that you don't have enough information, don't try to make up an answer.

### Context:
${contextText}

### Question:
${query}

### Answer:`;

        try {
            const response = await axios({
                method: 'post',
                url: `${this.ollamaUrl}/api/generate`,
                data: {
                    model: this.model,
                    prompt,
                    stream: true,
                    options: {
                        temperature: 0.7,
                        top_p: 0.9
                    }
                },
                responseType: 'stream'
            });

            return new Promise((resolve, reject) => {
                response.data.on('data', chunk => {
                    const lines = chunk.toString().split('\n');
                    for (const line of lines) {
                        if (!line.trim()) continue;
                        try {
                            const json = JSON.parse(line);
                            if (json.response) {
                                onChunk(json.response);
                            }
                            if (json.done) {
                                resolve();
                            }
                        } catch (e) {
                            // Ignore partial JSON chunks
                        }
                    }
                });

                response.data.on('error', err => reject(err));
            });

        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                throw new Error('Ollama server not running. Please start Ollama and pull model.');
            }
            if (error.response && error.response.status === 404) {
                throw new Error(`Model "${this.model}" not found in Ollama.`);
            }
            throw new Error(`LLM generation failed: ${error.message}`);
        }
    }
}

module.exports = new LLMService();