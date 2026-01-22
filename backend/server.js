require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const uploadRoute = require('./routes/upload');
const queryRoute = require('./routes/query');
const embeddingService = require('./services/embeddingService');
const vectorStore = require('./services/vectorStore');
const llmService = require('./services/llmService');

const app = express();
const server = http.createServer(app);
const io = new socketIo.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 4000;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

// Routes
app.use('/api/upload', upload.single('file'), uploadRoute);
app.use('/api/query', queryRoute);

// WebSocket Logic
io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.on('query', async (data) => {
        const { question } = data;
        if (!question) return socket.emit('error', 'Question is required');

        try {
            console.log(`❓ WS Query: ${question}`);

            // 1. Generate embedding
            const queryEmbedding = await embeddingService.generateEmbedding(question);

            // 2. Search vector store
            const relevantChunks = await vectorStore.query(queryEmbedding, 5);

            // 3. Stream from LLM
            await llmService.generateAnswerStreaming(question, relevantChunks, (chunk) => {
                socket.emit('chunk', chunk);
            });

            socket.emit('done', { sources: relevantChunks.map(c => c.metadata) });
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
    res.json({ status: 'ok', message: 'RAG Backend running' });
});

server.listen(PORT, () => {
    console.log(`✅ Backend server running on port ${PORT}`);
});