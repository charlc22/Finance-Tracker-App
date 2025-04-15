// services/bankStatementService.js (Backend)
const fs = require('fs');
const path = require('path');
const os = require('os');
const BankStatement = require('../models/BankStatement');
const { parseBankStatement } = require('../utils/pythonExecutor');

/**
 * Process a PDF bank statement with the appropriate parser based on bank identification
 * @param {Buffer} pdfBuffer - The PDF file as a buffer
 * @param {string} filename - Original filename
 * @returns {Promise<Object>} Parser results
 */
async function processPdfWithParser(pdfBuffer, filename) {
    // Create a temporary file for the PDF
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `statement_${Date.now()}_${filename.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);

    try {
        // Write the PDF buffer to a temporary file
        fs.writeFileSync(tempFilePath, pdfBuffer);
        console.log(`PDF saved to temporary file: ${tempFilePath}`);

        // Use our enhanced parser with bank identification
        const result = await parseBankStatement(tempFilePath);

        // Parse the results
        const parserOutput = result.parsedJson;
        console.log(`Parser found ${parserOutput.summary.totalTransactions} transactions`);
        console.log(`Identified bank: ${parserOutput.bankIdentifier || 'Unknown'}`);

        return parserOutput;
    } finally {
        // Clean up the temporary file
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
            console.log('Temporary PDF file deleted');
        }
    }
}

/**
 * Create and process a new bank statement
 * @param {Object} data - Statement data
 * @param {string} data.userId - User ID
 * @param {string} data.title - Statement title
 * @param {string} data.fileName - Original filename
 * @param {Buffer} data.pdfData - PDF file buffer
 * @returns {Promise<Object>} Created and processed statement
 */
async function createAndProcessStatement(data) {
    // Create a new bank statement record
    const bankStatement = new BankStatement({
        userId: data.userId,
        title: data.title || 'Bank Statement',
        fileName: data.fileName,
        pdfData: data.pdfData,
        uploadDate: new Date(),
        isProcessed: false
    });

    // Save the initial record
    await bankStatement.save();
    console.log('Bank statement saved to database:', bankStatement._id);

    try {
        // Process the PDF
        const parserOutput = await processPdfWithParser(data.pdfData, data.fileName);

        // Update the bank statement with the parsed data
        bankStatement.mlResults = {
            expenses: parserOutput.transactions,
            totalExpenses: parserOutput.summary.totalDebits,
            totalCredits: parserOutput.summary.totalCredits,
            totalTransactions: parserOutput.summary.totalTransactions,
            processedDate: new Date(),
            categoryBreakdown: parserOutput.categoryBreakdown
        };

        // Update the bank name
        bankStatement.bankName = parserOutput.bankIdentifier || 'Unknown Bank';
        bankStatement.isProcessed = true;
        await bankStatement.save();
        console.log('Bank statement updated with parsed data');

        return {
            statement: bankStatement,
            parserOutput
        };
    } catch (error) {
        // Update statement with error information
        bankStatement.processingError = error.message || 'Error processing the PDF';
        await bankStatement.save();
        console.error('Error processing bank statement:', error);

        throw error;
    }
}

/**
 * Process an existing bank statement
 * @param {string} statementId - The ID of the statement to process
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated statement
 */
async function processExistingStatement(statementId, userId) {
    // Find the statement
    const statement = await BankStatement.findOne({
        _id: statementId,
        userId: userId
    });

    if (!statement) {
        throw new Error('Statement not found');
    }

    if (statement.isProcessed) {
        throw new Error('Statement already processed');
    }

    try {
        // Process the PDF
        const parserOutput = await processPdfWithParser(statement.pdfData, statement.fileName);

        // Update the statement with the parsed data
        statement.mlResults = {
            expenses: parserOutput.transactions,
            totalExpenses: parserOutput.summary.totalDebits,
            totalCredits: parserOutput.summary.totalCredits,
            totalTransactions: parserOutput.summary.totalTransactions,
            processedDate: new Date(),
            categoryBreakdown: parserOutput.categoryBreakdown
        };

        // Update the bank name
        statement.bankName = parserOutput.bankIdentifier || 'Unknown Bank';
        statement.isProcessed = true;
        statement.processingError = null;
        await statement.save();
        console.log('Bank statement updated with parsed data');

        return {
            statement,
            parserOutput
        };
    } catch (error) {
        // Update statement with error information
        statement.processingError = error.message || 'Error processing the PDF';
        await statement.save();
        console.error('Error processing bank statement:', error);

        throw error;
    }
}

/**
 * Get all statements for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of statements
 */
async function getUserStatements(userId) {
    return BankStatement.find({ userId })
        .select('-pdfData')  // Exclude PDF data
        .sort({ uploadDate: -1 });
}

/**
 * Get a single statement by ID
 * @param {string} statementId - Statement ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Statement object
 */
async function getStatementById(statementId, userId) {
    const statement = await BankStatement.findOne({
        _id: statementId,
        userId: userId
    }).select('-pdfData');  // Exclude PDF data

    if (!statement) {
        throw new Error('Statement not found');
    }

    return statement;
}

/**
 * Get statements by bank name
 * @param {string} userId - User ID
 * @param {string} bankName - Bank name to filter by
 * @returns {Promise<Array>} Array of statements
 */
async function getStatementsByBank(userId, bankName) {
    return BankStatement.find({
        userId: userId,
        bankName: bankName
    })
        .select('-pdfData')  // Exclude PDF data
        .sort({ uploadDate: -1 });
}

/**
 * Get all unique banks for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of unique bank names
 */
async function getUserBanks(userId) {
    const result = await BankStatement.distinct('bankName', { userId: userId });
    return result.filter(bank => bank !== 'Unknown Bank');
}

/**
 * Delete a statement
 * @param {string} statementId - Statement ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success indicator
 */
async function deleteStatement(statementId, userId) {
    const result = await BankStatement.deleteOne({
        _id: statementId,
        userId: userId
    });

    return result.deletedCount > 0;
}

module.exports = {
    processPdfWithParser,
    createAndProcessStatement,
    processExistingStatement,
    getUserStatements,
    getStatementById,
    getStatementsByBank,
    getUserBanks,
    deleteStatement
};