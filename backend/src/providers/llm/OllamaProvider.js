const axios = require('axios');
const LLMProvider = require('./LLMProvider');
const config = require('../../config');

class OllamaProvider extends LLMProvider {
    constructor() {
        super();
        this.ollamaUrl = config.ollama.url;
        this.model = config.ollama.model;
    }

    async generateAnswer(query, context) {
        let fullResponse = '';
        await this.generateAnswerStreaming(query, context, (chunk) => {
            fullResponse += chunk;
        });
        return {
            answer: fullResponse,
            sources: context.map((c) => c.metadata),
        };
    }

    async generateAnswerStreaming(query, context, onChunk) {
        const prompt = this.buildPrompt(query, context);

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
                        top_p: 0.9,
                    },
                },
                responseType: 'stream',
            });

            return new Promise((resolve, reject) => {
                response.data.on('data', (chunk) => {
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

                response.data.on('error', (err) => reject(err));
            });
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                throw new Error('Ollama server not running. Please start Ollama and pull model.');
            }
            if (error.response && error.response.status === 404) {
                throw new Error(`Model "${this.model}" not found in Ollama.`);
            }
            throw new Error(`Ollama generation failed: ${error.message}`);
        }
    }
}

module.exports = OllamaProvider;
