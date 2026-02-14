const express = require('express');
const auth = require('../middleware/auth');
const Document = require('../models/Document');
const Message = require('../models/Message'); // Assuming you have a Message model from previous task

const router = express.Router();

// GET /api/analytics - Get user analytics
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user._id;

        // Parallel execution for better performance
        const [
            totalDocuments,
            totalMessages,
            storageUsedResult,
            fileTypeDistribution
        ] = await Promise.all([
            Document.countDocuments({ userId }),
            Message.countDocuments({ userId }),
            Document.aggregate([
                { $match: { userId } },
                { $group: { _id: null, totalSize: { $sum: '$fileSize' } } }
            ]),
            Document.aggregate([
                { $match: { userId } },
                { $group: { _id: '$fileType', count: { $sum: 1 } } }
            ])
        ]);

        const storageUsed = storageUsedResult.length > 0 ? storageUsedResult[0].totalSize : 0;

        // Transform file type distribution into a cleaner object
        const fileTypes = fileTypeDistribution.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        res.json({
            totalDocuments,
            totalMessages,
            storageUsed,
            fileTypes
        });

    } catch (error) {
        console.error('Analytics error:', error.message);
        res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
    }
});

module.exports = router;
