// services/pdfAnalysisService.js
const BankStatement = require('../models/BankStatement');

/**
 * Simulates ML processing of a PDF bank statement
 * In a real application, this would likely use a proper ML service
 * and probably be implemented as a queue worker.
 *
 * @param {string} statementId - The ID of the statement to analyze
 * @returns {Promise<Object>} - Results of the analysis
 */
const analyzePdfStatement = async (statementId) => {
    console.log(`Starting analysis of statement ${statementId}`);

    try {
        // Get the statement from the database
        const statement = await BankStatement.findById(statementId);

        if (!statement) {
            throw new Error('Statement not found');
        }

        // In a real application, we would:
        // 1. Extract text from the PDF (using a library like pdf.js or a service)
        // 2. Use NLP/ML to identify transactions and categorize them
        // 3. Process the results into a structured format

        // For demo purposes, we'll create mock data
        const mockResults = {
            expenses: generateMockExpenses(),
            processedDate: new Date()
        };

        // Calculate the total expenses
        mockResults.totalExpenses = mockResults.expenses.reduce(
            (sum, expense) => sum + expense.amount, 0
        );

        // Update the statement with the analysis results
        statement.mlResults = mockResults;
        statement.isProcessed = true;
        await statement.save();

        console.log(`Analysis completed for statement ${statementId}`);
        return mockResults;
    } catch (error) {
        console.error(`Error analyzing statement ${statementId}:`, error);
        throw error;
    }
};

/**
 * Helper function to generate mock expense data
 * @returns {Array<Object>} Array of mock expenses
 */
const generateMockExpenses = () => {
    // Categories and their typical ranges
    const categories = [
        { name: 'food', min: 200, max: 800 },
        { name: 'rent', min: 700, max: 1500 },
        { name: 'utilities', min: 100, max: 300 },
        { name: 'clothing', min: 50, max: 400 },
        { name: 'vehicle', min: 100, max: 500 },
        { name: 'other', min: 50, max: 300 }
    ];

    // Generate a random date within the past month
    const randomDate = () => {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        return date;
    };

    // Generate 15-25 random expenses
    const numExpenses = Math.floor(Math.random() * 10) + 15;
    const expenses = [];

    for (let i = 0; i < numExpenses; i++) {
        // Select a random category
        const category = categories[Math.floor(Math.random() * categories.length)];

        // Generate a random amount within the category's range
        const amount = Math.random() * (category.max - category.min) + category.min;

        expenses.push({
            category: category.name,
            amount: parseFloat(amount.toFixed(2)),
            date: randomDate()
        });
    }

    return expenses;
};

module.exports = {
    analyzePdfStatement
};