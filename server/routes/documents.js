// const express = require('express');
const express = require('express');
const path = require('path');
const fs = require('fs'); // Keep for delete operations if needed, or remove if fully remote
const auth = require('../middleware/auth');
const Document = require('../models/Document');
const { processDocument, getFileCategory } = require('../services/fileProcessor');

const router = express.Router();

// POST /api/documents/upload — Handle UploadThing metadata
router.post('/upload', auth, async (req, res) => {
    try {
        const { fileName, fileUrl, fileSize, fileType } = req.body;

        if (!fileName || !fileUrl) {
            return res.status(400).json({ message: 'Missing file metadata' });
        }

        const category = getFileCategory(fileName);

        const doc = await Document.create({
            userId: req.user._id,
            fileName: fileName,
            fileUrl: fileUrl, // Remote URL from UploadThing
            fileType: category,
            fileSize: fileSize || 0,
            status: 'processing',
        });

        res.status(201).json({
            message: 'File added to processing queue',
            document: doc,
        });

        // Process asynchronously
        processDocument(doc._id, fileUrl).catch(err => {
            console.error('Background processing error:', err.message);
        });

    } catch (error) {
        res.status(500).json({ message: 'Upload registration failed', error: error.message });
    }
});

// GET /api/documents — List all documents for the user
router.get('/', auth, async (req, res) => {
    try {
        const documents = await Document.find({ userId: req.user._id })
            .select('-extractedText')
            .sort({ createdAt: -1 });
        res.json({ documents });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/documents/:id — Get a single document with full details
router.get('/:id', auth, async (req, res) => {
    try {
        const doc = await Document.findOne({ _id: req.params.id, userId: req.user._id });
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.json({ document: doc });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE /api/documents/:id — Delete a document and its chunks
router.delete('/:id', auth, async (req, res) => {
    try {
        const doc = await Document.findOne({ _id: req.params.id, userId: req.user._id });
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Delete the file from disk
        const filePath = path.join(__dirname, '..', doc.fileUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete chunks and document
        // await Chunk.deleteMany({ documentId: doc._id });
        await Document.findByIdAndDelete(doc._id);

        res.json({ message: 'Document deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
