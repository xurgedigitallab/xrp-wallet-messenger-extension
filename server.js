const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { Client } = require("xrpl");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["x-svc-call", "authorization", "content-type"],
    }),
);

const apiToken = process.env["API_TOKEN"];
//console.log(apiToken);
const XRPL_WS_URL = process.env.XRPL_WS_URL || "wss://s1.ripple.com"; // Use environment variable or fallback

// Middleware for API routes
app.use("/api/*", (req, res, next) => {
    // console.log("All headers:", req.headers);
    const token = req.headers["x-svc-call"];

    if (token !== apiToken) {
        console.log(
            `[${new Date().toISOString()}] Call rejected: Unauthorized`,
        );
        return res.status(401).json({ error: "Unauthorized" });
    }
    console.log(`[${new Date().toISOString()}] Call accepted: Authorized`);
    next();
});

const sitesConfigPath = path.join(__dirname, "sitesConfig.json");
app.get("/api/sites-config-last-modified", (req, res) => {
    fs.stat(sitesConfigPath, (err, stats) => {
        if (err) {
            return res.status(500).json({ error: "Error getting file stats" });
        }
        console.log("Getting requested file stats:", stats);
        res.json({ lastModified: stats.mtime.getTime() });
    });
});

app.get("/api/sites-config", (req, res) => {
    if (fs.existsSync(sitesConfigPath)) {
        const sitesConfig = JSON.parse(
            fs.readFileSync(sitesConfigPath, "utf8"),
        );
        console.log(`Sending sites config from:`, sitesConfigPath);
        res.json(sitesConfig);
    } else {
        res.status(404).json({ error: "sitesConfig.json not found" });
    }
});

app.post("/api/save-url", (req, res) => {
    const { url: requestUrl } = req.body;
    const parsedUrl = new URL(requestUrl);
    const urlOrigin = parsedUrl.origin;
    const date = new Date().toISOString().split("T")[0];
    const logFilePath = path.join(__dirname, "logs", `${date}.json`);
    let logData = [];
    if (fs.existsSync(logFilePath)) {
        logData = JSON.parse(fs.readFileSync(logFilePath, "utf8"));
    }
    const domainExists = logData.some(
        (entry) => new URL(entry.url).origin === urlOrigin,
    );
    if (!domainExists) {
        logData.push({ url: requestUrl });
        fs.writeFileSync(logFilePath, JSON.stringify(logData, null, 2));
        console.log("URL saved successfully: ", requestUrl);
        res.sendStatus(200);
    } else {
        console.log("URL not saved, domain already exists: ", requestUrl);
        res.sendStatus(409);
    }
});

app.get("/api/get-nft-owner", async (req, res) => {
    const { nftId } = req.query;
    if (!nftId) {
        return res.status(400).json({ error: "nftId is required" });
    }
    console.log("Getting NFT owner for:", nftId);
    const client = new Client(XRPL_WS_URL);
    try {
        await client.connect();
        const response = await client.request({
            command: "nft_info",
            nft_id: nftId,
        });
        res.json({ owner: response.result.owner });
    } catch (error) {
        console.error("Failed to get NFT owner:", error);
        res.status(500).json({ error: error.message });
    } finally {
        await client.disconnect();
    }
});

app.get("/api/themes", (req, res) => {
    const svcCall = req.headers["x-svc-call"];
    if (svcCall !== API_TOKEN) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const themesPath = path.join(__dirname, "themes.json");
    if (fs.existsSync(themesPath)) {
        const themes = JSON.parse(fs.readFileSync(themesPath, "utf8"));
        res.json(themes);
    } else {
        res.status(404).json({ error: "themes.json not found" });
    }
});

// Feedback endpoint
app.post("/api/feedback", (req, res) => {
    const feedback = req.body;
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        feedback,
        ip: req.ip,
    };

    // Create logs directory if it doesn't exist
    const logsDir = path.join(__dirname, "logs");
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }

    // Log to feedback.log file
    const logFile = path.join(logsDir, "feedback.log");
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + "\n");

    console.log("Feedback received:", logEntry);
    res.status(200).json({ message: "Feedback received", timestamp });
});

// Create HTTP server
app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
