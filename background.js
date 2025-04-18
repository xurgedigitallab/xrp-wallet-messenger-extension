import { Client } from 'xrpl';

let CACHE_NAME;
let SITES_CONFIG_URL;
let LAST_MODIFIED_URL;
let TIMESTAMP_URL;
let XRPL_WS_URL;
let SAVE_NEW_URL;

let configLoaded = false;

// Load config from local file
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
        console.log('Config loaded:', config);
    } catch (error) {
        console.error('Failed to load config:', error);
    }
}

async function getSitesConfig() {
    try {
        if (!configLoaded || !SITES_CONFIG_URL) {
            console.warn('Reloading config in getSitesConfig...');
            await loadConfig();
            configLoaded = true;
        }

        if (!SITES_CONFIG_URL) {
            console.error('SITES_CONFIG_URL is still undefined after loadConfig');
            return [];
        }

        const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours
        const { sitesConfig, timestamp = 0 } = await new Promise(resolve =>
            chrome.storage.local.get(['sitesConfig', 'timestamp'], resolve)
        );
        const now = Date.now();

        const isExpired = now - timestamp > CACHE_EXPIRATION_MS;
        const isEmpty = !Array.isArray(sitesConfig) || sitesConfig.length === 0;

        if (isEmpty || isExpired) {
            console.warn('Cached sitesConfig is empty or expired. Fetching from server...');
            console.warn('Fetching sitesConfig from:', SITES_CONFIG_URL);
            const response = await fetch(SITES_CONFIG_URL);
            console.warn('Fetch response status:', response.status);

            if (!response.ok) {
                console.error(`Failed to fetch config. HTTP status: ${response.status}`);
                return [];
            }

            const text = await response.text();
            console.warn('Raw response text:', text);

            let freshConfig;
            try {
                freshConfig = JSON.parse(text);
            } catch (parseError) {
                console.error('Failed to parse JSON from sitesConfig:', parseError);
                return [];
            }

            if (!Array.isArray(freshConfig) || freshConfig.length === 0) {
                console.error('Fetched config is empty. Not updating cache.');
                return [];
            }

            console.warn('Saving sitesConfig to storage:', freshConfig);
            if (Array.isArray(freshConfig) && freshConfig.length > 0) {
                await chrome.storage.local.set({ sitesConfig: freshConfig, timestamp: now });
            } else {
                console.warn('Blocked attempt to cache empty sitesConfig.');
            }

            return freshConfig;
        }

        console.log('Using cached sitesConfig.');
        return sitesConfig;
    } catch (err) {
        console.error('Fatal error in getSitesConfig:', err);
        return [];
    }
}

self.addEventListener('install', event => {
    console.log('Service Worker installing.');
    self.skipWaiting();
    event.waitUntil(
        (async () => {
            await loadConfig();
            configLoaded = true;
            await getSitesConfig(); // Pre-fetch and store sitesConfig
            console.log('Initial sitesConfig cached.');
        })()
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker activated.');
    event.waitUntil(self.clients.claim());
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSitesConfig') {
        getSitesConfig()
            .then(sitesConfig => {
                sendResponse({ sitesConfig });
            })
            .catch(error => {
                console.error('Error sending sitesConfig:', error);
                sendResponse({ error: error.message });
            });
        return true;
    } else if (request.action === 'getXrpAddress') {
        const nftId = request.nftId;
        getNftOwner(nftId)
            .then((xrpAddress) => {
                console.log('Found XRP address:', xrpAddress);
                sendResponse({ xrpAddress });
            })
            .catch((error) => {
                console.error('Error getting XRP address:', error);
                sendResponse({ error: error.message });
            });
        return true;
    }
});

async function getNftOwner(nftId) {
    console.log('Connecting to XRP Ledger...');
    const client = new Client(XRPL_WS_URL);
    await client.connect();
    console.log('Connected to XRP Ledger');
    try {
        console.log('Requesting NFT info for ID:', nftId);
        const response = await client.request({
            command: 'nft_info',
            nft_id: nftId
        });
        console.log('NFT info response:', response);
        const xrpAddress = response.result.owner;
        console.log('xrpAddress:', xrpAddress);
        return xrpAddress;
    } catch (error) {
        console.error('Error in client request:', error);
        throw error;
    } finally {
        await client.disconnect();
        console.log('Disconnected from XRP Ledger');
    }
}

chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: "sendMessage",
        title: chrome.i18n.getMessage("messageWalletTitle"),
        contexts: ["selection", "link"]
    });
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

async function checkAndSendURL(tab) {
    console.log('Checking URL:', tab.url);
    const sitesConfig = await getSitesConfig();
    const urlExists = sitesConfig.some(site => tab.url.startsWith(site.url));
    if (!urlExists) {
        console.log('URL does not exist, sending to server...');
        const data = { url: tab.url };
        const result = await fetch(SAVE_NEW_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (result.ok) {
            console.log('URL sent to server successfully.');
        } else {
            console.error('Failed to send URL to server.');
        }
    } else {
        console.log('URL already exists in the local file.');
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