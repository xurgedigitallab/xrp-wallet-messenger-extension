import { Client } from 'xrpl';
// console.log('XRPL Client:', Client);

let XRPL_WS_URL;

// Fetch config from local file
async function loadConfig() {
    try {
        const response = await fetch(chrome.runtime.getURL('config.json'));
        const config = await response.json();
        XRPL_WS_URL = config.XRPL_WS_URL;
        console.log('Config loaded:', config);
    } catch (error) {
        console.error('Failed to load config:', error);
    }
}

self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');
    self.skipWaiting();
    event.waitUntil(
        (async () => {
            try {
                await loadConfig(); // Load config before caching
            } catch (error) {
                console.error('Failed to load sitesConfig.json:', error);
            }
        })()
    );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating.');
    event.waitUntil(self.clients.claim());
});

// Listen for messages sent from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received message:', request);
    if (request.action === 'getXrpAddress') {
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
    } else {
        console.error('Unknown action:', request.action);
        sendResponse({ error: 'Unknown action' });
    }
    console.log('Returning true to keep the message channel open.');
    return true;
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
            // Construct the new URL using the extracted wallet address.
            const newURL = `https://app.textrp.io/#/user/@${walletAddress}:synapse.textrp.io`;
            chrome.tabs.create({ url: newURL }); // Open the constructed URL in a new tab.
        }
    }
});

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
