const path = require('path');
const Document = require('../models/Document');
const { extractFromTxt, extractFromPdf, extractFromDocx, extractFromImage } = require('./textExtractor');
const { normalizeText } = require('../utils/textNormalizer');
// const { chunkAndStore } = require('../utils/chunker');
const { generateSummary } = require('./geminiService');

/**
 * Determine file type category from extension.
 */
function getFileCategory(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    const categories = {
        text: ['.txt', '.md', '.csv', '.log', '.json', '.xml', '.html', '.htm'],
        pdf: ['.pdf'],
        docx: ['.docx', '.doc'],
        image: ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.tiff', '.tif'],
    };

    for (const [category, extensions] of Object.entries(categories)) {
        if (extensions.includes(ext)) return category;
    }
    return 'unknown';
}

/**
 * Main processing pipeline for uploaded documents.
 * Runs asynchronously after upload.
 */
async function processDocument(documentId, filePath) {
    const doc = await Document.findById(documentId);
    if (!doc) throw new Error('Document not found');

    try {
        console.log(`Processing document: ${doc.fileName} (${doc.fileType})`);

        // Step 1: Detect file type
        const category = getFileCategory(doc.fileName);
        console.log(`File category: ${category}`);

        // Step 2: Extract text
        let rawText = '';
        switch (category) {
            case 'text':
                rawText = await extractFromTxt(filePath);
                break;
            case 'pdf':
                rawText = await extractFromPdf(filePath);
                break;
            case 'docx':
                rawText = await extractFromDocx(filePath);
                break;
            case 'image':
                rawText = await extractFromImage(filePath, doc.fileName);
                break;
            default:
                throw new Error(`Unsupported file type: ${doc.fileName}`);
        }

        // Step 3: Normalize text
        const normalizedText = normalizeText(rawText);

        if (!normalizedText || normalizedText.length < 10) {
            throw new Error('Could not extract meaningful text from document');
        }

        // Step 4: Generate AI summary
        console.log(`Generating summary for ${doc.fileName}...`);
        const analysis = await generateSummary(normalizedText);

        // Step 5: (Skipped) Chunking removed
        // console.log(`Chunking text (${normalizedText.length} chars)...`);
        // await chunkAndStore(documentId, normalizedText);

        // Step 6: Update document
        await Document.findByIdAndUpdate(documentId, {
            extractedText: normalizedText,
            summary: analysis.summary || '',
            topics: analysis.topics || [],
            documentType: analysis.documentType || '',
            keyInsights: analysis.keyInsights || [],
            entities: analysis.entities || [],
            status: 'ready',
        });

        console.log(`Document ${doc.fileName} processed successfully`);
    } catch (error) {
        console.error(`Error processing ${doc.fileName}:`, error.message);
        await Document.findByIdAndUpdate(documentId, {
            status: 'error',
            errorMessage: error.message,
        });
    }
}

module.exports = { processDocument, getFileCategory };
