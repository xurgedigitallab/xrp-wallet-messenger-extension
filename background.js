import { Client } from 'xrpl';

let XRPL_WS_URL;
let CACHE_NAME;
let SITES_CONFIG_URL;
let LAST_MODIFIED_URL;
let TIMESTAMP_URL;
let SAVE_NEW_URL;

// Fetch config from local file
async function loadConfig() {
    try {
        const response = await fetch(chrome.runtime.getURL('config.json'));
        const config = await response.json();
        XRPL_WS_URL = config.XRPL_WS_URL;
        CACHE_NAME = config.CACHE_NAME;
        SITES_CONFIG_URL = config.SITES_CONFIG_URL;
        LAST_MODIFIED_URL = config.LAST_MODIFIED_URL;
        TIMESTAMP_URL = config.TIMESTAMP_URL;
        SAVE_NEW_URL = config.SAVE_NEW_URL;
        console.log('Config loaded:', config);
    } catch (error) {
        console.error('Failed to load config:', error);
    }
}

// Register the service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/background.bundle.js').then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
    }).catch(error => {
        console.error('Service Worker registration failed:', error);
    });
}

// Install the service worker
self.addEventListener('install', event => {
    console.log('Service Worker installing.');
    self.skipWaiting();
    
    event.waitUntil(
        (async () => {
            try {
                await loadConfig();
                const cache = await caches.open(CACHE_NAME);
                const configResponse = await fetch(SITES_CONFIG_URL);
                await cache.put(SITES_CONFIG_URL, configResponse.clone());
                console.log('sitesConfig.json cached.');

                await cache.put(
                    new Request(TIMESTAMP_URL), 
                    new Response(Date.now().toString())
                );
                console.log('Timestamp cached.');
            } catch (error) {
                console.error('Failed to cache sitesConfig.json:', error);
            }
        })()
    );
});

// Activate the service worker
self.addEventListener('activate', event => {
    console.log('Service Worker activating.');
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
        ])
    );
});

async function fetchWithRetry(url, options = {}, retries = 3, backoff = 3000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
            }
            return response;
        } catch (error) {
            console.error(`Fetch attempt ${i + 1} failed: ${error.message}`);
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, backoff * (i + 1)));
            } else {
                console.error(`All fetch attempts failed for ${url}`);
                return null; // Return null if all retries fail
            }
        }
    }
}

async function getSitesConfig() {
    const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    try {
        const cache = await caches.open(CACHE_NAME);
        console.log('Opened cache');

        const timestampResponse = await cache.match(TIMESTAMP_URL);
        const timestamp = timestampResponse ? parseInt(await timestampResponse.text()) : 0;
        const now = Date.now();

        if (now - timestamp > CACHE_EXPIRATION_MS) {
            console.log('Cache expired, checking server for updates');
            try {
                console.log('Fetching last modified time from:', LAST_MODIFIED_URL);
                const lastModifiedResponse = await fetchWithRetry(LAST_MODIFIED_URL);
                if (lastModifiedResponse) {
                    const lastModifiedData = await lastModifiedResponse.json();
                    const lastModified = lastModifiedData.lastModified;

                    if (lastModified > timestamp) {
                        console.log('Server data updated, fetching new data');
                        const networkResponse = await fetchWithRetry(SITES_CONFIG_URL);
                        if (networkResponse) {
                            await cache.put(SITES_CONFIG_URL, networkResponse.clone());
                            await cache.put(TIMESTAMP_URL, new Response(now.toString()));
                            const sitesConfig = await networkResponse.json();
                            return formatSitesConfig(sitesConfig);
                        } else {
                            console.error('Failed to fetch new sitesConfig from network.');
                        }
                    } else {
                        console.log('Server data not updated, extending cache validity');
                        await cache.put(TIMESTAMP_URL, new Response(now.toString()));
                    }
                } else {
                    console.error('Failed to fetch last modified time.');
                }
            } catch (error) {
                console.error('Error checking last modified time:', error);
            }
        }

        let response = await cache.match(SITES_CONFIG_URL);
        if (response) {
            const sitesConfig = await response.json();
            return formatSitesConfig(sitesConfig);
        } else {
            console.error('No cached sitesConfig available.');
            return [];
        }
    } catch (error) {
        console.error('Failed to fetch sitesConfig.json:', error);
        return [];
    }
}

function formatSitesConfig(sitesConfig) {
    if (Array.isArray(sitesConfig)) {
        return sitesConfig;
    } else if (typeof sitesConfig === 'object') {
        return Object.values(sitesConfig);
    } else {
        console.error('Unexpected sitesConfig format:', sitesConfig);
        return [];
    }
}

// Listen for messages sent from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received message:', request);

    if (request.action === 'getSitesConfig') {
        console.log('Received getSitesConfig message from content.js');
        getSitesConfig().then(sitesConfig => {
            sendResponse({ sitesConfig });
        }).catch(error => {
            sendResponse({ error: error.message });
        });
        return true; // Keep the message channel open
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
        return true; // Keep the message channel open
    } else {
        console.error('Unknown action:', request.action);
        sendResponse({ error: 'Unknown action' });
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

// Create the context menu item when the extension is installed or reloaded
chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: "sendMessage",
        title: chrome.i18n.getMessage("messageWalletTitle"),
        contexts: ["selection", "link"]
    });
});

let rightClickedAddress = null;

// Listen for messages sent from content.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === 'rightClickWithXRPAddress') {
        rightClickedAddress = request.address;
    }
});

// Listen for when the context menu item is clicked.
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
            const newURL = `https://app.textrp.io/#/user/@${walletAddress}`;
            chrome.tabs.create({ url: newURL });
        }
    }
});

async function checkAndSendURL(tab) {
    console.log('Checking URL:', tab.url);
    try {
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
    } catch (error) {
        console.error('Error checking and sending URL:', error);
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