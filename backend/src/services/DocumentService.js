const fs = require('fs/promises');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

class DocumentService {
    async processFile(filePath, fileType) {
        let text = '';

        try {
            if (fileType === 'application/pdf') {
                const dataBuffer = await fs.readFile(filePath);
                const pdfData = await pdfParse(dataBuffer);
                text = pdfData.text;
            } else if (
                fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ) {
                const result = await mammoth.extractRawText({ path: filePath });
                text = result.value;
            } else if (fileType === 'text/plain') {
                text = await fs.readFile(filePath, 'utf-8');
            }

            return text;
        } catch (error) {
            throw new Error(`Failed to process document: ${error.message}`);
        }
    }

    chunkText(text, chunkSize = 800, overlap = 200) {
        const chunks = [];
        let start = 0;

        while (start < text.length) {
            const end = start + chunkSize;
            const chunk = text.slice(start, end);

            if (chunk.trim().length > 0) {
                chunks.push({
                    text: chunk.trim(),
                    metadata: {
                        start,
                        end: Math.min(end, text.length),
                        length: chunk.length,
                    },
                });
            }

            start += chunkSize - overlap;
        }

        return chunks;
    }
}

module.exports = new DocumentService();
