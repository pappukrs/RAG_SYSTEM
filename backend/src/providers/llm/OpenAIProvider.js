const axios = require('axios');
const LLMProvider = require('./LLMProvider');
const config = require('../../config');

class OpenAIProvider extends LLMProvider {
    constructor() {
        super();
        this.apiKey = config.openai.apiKey;
        this.model = config.openai.model;
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    }

    async generateAnswer(query, context) {
        const prompt = this.buildPrompt(query, context);

        try {
            const response = await axios({
                method: 'post',
                url: this.apiUrl,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                data: {
                    model: this.model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                },
            });

            return {
                answer: response.data.choices[0].message.content,
                sources: context.map((c) => c.metadata),
            };
        } catch (error) {
            throw new Error(`OpenAI generation failed: ${error.message}`);
        }
    }

    async generateAnswerStreaming(query, context, onChunk) {
        const prompt = this.buildPrompt(query, context);

        try {
            const response = await axios({
                method: 'post',
                url: this.apiUrl,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                data: {
                    model: this.model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                    stream: true,
                },
                responseType: 'stream',
            });

            return new Promise((resolve, reject) => {
                response.data.on('data', (chunk) => {
                    const lines = chunk.toString().split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') {
                                resolve();
                                return;
                            }
                            try {
                                const json = JSON.parse(data);
                                const content = json.choices[0].delta.content;
                                if (content) {
                                    onChunk(content);
                                }
                            } catch (e) {
                                // Ignore partial JSON
                            }
                        }
                    }
                });

                response.data.on('error', (err) => reject(err));
            });
        } catch (error) {
            throw new Error(`OpenAI streaming failed: ${error.message}`);
        }
    }
}

module.exports = OpenAIProvider;
