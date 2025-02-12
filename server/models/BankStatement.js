// bankStatement.model.js
const mongoose = require('mongoose');

const bankStatementSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    fileName: {
        type: String,
        required: true
    },
    pdfData: {
        type: Buffer,
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    isProcessed: {
        type: Boolean,
        default: false
    },
    mlResults: {
        expenses: [{
            category: String,
            amount: Number,
            date: Date
        }],
        totalExpenses: Number,
        processedDate: Date
    }
});

// Simple index for quick user-based queries
bankStatementSchema.index({ userId: 1, uploadDate: -1 });

const BankStatement = mongoose.model('BankStatement', bankStatementSchema);

module.exports = BankStatement;