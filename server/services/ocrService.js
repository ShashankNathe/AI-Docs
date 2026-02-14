const Tesseract = require('tesseract.js');
const { ocrWithVision } = require('./geminiService');

/**
 * OCR from image buffer using Tesseract.js with Gemini Vision fallback.
 */
async function ocrFromImage(imageBuffer, mimeType = 'image/png') {
    try {
        // Primary: Tesseract.js
        // Skipped to ensure we get Visual Description from Gemini for all images
        /*
        const { data } = await Tesseract.recognize(imageBuffer, 'eng', {
            logger: (info) => {
                if (info.status === 'recognizing text') {
                    // Optional: track progress
                }
            },
        });

        // If confidence is reasonable (>60%) and text is substantial, use Tesseract result
        if (data.confidence > 60 && data.text.trim().length > 50) {
            console.log(`Tesseract OCR confidence: ${data.confidence}%`);
            return data.text;
        }
        */

        // Always use Gemini Vision to get both text and visual description
        console.log(`Sending image to Gemini Vision for full analysis...`);
        return await ocrWithVision(imageBuffer, mimeType);
    } catch (error) {
        console.error('Tesseract OCR failed, trying Gemini Vision:', error.message);
        try {
            return await ocrWithVision(imageBuffer, mimeType);
        } catch (visionError) {
            console.error('Gemini Vision OCR also failed:', visionError.message);
            throw new Error('All OCR methods failed');
        }
    }
}

module.exports = { ocrFromImage };
