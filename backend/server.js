const config = require('./src/config');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');
const routes = require('./src/routes');
const RAGService = require('./src/services/RAGService');

const app = express();
const server = http.createServer(app);
const io = new socketIo.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// Ensure uploads directory exists
if (!fs.existsSync(config.uploadDir)) {
    fs.mkdirSync(config.uploadDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

const jwt = require('jsonwebtoken');

// WebSocket Logic
io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.on('query', async (data) => {
        const { question, token } = data;
        if (!question) return socket.emit('error', 'Question is required');

        // Simple token verification for WebSocket
        try {
            if (!token) throw new Error('Authentication required');
            jwt.verify(token, config.jwtSecret);
        } catch (err) {
            return socket.emit('error', 'Unauthorized: Invalid token');
        }

        try {
            console.log(`❓ WS Query: ${question}`);

            const { sources } = await RAGService.answerQuestionStreaming(
                question,
                (chunk) => {
                    socket.emit('chunk', chunk);
                }
            );

            socket.emit('done', { sources });
        } catch (error) {
            console.error('❌ WS Query error:', error);
            socket.emit('error', error.message);
        }
    });

    socket.on('disconnect', () => {
        console.log('🔌 Client disconnected');
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'RAG Backend running with modular MVC' });
});

server.listen(config.port, () => {
    console.log(`✅ Backend server running on port ${config.port}`);
    console.log(`🤖 Current LLM Provider: ${config.llmProvider}`);
});