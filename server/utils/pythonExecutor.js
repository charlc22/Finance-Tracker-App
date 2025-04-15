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
 * @returns {Promise<{stdout: string, stderr: string, exitCode: number, parsedJson: Object}>}
 */
function executePythonScript(scriptPath, args = []) {
    return new Promise((resolve, reject) => {
        // Validate script exists
        if (!fs.existsSync(scriptPath)) {
            return reject(new Error(`Python script not found: ${scriptPath}`));
        }

        console.log(`Executing Python script: ${scriptPath}`);
        console.log(`With arguments: ${args.join(', ')}`);

        // Use the specific Python path for macOS
        const pythonExecutable = '/usr/local/bin/python3';
        // charly python /opt/anaconda3/bin/python


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

            if (exitCode !== 0) {
                console.error(`Python script error (${exitCode}): ${stderr}`);
                return reject(new Error(`Python script exited with code ${exitCode}: ${stderr}`));
            }

            // Extract JSON from the stdout
            let jsonData = null;
            const jsonStartIndex = stdout.indexOf('{');

            if (jsonStartIndex !== -1) {
                try {
                    const jsonString = stdout.substring(jsonStartIndex);
                    jsonData = JSON.parse(jsonString);
                    console.log('Successfully parsed JSON output from Python script');
                } catch (jsonError) {
                    console.error('Error parsing JSON from Python output:', jsonError);
                    console.log('Raw output snippet:', stdout.substring(jsonStartIndex, jsonStartIndex + 100) + '...');
                    return reject(new Error(`Failed to parse JSON from Python output: ${jsonError.message}`));
                }
            } else {
                console.warn('No JSON data found in Python script output');
            }

            resolve({
                stdout,
                stderr,
                exitCode,
                parsedJson: jsonData  // Include the parsed JSON in the response
            });
        });

        // Handle process errors
        pythonProcess.on('error', (err) => {
            console.error(`Failed to start Python process: ${err.message}`);
            reject(new Error(`Failed to execute Python script: ${err.message}`));
        });
    });
}

module.exports = { executePythonScript };