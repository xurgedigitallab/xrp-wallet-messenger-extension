// Create the context menu item when the extension is installed or reloaded
chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        id: "sendMessage",
        title: chrome.i18n.getMessage("messageWalletTitle"),
        contexts: ["selection", "link"] // Context menu appears for text selections and links
    });
});

let rightClickedAddress = null;

// Listen for messages sent from content.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'rightClickWithXRPAddress') {
        // Store the address sent from content.js
        rightClickedAddress = request.address;
    }
});

// Listen for when the context menu item is clicked.
chrome.contextMenus.onClicked.addListener(function(info, tab) {
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
