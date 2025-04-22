import { Client } from 'xrpl';

let CACHE_NAME;
let SITES_CONFIG_URL;
let LAST_MODIFIED_URL;
let TIMESTAMP_URL;
let XRPL_WS_URL;
let SAVE_NEW_URL;
let API_TOKEN;

let configLoaded = false;

async function loadConfig() {
    try {
        const response = await fetch(chrome.runtime.getURL('config.json'));
        const config = await response.json();
        CACHE_NAME = config.CACHE_NAME;
        SITES_CONFIG_URL = config.SITES_CONFIG_URL;
        LAST_MODIFIED_URL = config.LAST_MODIFIED_URL;
        TIMESTAMP_URL = config.TIMESTAMP_URL;
        XRPL_WS_URL = config.XRPL_WS_URL;
        SAVE_NEW_URL = config.SAVE_NEW_URL;
        API_TOKEN = config.API_TOKEN; // Properly assign API_TOKEN
        console.log('Config loaded:', config);
        configLoaded = true;
    } catch (error) {
        console.error('Failed to load config:', error);
    }
}

// const EXPIRATION_TIME_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const EXPIRATION_TIME_MS = 60 * 1000; // 1 minute for development

async function getSitesConfig() {
    if (!configLoaded) {
        await loadConfig();
    }

    if (!API_TOKEN) {
        console.error('API_TOKEN is not initialized');
        throw new Error('API_TOKEN is not initialized');
    }

    const cachedData = await chrome.storage.local.get(['sitesConfig', 'sitesConfigTimestamp']);
    const now = Date.now();

    if (cachedData.sitesConfig &&
        cachedData.sitesConfigTimestamp &&
        (now - cachedData.sitesConfigTimestamp < EXPIRATION_TIME_MS) &&
        cachedData.sitesConfig.length > 0) {
        console.log('Returning cached sitesConfig:', cachedData.sitesConfig);
        return cachedData.sitesConfig;
    }

    try {
        const url = `${SITES_CONFIG_URL}?t=${Date.now()}`;
        const headers = new Headers();
        headers.append('x-api-token', API_TOKEN);
        console.log('Headers being sent:', Object.fromEntries(headers));

        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Response: ${text}`);
        }

        const data = await response.json();
        await chrome.storage.local.set({
            sitesConfig: data,
            sitesConfigTimestamp: now
        });
        return data;
    } catch (error) {
        console.error('Fetch error:', error.message);
        return cachedData.sitesConfig || [];
    }
}

async function checkAndSendURL(tab) {
    const sitesConfig = await getSitesConfig();
    const urlExists = sitesConfig.some(site => tab.url.startsWith(site.url));
    if (!urlExists) {
        const data = { url: tab.url };
        try {
            const headers = new Headers();
            headers.append('x-api-token', API_TOKEN); // Use custom header
            headers.append('Content-Type', 'application/json');
            const response = await fetch(SAVE_NEW_URL, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const text = await response.text();
                console.error('Failed to send URL:', response.status, text);
            }
        } catch (error) {
            console.error('POST fetch error:', error);
        }
    }
}

async function getNftOwner(nftId) {
    const client = new Client(XRPL_WS_URL);
    await client.connect();
    try {
        const response = await client.request({ command: 'nft_info', nft_id: nftId });
        return response.result.owner;
    } catch (error) {
        console.error('Failed to get NFT owner:', error);
        throw error;
    } finally {
        await client.disconnect();
    }
}

function isValidXRPAddress(address) {
    const regex = /r[1-9A-HJ-NP-Za-km-z]{24,34}/;
    return regex.test(address);
}

function extractWalletAddress(url) {
    const regex = /r[1-9A-HJ-NP-Za-km-z]{24,34}/;
    const matches = url.match(regex);
    return matches ? matches[0] : '';
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSitesConfig') {
        getSitesConfig()
            .then(sitesConfig => sendResponse({ sitesConfig }))
            .catch(error => {
                console.error('getSitesConfig error:', error);
                sendResponse({ error: error.message });
            });
        return true;
    } else if (request.action === 'getXrpAddress') {
        getNftOwner(request.nftId)
            .then(xrpAddress => sendResponse({ xrpAddress }))
            .catch(error => {
                console.error('getXrpAddress error:', error);
                sendResponse({ error: error.message });
            });
        return true;
    }
});

chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: "sendMessage",
        title: chrome.i18n.getMessage("messageWalletTitle"),
        contexts: ["selection", "link"]
    });
    // Fetch and cache sitesConfig
    try {
        //loadConfig(); // Load config first to set API_TOKEN, etc.
        getSitesConfig(); // Fetch and cache sitesConfig
        console.log('sitesConfig fetched and cached on install');
    } catch (error) {
        console.error('Failed to fetch sitesConfig on install:', error);
    }
});

let rightClickedAddress = null;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === 'rightClickWithXRPAddress') {
        rightClickedAddress = request.address;
    }
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    let walletAddress;
    if (info.menuItemId === "sendMessage") {
        if (rightClickedAddress && isValidXRPAddress(rightClickedAddress)) {
            walletAddress = rightClickedAddress;
        } else if (info.selectionText && isValidXRPAddress(info.selectionText)) {
            walletAddress = info.selectionText;
        } else if (isValidXRPAddress(info.linkUrl)) {
            walletAddress = extractWalletAddress(info.linkUrl);
        }
        if (walletAddress) {
            checkAndSendURL(tab);
            const newURL = `https://app.textrp.io/#/user/@${walletAddress}:synapse.textrp.io`;
            chrome.tabs.create({ url: newURL });
        }
    }
});