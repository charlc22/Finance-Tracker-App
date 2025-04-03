const express = require('express');
const router = express.Router();
const multer = require('multer');
const BankStatement = require('../models/BankStatement');
const auth = require('../middleware/auth');
//const { executePythonScript } = require('../utils/pythonExecutor');
const path = require('path');

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

// Test route
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

        try {

            // Path to the Python script
            const scriptPath = path.join(_dirname, '../scripts/WellsFargoPDF_Extractor.py');

            // Execute the Python script with the PDF data
            const pythonResult = await executePythonScript(scriptPath, [], req.file.buffer);

            // Parse the stdout to get the transaction list
            const transactionList = parseTransactionOutput(pythonResult.stdout);

            // Update the bank statement with the transaction list
            await processTransactions(bankStatement._id, transactionList);

            // Respond with success and include the parsed transaction count
            res.status(201).json({
                message: 'Bank statement uploaded and parsed successfully',
                statementId: bankStatement._id,
                transactionsFound: transactionsList.length
        });

        } catch (pythonError) {
            // If Python processing fails, still return success for the upload
            // but note that parsing failed
            console.error('Python processing error:', pythonError);
            res.status(201).json({
                message: 'Bank statement uploaded successfully, but parsing failed',
                statementId: bankStatement._id,
                parsingError: pythonError.message
            });
        }

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

// Request ML analysis for a statement
router.post('/analyze/:id', auth, async (req, res) => {
    try {
        const statementId = req.params.id;
        const statement = await BankStatement.findOne({
            _id: statementId,
            userId: req.user.userId
        });

        if (!statement) {
            return res.status(404).json({ error: 'Statement not found' });
        }

        if (statement.isProcessed) {
            return res.status(400).json({
                error: 'Statement already processed',
                statementId: statementId,
                isProcessed: true
            });
        }

        // For demonstration, simulate ML processing by setting some dummy data
        // In a real app, you would likely queue this for async processing
        const mockResults = {
            expenses: [
                { category: 'food', amount: Math.random() * 800 + 200, date: new Date() },
                { category: 'rent', amount: Math.random() * 500 + 700, date: new Date() },
                { category: 'utilities', amount: Math.random() * 200 + 100, date: new Date() },
                { category: 'clothing', amount: Math.random() * 300 + 100, date: new Date() },
                { category: 'vehicle', amount: Math.random() * 400 + 150, date: new Date() },
                { category: 'other', amount: Math.random() * 200 + 50, date: new Date() }
            ],
            totalExpenses: 0,
            processedDate: new Date()
        };

        // Calculate total
        mockResults.totalExpenses = mockResults.expenses.reduce(
            (sum, expense) => sum + expense.amount, 0
        );

        // Update the document with the mock ML results
        statement.mlResults = mockResults;
        statement.isProcessed = true;
        await statement.save();

        res.json({
            message: 'Statement processed successfully',
            statementId: statementId,
            isProcessed: true
        });
    } catch (error) {
        console.error('Analysis request error:', error);
        res.status(500).json({ error: 'Error processing statement' });
    }
});

// Get analysis results for a statement
router.get('/analysis/:id', auth, async (req, res) => {
    try {
        const statementId = req.params.id;
        const statement = await BankStatement.findOne({
            _id: statementId,
            userId: req.user.userId
        }).select('-pdfData'); // Exclude PDF data from the response

        if (!statement) {
            return res.status(404).json({ error: 'Statement not found' });
        }

        if (!statement.isProcessed) {
            return res.status(400).json({
                error: 'Statement has not been processed yet',
                statementId: statementId,
                isProcessed: false
            });
        }

        res.json({
            statementId: statementId,
            mlResults: statement.mlResults,
            isProcessed: statement.isProcessed
        });
    } catch (error) {
        console.error('Fetch analysis error:', error);
        res.status(500).json({ error: 'Error fetching analysis results' });
    }
});

module.exports = router;