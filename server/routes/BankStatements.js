const express = require('express');
const router = express.Router();
const multer = require('multer');
const BankStatement = require('../models/BankStatement');
const auth = require('../middleware/auth');

// Configure multer for PDF uploads
const upload = multer({
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// Add some debug logging
router.use((req, res, next) => {
    console.log('Bank Statement Route accessed:', req.method, req.url);
    next();
});

// Add this to your BankStatements.js route file
router.get('/test', (req, res) => {
    res.json({ message: 'Bank statements route is working' });
});

// Upload bank statement
router.post('/upload', auth, upload.single('statement'), async (req, res) => {
    console.log('Upload endpoint hit, user:', req.userId);
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const bankStatement = new BankStatement({
            userId: req.userId,
            title: req.body.title || 'Bank Statement',
            fileName: req.file.originalname,
            pdfData: req.file.buffer,
            uploadDate: new Date(),
            isProcessed: false
        });

        await bankStatement.save();
        console.log('Statement saved:', bankStatement._id);

        res.status(201).json({
            message: 'Bank statement uploaded successfully',
            statementId: bankStatement._id
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Error uploading bank statement' });
    }
});

// Get user's bank statements
router.get('/statements', auth, async (req, res) => {
    console.log('Statements endpoint hit');
    try {
        const statements = await BankStatement.find({
            userId: req.user.userId
        }).select('-pdfData')
            .sort({ uploadDate: -1 });

        console.log('Found statements:', statements.length);
        res.json(statements);

    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ error: 'Error fetching bank statements' });
    }
});

module.exports = router;