// routes/BankStatements.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const BankStatement = require('../models/BankStatement');
const auth = require('../middleware/auth');
const { executePythonScript } = require('../utils/pythonExecutor');

// Configure multer for PDF uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
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
    console.log(`[${new Date().toISOString()}] Bank Statement Route accessed:`, req.method, req.url);
    next();
});

// Test route
router.get('/test', (req, res) => {
    console.log('Test endpoint hit');
    res.json({ message: 'Bank statements route is working' });
});

// Simple ping endpoint for testing
router.get('/ping', (req, res) => {
    console.log('Ping endpoint hit');
    res.json({ message: 'pong' });
});

// Upload bank statement and parse with Python
router.post('/upload', auth, upload.single('statement'), async (req, res) => {
    console.log('Upload endpoint hit, user:', req.userId);
    try {
        if (!req.file) {
            console.log('No file uploaded');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('File received:', req.file.originalname, 'size:', req.file.size);

        // Create a new bank statement entry
        const bankStatement = new BankStatement({
            userId: req.userId,
            title: req.body.title || 'Bank Statement',
            fileName: req.file.originalname,
            pdfData: req.file.buffer,
            uploadDate: new Date(),
            isProcessed: false
        });

        // Save the initial bank statement record
        await bankStatement.save();
        console.log('Statement saved to database, ID:', bankStatement._id);

        // Return success response immediately to avoid timeout
        res.status(201).json({
            message: 'Bank statement uploaded successfully',
            statementId: bankStatement._id,
            isProcessed: false
        });

        // Process with Python in the background
        try {
            console.log('Starting background processing for statement:', bankStatement._id);
            processStatementWithPython(bankStatement);
        } catch (backgroundError) {
            console.error('Error starting background processing:', backgroundError);
        }

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Error uploading bank statement' });
    }
});

// Function to process a statement with Python in the background
async function processStatementWithPython(statement) {
    try {
        // Create a temporary file for the PDF
        const tempDir = os.tmpdir();
        const tempFilePath = path.join(tempDir, `statement_${Date.now()}.pdf`);

        // Write the PDF data to a temporary file
        fs.writeFileSync(tempFilePath, statement.pdfData);
        console.log(`PDF saved to temporary file: ${tempFilePath}`);

        // Path to the Python script - adjust this to your actual path
        const scriptPath = path.join(__dirname, '..', 'scripts', 'wellsfargo_parser.py');

        // Execute the Python script
        console.log('Executing Python parser...');
        const result = await executePythonScript(scriptPath, [tempFilePath]);

        // Use the parsed JSON from the updated pythonExecutor
        const parserOutput = result.parsedJson;

        if (!parserOutput) {
            throw new Error('Failed to get valid data from Python parser');
        }

        console.log(`Parser found ${parserOutput.summary.totalTransactions} transactions`);

        // Update the statement with the parsed data
        statement.mlResults = {
            expenses: parserOutput.transactions,
            totalExpenses: parserOutput.summary.totalDebits,
            totalCredits: parserOutput.summary.totalCredits,
            totalTransactions: parserOutput.summary.totalTransactions,
            processedDate: new Date(),
            categoryBreakdown: parserOutput.categoryBreakdown
        };

        statement.isProcessed = true;
        await statement.save();
        console.log('Statement updated with parsed data, ID:', statement._id);

        // Clean up the temporary file
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
            console.log('Temporary PDF file deleted');
        }
    } catch (error) {
        console.error('Error processing statement with Python:', error);

        // Update the statement with the error
        statement.processingError = error.message;
        await statement.save();
    }
}

// Get user's bank statements
router.get('/statements', auth, async (req, res) => {
    console.log('Statements endpoint hit for user:', req.user.userId);
    try {
        const statements = await BankStatement.find({
            userId: req.user.userId
        }).select('-pdfData')  // Exclude PDF data from the response
            .sort({ uploadDate: -1 });

        console.log('Found statements:', statements.length);
        res.json(statements);

    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ error: 'Error fetching bank statements' });
    }
});

// Request processing for a statement manually
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

        // We'll process it with the Python parser now
        console.log('Starting manual processing for statement:', statementId);

        // Create a temporary file for the PDF
        const tempDir = os.tmpdir();
        const tempFilePath = path.join(tempDir, `statement_${Date.now()}.pdf`);

        // Write the PDF data to a temporary file
        fs.writeFileSync(tempFilePath, statement.pdfData);
        console.log(`PDF saved to temporary file: ${tempFilePath}`);

        // Path to the Python script
        const scriptPath = path.join(__dirname, '..', 'scripts', 'wellsfargo_parser.py');

        // Execute the Python script
        console.log('Executing Python parser...');
        const result = await executePythonScript(scriptPath, [tempFilePath]);

        // Use the parsed JSON from the updated pythonExecutor
        const parserOutput = result.parsedJson;

        if (!parserOutput) {
            throw new Error('Failed to get valid data from Python parser');
        }

        console.log(`Parser found ${parserOutput.summary.totalTransactions} transactions`);

        // Update the statement with the parsed data
        statement.mlResults = {
            expenses: parserOutput.transactions,
            totalExpenses: parserOutput.summary.totalDebits,
            totalCredits: parserOutput.summary.totalCredits,
            totalTransactions: parserOutput.summary.totalTransactions,
            processedDate: new Date(),
            categoryBreakdown: parserOutput.categoryBreakdown
        };

        statement.isProcessed = true;
        await statement.save();

        // Clean up the temporary file
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
            console.log('Temporary PDF file deleted');
        }

        res.json({
            message: 'Statement processed successfully',
            statementId: statementId,
            isProcessed: true,
            transactionCount: parserOutput.summary.totalTransactions
        });
    } catch (error) {
        console.error('Analysis request error:', error);
        res.status(500).json({ error: 'Error processing statement: ' + error.message });
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