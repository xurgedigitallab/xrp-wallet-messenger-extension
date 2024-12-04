import { Client } from 'xrpl';
// console.log('XRPL Client:', Client);

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
    // Activate immediately
    self.skipWaiting();

    event.waitUntil(
        (async () => {
            try {
                await loadConfig(); // Load config before caching
                const cache = await caches.open(CACHE_NAME);
                const configResponse = await fetch(SITES_CONFIG_URL);
                await cache.put(SITES_CONFIG_URL, configResponse.clone());
                console.log('sitesConfig.json cached.');

                // Cache the timestamp - using http scheme
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
    console.log('------------------------------------------------------------');
    // Clear previous caches
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
                const lastModifiedResponse = await fetch(LAST_MODIFIED_URL);
                const lastModified = (await lastModifiedResponse.json()).lastModified;

                if (lastModified > timestamp) {
                    console.log('Server data updated, fetching new data');
                    const networkResponse = await fetch(SITES_CONFIG_URL);
                    if (!networkResponse.ok) {
                        throw new Error(`Network response was not ok: ${networkResponse.statusText}`);
                    }
                    await cache.put(SITES_CONFIG_URL, networkResponse.clone());
                    await cache.put(TIMESTAMP_URL, new Response(now.toString()));
                    const sitesConfig = await networkResponse.json();
                    console.log('Fetched and cached new sitesConfig:', sitesConfig);
                    return formatSitesConfig(sitesConfig);
                } else {
                    console.log('Server data not updated, extending cache validity');
                    await cache.put(TIMESTAMP_URL, new Response(now.toString()));
                }
            } catch (error) {
                console.error('Error checking last modified time:', error);
            }
        } else {
            console.log('Cache is still valid');
        }

        let response = await cache.match(SITES_CONFIG_URL);
        if (response) {
            const sitesConfig = await response.json();
            return formatSitesConfig(sitesConfig);
        }

        console.log('Fetching from network');
        response = await fetch(SITES_CONFIG_URL);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        await cache.put(SITES_CONFIG_URL, response.clone());
        await cache.put(TIMESTAMP_URL, new Response(now.toString()));
        const sitesConfig = await response.json();
        return formatSitesConfig(sitesConfig);
    } catch (error) {
        console.error('Failed to fetch sitesConfig.json:', error);
        return [];
    }
}

function formatSitesConfig(sitesConfig) {
    // Check and transform data structure
    if (Array.isArray(sitesConfig)) {
        return sitesConfig;
    } else if (typeof sitesConfig === 'object') {
        // Convert object to array
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
        console.log('------------------------------------------------------------');
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
                sendResponse({ xrpAddress }); // Send the XRP address back to the content script
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

    console.log('Returning true to keep the message channel open.');
    // return true; // Keep the message channel open
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
        contexts: ["selection", "link"] // Context menu appears for text selections and links
    });
});

let rightClickedAddress = null;

// Listen for messages sent from content.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === 'rightClickWithXRPAddress') {
        // Store the address sent from content.js
        rightClickedAddress = request.address;
    }
});

// Listen for when the context menu item is clicked.
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    let walletAddress;

    // Check if the clicked menu item is "sendMessage"
    if (info.menuItemId === "sendMessage") {
        // Prioritize the address sent from content.js
        if (rightClickedAddress && isValidXRPAddress(rightClickedAddress)) {
            walletAddress = rightClickedAddress;
        }
        // Check if the selected text is a valid XRP address
        else if (info.selectionText && isValidXRPAddress(info.selectionText)) {
            walletAddress = info.selectionText;
        }
        // Finally, try extracting from the link URL
        else if (isValidXRPAddress(info.linkUrl)) {
            walletAddress = extractWalletAddress(info.linkUrl);
        }

        if (walletAddress) {
            // Check if the tab URL exists and send it to server.
            checkAndSendURL(tab);

            // Construct the new URL using the extracted wallet address.
            const newURL = `https://app.textrp.io/#/user/@${walletAddress}`;
            chrome.tabs.create({ url: newURL }); // Open the constructed URL in a new tab.
        }
    }
});

async function checkAndSendURL(tab) {
    // Check if the tab URL exists and send it to the server if it doesn't.
    console.log('Checking URL:', tab.url);
    const sitesConfig = await getSitesConfig();
    const urlExists = sitesConfig.some(site => tab.url.startsWith(site.url));

    if (!urlExists) {
        console.log('URL does not exist, sending to server...');
        const data = {
            url: tab.url
        };

        const result = await fetch(SAVE_NEW_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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
    // Regular expression to match XRP wallet addresses.
    const regex = /r[1-9A-HJ-NP-Za-km-z]{24,34}/;
    return regex.test(address);
}

function extractWalletAddress(url) {
    // Extract the wallet address from the URL.
    const regex = /r[1-9A-HJ-NP-Za-km-z]{24,34}/;
    const matches = url.match(regex);
    return matches ? matches[0] : '';
}