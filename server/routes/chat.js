const express = require('express');
const auth = require('../middleware/auth');
const Document = require('../models/Document');
// const Chunk = require('../models/Chunk');
const { chatWithDocument } = require('../services/geminiService');

const router = express.Router();

const Message = require('../models/Message');

// GET /api/chat/:documentId — Get chat history
router.get('/:documentId', auth, async (req, res) => {
    try {
        const messages = await Message.find({
            documentId: req.params.documentId,
            userId: req.user._id
        }).sort({ createdAt: 1 });

        res.json({ messages });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch chat history', error: error.message });
    }
});

// POST /api/chat/:documentId — Chat with a document
router.post('/:documentId', auth, async (req, res) => {
    try {
        const { question } = req.body;

        if (!question || question.trim().length === 0) {
            return res.status(400).json({ message: 'Question is required' });
        }

        // Verify document belongs to user
        const doc = await Document.findOne({ _id: req.params.documentId, userId: req.user._id });
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }
        if (doc.status !== 'ready') {
            return res.status(400).json({ message: 'Document is still being processed' });
        }

        // Use full extracted text
        const documentText = doc.extractedText;
        if (!documentText || documentText.length === 0) {
            return res.status(400).json({ message: 'No text available for this document' });
        }

        // Fetch previous context from DB for the AI
        const previousMessages = await Message.find({
            documentId: doc._id,
            userId: req.user._id
        }).sort({ createdAt: 1 }).limit(20); // Limit context window

        // Save User Message
        const userMsg = await Message.create({
            documentId: doc._id,
            userId: req.user._id,
            role: 'user',
            content: question
        });

        // Call Gemini
        const answer = await chatWithDocument(
            question,
            documentText,
            previousMessages.map(m => ({ role: m.role, content: m.content })),
            doc.fileUrl,
            doc.fileType
        );

        // Save Assistant Message
        const assistantMsg = await Message.create({
            documentId: doc._id,
            userId: req.user._id,
            role: 'assistant',
            content: answer
        });

        res.json({ answer, messageId: assistantMsg._id });
    } catch (error) {
        console.error('Chat error:', error.message);
        res.status(500).json({ message: 'Chat failed', error: error.message });
    }
});

module.exports = router;
