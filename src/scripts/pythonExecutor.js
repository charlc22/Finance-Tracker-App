// utils/pythonExecutor.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

/**
* Execute a Python script with given arguments and input data
*
* @param {string} scriptPath - Path to the Python script
* @param {Array} args - Arguments to pass to the script
* @param {Buffer|null} inputData - Optional binary data to pass to the script
* @returns {Promise<{stdout: string, stderr: string, exitCode: number}>}
*/
function executePythonScript(scriptPath, args = [], inputData = null) {
return new Promise((resolve, reject) => {
                                        // Validate script exists
if (!fs.existsSync(scriptPath)) {
return reject(new Error(`Python script not found: ${scriptPath}`));
}

console.log(`Executing Python script: ${scriptPath}`);
console.log(`With arguments: ${args.join(', ')}`);

// Create a temporary file for the PDF if inputData is provided
let tempFilePath = null;
if (inputData) {
tempFilePath = path.join(os.tmpdir(), `statement_${Date.now()}.pdf`);
fs.writeFileSync(tempFilePath, inputData);
args.push(tempFilePath); // Add temp file path as an argument
console.log(`Created temp file: ${tempFilePath}`);
}

// Determine Python executable (python3 on Unix, python on Windows)
const pythonExecutable = os.platform() === 'win32' ? 'python' : 'python3';

// Spawn Python process
const pythonProcess = spawn(pythonExecutable, [scriptPath, ...args]);

let stdout = '';
let stderr = '';

// Collect stdout
pythonProcess.stdout.on('data', (data) => {
    stdout += data.toString();
});

// Collect stderr
pythonProcess.stderr.on('data', (data) => {
    stderr += data.toString();
});

// Handle process completion
pythonProcess.on('close', (exitCode) => {
    console.log(`Python process exited with code ${exitCode}`);

// Clean up temp file if created
if (tempFilePath && fs.existsSync(tempFilePath)) {
try {
fs.unlinkSync(tempFilePath);
console.log(`Deleted temp file: ${tempFilePath}`);
} catch (err) {
    console.error(`Failed to delete temp file: ${err.message}`);
}
}

if (exitCode !== 0) {
console.error(`Python script error (${exitCode}): ${stderr}`);
return reject(new Error(`Python script exited with code ${exitCode}: ${stderr}`));
}

resolve({ stdout, stderr, exitCode });
});

// Handle process errors
pythonProcess.on('error', (err) => {
    console.error(`Failed to start Python process: ${err.message}`);

// Clean up temp file if created
if (tempFilePath && fs.existsSync(tempFilePath)) {
try {
fs.unlinkSync(tempFilePath);
} catch (cleanupErr) {
console.error(`Failed to delete temp file: ${cleanupErr.message}`);
}
}

reject(new Error(`Failed to execute Python script: ${err.message}`));
});
});
}

module.exports = { executePythonScript };