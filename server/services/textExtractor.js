const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { ocrFromImage } = require('./ocrService');

/**
 * Helper to get file buffer from local path or remote URL.
 */
async function getFileBuffer(filePath) {
    if (filePath.startsWith('http')) {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to fetch file from URL: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }
    return fs.readFileSync(filePath);
}

/**
 * Extract text from a text file.
 */
async function extractFromTxt(filePath) {
    const buffer = await getFileBuffer(filePath);
    return buffer.toString('utf-8');
}

/**
 * Extract text from a PDF file.
 * Falls back to OCR if no text is found (scanned PDF).
 */
async function extractFromPdf(filePath) {
    const buffer = await getFileBuffer(filePath);

    try {
        const data = await pdfParse(buffer);
        const text = data.text?.trim();

        // If PDF has text content, return it
        if (text && text.length > 50) {
            return text;
        }

        // Scanned PDF — try OCR on the buffer itself using Gemini Vision
        console.log('PDF appears to be scanned, attempting Gemini Vision OCR...');
        const { ocrWithVision } = require('./geminiService');
        return await ocrWithVision(buffer, 'application/pdf');
    } catch (error) {
        console.error('PDF parse failed:', error.message);
        // Final fallback: try Gemini Vision on the raw file
        const { ocrWithVision } = require('./geminiService');
        return await ocrWithVision(buffer, 'application/pdf');
    }
}

/**
 * Extract text from a DOCX file.
 */
async function extractFromDocx(filePath) {
    const buffer = await getFileBuffer(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
}

/**
 * Extract text from an image file using OCR.
 */
async function extractFromImage(filePath, originalName) {
    const buffer = await getFileBuffer(filePath);

    // Use original filename for extension if available, else fall back to filePath/URL
    const nameToCheck = originalName || filePath;
    const ext = path.extname(nameToCheck).toLowerCase();

    const mimeMap = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.bmp': 'image/bmp',
        '.webp': 'image/webp',
        '.tiff': 'image/tiff',
        '.tif': 'image/tiff',
    };
    // Default to png if extension is missing or unknown
    const mimeType = mimeMap[ext] || 'image/png';
    return ocrFromImage(buffer, mimeType);
}

module.exports = { extractFromTxt, extractFromPdf, extractFromDocx, extractFromImage };
