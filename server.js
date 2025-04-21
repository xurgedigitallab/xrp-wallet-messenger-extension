const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['x-api-token', 'authorization', 'content-type']
  }));

const API_TOKEN = '1234567890qwertyuiop';

// Middleware for API routes
app.use('/api/*', (req, res, next) => {
    console.log('All headers:', req.headers);
    const token = req.headers['x-api-token'] || req.headers['authorization']?.replace('Bearer ', '');
    console.log('Received token:', token, 'Expected:', API_TOKEN);
    if (token !== API_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
});

const sitesConfigPath = path.join(__dirname, 'sitesConfig.json');
app.get('/api/sites-config-last-modified', (req, res) => {
    fs.stat(sitesConfigPath, (err, stats) => {
        if (err) {
            return res.status(500).json({ error: 'Error getting file stats' });
        }
        res.json({ lastModified: stats.mtime.getTime() });
    });
});

app.get('/api/sites-config', (req, res) => {
    if (fs.existsSync(sitesConfigPath)) {
        const sitesConfig = JSON.parse(fs.readFileSync(sitesConfigPath, 'utf8'));
        res.json(sitesConfig);
    } else {
        res.status(404).json({ error: 'sitesConfig.json not found' });
    }
});

app.post('/api/save-url', (req, res) => {
    const { url: requestUrl } = req.body;
    const parsedUrl = new URL(requestUrl);
    const urlOrigin = parsedUrl.origin;
    const date = new Date().toISOString().split('T')[0];
    const logFilePath = path.join(__dirname, 'logs', `${date}.json`);
    let logData = [];
    if (fs.existsSync(logFilePath)) {
        logData = JSON.parse(fs.readFileSync(logFilePath, 'utf8'));
    }
    const domainExists = logData.some(entry => new URL(entry.url).origin === urlOrigin);
    if (!domainExists) {
        logData.push({ url: requestUrl });
        fs.writeFileSync(logFilePath, JSON.stringify(logData, null, 2));
        res.sendStatus(200);
    } else {
        res.sendStatus(409);
    }
});

// Create HTTP server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});