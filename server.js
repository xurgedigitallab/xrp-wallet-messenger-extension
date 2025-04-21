const https = require('https');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const API_TOKEN = process.env.API_TOKEN || '1234567890qwertyuiop';

// Middleware and routes (unchanged)
app.use('/api/*', (req, res, next) => {
    console.log('Received X-API-Token:', req.headers['x-api-token']);
    const token = req.headers['x-api-token'];
    if (token !== API_TOKEN) {
        console.log('Token mismatch. Expected:', API_TOKEN);
        return res.status(401).send('Unauthorized');
    }
});

const sitesConfigPath = path.join(__dirname, 'sitesConfig.json');
app.get('/api/sites-config-last-modified', (req, res) => {
    fs.stat(sitesConfigPath, (err, stats) => {
        if (err) {
            return res.status(500).send('Error getting file stats');
        }
        res.json({ lastModified: stats.mtime.getTime() });
    });
});

app.get('/api/sites-config', (req, res) => {
    if (fs.existsSync(sitesConfigPath)) {
        const sitesConfig = JSON.parse(fs.readFileSync(sitesConfigPath, 'utf8'));
        res.json(sitesConfig);
    } else {
        res.status(404).send('sitesConfig.json not found');
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

// Create HTTPS server with mkcert certificate and custom ciphers
const options = {
    key: fs.readFileSync('localhost-key.pem'),
    cert: fs.readFileSync('localhost.pem'),
    minVersion: 'TLSv1.2', // Ensure modern TLS version
    ciphers: [
        'ECDHE-ECDSA-AES256-GCM-SHA384',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-ECDSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES128-GCM-SHA256'
    ].join(':')
};
const server = https.createServer(options, app);

server.listen(3000, () => {
    console.log('Secure server is running on https://localhost:3000');
});