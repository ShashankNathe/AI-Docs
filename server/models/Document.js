const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    extractedText: { type: String, default: '' },
    summary: { type: String, default: '' },
    topics: [{ type: String }],
    documentType: { type: String, default: '' },
    keyInsights: [{ type: String }],
    entities: [{ type: String }],
    status: { type: String, enum: ['processing', 'ready', 'error'], default: 'processing' },
    errorMessage: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
