const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

function getGenAI() {
    if (!genAI) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return genAI;
}

/**
 * Generate a structured summary of document text.
 */
async function generateSummary(text) {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Truncate to ~30k chars to stay within context window
    const truncatedText = text.length > 30000 ? text.slice(0, 30000) + '\n...[truncated]' : text;

    const prompt = `You are an AI document analyst. Analyze the following document and provide your response in this exact JSON format:

{
  "summary": "A concise summary in 5-8 lines",
  "topics": ["topic1", "topic2", "topic3"],
  "entities": ["entity1", "entity2"],
  "documentType": "type of document (e.g. report, article, legal, academic, etc.)",
  "keyInsights": ["insight1", "insight2", "insight3"]
}

Important: Return ONLY valid JSON, no markdown formatting, no code blocks.

Document:
${truncatedText}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Try to parse JSON from the response
    try {
        // Remove potential markdown code block wrapping
        const cleaned = responseText.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        // If parsing fails, return a basic structure
        return {
            summary: responseText,
            topics: [],
            entities: [],
            documentType: 'Unknown',
            keyInsights: [],
        };
    }
}

/**
 * Chat with document context using Gemini Flash.
 */
/**
 * Chat with document context using Gemini Flash.
 */
async function chatWithDocument(question, documentText, chatHistory = [], docUrl = null, docType = null) {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Truncate to ~100k chars to stay within context window
    const truncatedText = documentText.length > 100000 ? documentText.slice(0, 100000) + '\n...[truncated]' : documentText;

    const historyContext = chatHistory.length > 0
        ? '\nPrevious conversation:\n' + chatHistory.map(m => `${m.role}: ${m.content}`).join('\n') + '\n'
        : '';

    const parts = [];

    // Prompt construction
    const textPrompt = `You are a helpful document assistant. Answer the user's question based on the document context provided below. If the answer cannot be found in the context, say so clearly but try to be helpful.
${historyContext}
Document Context:
${truncatedText}

User Question: ${question}

Provide a clear, well-structured answer. Use markdown formatting where helpful.`;

    parts.push(textPrompt);

    // If it's an image, fetch it and add to prompt for multimodal understanding
    if (docUrl && (docType === 'image' || docType === 'pdf')) { // Gemini can handle PDFs too technically, but sticking to images for now logic
        // Only valid for images or if we treat PDF pages as images (which we aren't here yet, assuming just images for now)
        if (docType === 'image' || docUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
            try {
                // We need to fetch the image buffer again
                const fetch = global.fetch || (await import('node-fetch').then(m => m.default));
                const response = await fetch(docUrl);
                if (response.ok) {
                    const arrayBuffer = await response.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);

                    parts.push({
                        inlineData: {
                            data: buffer.toString('base64'),
                            mimeType: response.headers.get('content-type') || 'image/jpeg'
                        }
                    });
                    console.log("Attached image context to chat prompt");
                }
            } catch (err) {
                console.error("Failed to attach image to chat:", err.message);
            }
        }
    }

    const result = await model.generateContent(parts);
    return result.response.text();
}

/**
 * OCR fallback using Gemini Vision.
 */
async function ocrWithVision(imageBuffer, mimeType = 'image/png') {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const imagePart = {
        inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType,
        },
    };

    const prompt = 'Analyze this image. 1. Extract all visible text, preserving formatting. 2. Provide a detailed visual description of the image content (objects, colors, scene). Combine them as:\n\n[Visual Description]\n(description here)\n\n[Extracted Text]\n(text here)';

    const result = await model.generateContent([prompt, imagePart]);
    return result.response.text();
}

module.exports = { generateSummary, chatWithDocument, ocrWithVision };
