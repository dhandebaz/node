const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const tmp = require('tmp');

const app = express();
const PORT = process.env.PORT || 8000;
const API_KEY = process.env.VPS_API_KEY;

if (!API_KEY) {
    throw new Error('VPS_API_KEY is required');
}

app.use(cors());
app.use(bodyParser.json());

// Auth Middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing Bearer token' });
    }
    const token = authHeader.split(' ')[1];
    if (token !== API_KEY) {
        return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }
    next();
};

app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

app.post('/execute', authenticate, async (req, res) => {
    const { code, language, timeout = 30000 } = req.body;

    if (!code || !language) {
        return res.status(400).json({ error: 'Missing code or language' });
    }

    let command = '';
    let tmpFile = null;

    try {
        if (language === 'javascript' || language === 'node') {
            tmpFile = tmp.fileSync({ postfix: '.js' });
            fs.writeFileSync(tmpFile.name, code);
            command = `node ${tmpFile.name}`;
        } else if (language === 'python') {
            tmpFile = tmp.fileSync({ postfix: '.py' });
            fs.writeFileSync(tmpFile.name, code);
            command = `python3 ${tmpFile.name}`;
        } else if (language === 'bash') {
            tmpFile = tmp.fileSync({ postfix: '.sh' });
            fs.writeFileSync(tmpFile.name, code);
            fs.chmodSync(tmpFile.name, '755');
            command = `/bin/bash ${tmpFile.name}`;
        } else {
            return res.status(400).json({ error: `Unsupported language: ${language}` });
        }

        const startTime = Date.now();

        exec(command, { timeout, maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
            const duration = Date.now() - startTime;
            
            // Clean up temp file
            if (tmpFile) {
                tmpFile.removeCallback();
            }

            res.json({
                stdout: stdout || '',
                stderr: stderr || '',
                exitCode: error ? error.code || 1 : 0,
                duration,
                error: error ? error.message : null
            });
        });

    } catch (err) {
        if (tmpFile) tmpFile.removeCallback();
        console.error("Execution error:", err);
        res.status(500).json({ error: 'Internal server execution error' });
    }
});

app.listen(PORT, () => {
    console.log(`Vibecoder execution server running on port ${PORT}`);
});
