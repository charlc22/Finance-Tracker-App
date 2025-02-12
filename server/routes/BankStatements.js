// routes/statements.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const BankStatement = require('../models/bankStatement.model');

// Configure multer for PDF uploads
const upload = multer({
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit for demo
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// Upload route
router.post('/upload', upload.single('pdfFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }

        const newStatement = new BankStatement({
            userId: req.user._id, // Assuming you have authentication middleware
            title: req.body.title,
            fileName: req.file.originalname,
            pdfData: req.file.buffer,
            uploadDate: new Date()
        });

        await newStatement.save();

        res.status(201).json({
            message: 'PDF uploaded successfully',
            statementId: newStatement._id,
            title: newStatement.title
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload PDF' });
    }
});

// Get all statements for a user
router.get('/list', async (req, res) => {
    try {
        const statements = await BankStatement.find(
            { userId: req.user._id },
            { pdfData: 0 } // Exclude PDF data from results
        ).sort({ uploadDate: -1 });

        res.json(statements);
    } catch (error) {
        console.error('List error:', error);
        res.status(500).json({ error: 'Failed to retrieve statements' });
    }
});

// Get a specific statement
router.get('/:id', async (req, res) => {
    try {
        const statement = await BankStatement.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!statement) {
            return res.status(404).json({ error: 'Statement not found' });
        }

        res.json(statement);
    } catch (error) {
        console.error('Retrieval error:', error);
        res.status(500).json({ error: 'Failed to retrieve statement' });
    }
});

module.exports = router;