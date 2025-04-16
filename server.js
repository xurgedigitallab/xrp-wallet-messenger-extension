const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

const sitesConfigPath = path.join(__dirname, 'sitesConfig.json');

const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Endpoint to get the last modified time of sitesConfig.json
app.get('/api/sites-config-last-modified', (req, res) => {
    console.log('Received request for last modified time of sitesConfig.json');
    fs.stat(sitesConfigPath, (err, stats) => {
        if (err) {
            console.error('Error getting file stats:', err);
            return res.status(500).send('Error getting file stats');
        }
        res.json({ lastModified: stats.mtime.getTime() });
    });
});

// Endpoint to get the sitesConfig.json file
app.get('/api/sites-config', (req, res) => {
    console.log('Received request for sitesConfig.json');
    if (fs.existsSync(sitesConfigPath)) {
        const sitesConfig = JSON.parse(fs.readFileSync(sitesConfigPath, 'utf8'));
        res.json(sitesConfig);
    } else {
        res.status(404).send('sitesConfig.json not found');
    }
});

app.post('/api/save-url', (req, res) => {
    console.log('Received request:', req.body);
    const { url: requestUrl } = req.body;
    const parsedUrl = new URL(requestUrl);
    const urlOrigin = parsedUrl.origin;

    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const logFilePath = path.join(logDir, `${date}.json`);

    let logData = [];
    if (fs.existsSync(logFilePath)) {
        logData = JSON.parse(fs.readFileSync(logFilePath, 'utf8'));
    }

    // Check for duplicate domains
    const domainExists = logData.some(entry => {
        const entryOrigin = new URL(entry.url).origin;
        return entryOrigin === urlOrigin;
    });

    if (!domainExists) {
        logData.push({ url: requestUrl });
        fs.writeFileSync(logFilePath, JSON.stringify(logData, null, 2));
        res.sendStatus(200);
    } else {
        console.log('Domain already exists in the log file.');
        res.sendStatus(409); // Conflict status code
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});