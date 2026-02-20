const express = require('express');
const multer = require('multer');
const DocumentController = require('../controllers/DocumentController');
const QueryController = require('../controllers/QueryController');
const config = require('../config');

const router = express.Router();

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, config.uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

// Routes
router.post('/upload', upload.single('file'), (req, res) =>
    DocumentController.upload(req, res)
);
router.post('/query', (req, res) => QueryController.query(req, res));

module.exports = router;
