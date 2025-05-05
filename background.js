let config = null;
const EXPIRATION_TIME_MS = 60 * 60 * 1000; // 1 hour

function getHeaders() {
  const headers = new Headers();
  headers.append('x-svc-call', "4x9f3b8c1d6e2f709a5b4c3e8d1f6x2b");
  return headers;
}

async function loadConfig() {
  try {
    const response = await fetch(chrome.runtime.getURL('config.json'));
    if (!response.ok) {
      throw new Error(`Failed to fetch config.json: ${response.statusText}`);
    }
    config = await response.json();
    console.log('Config loaded successfully:', config);
    return config;
  } catch (error) {
    console.error('Failed to load config:', error);
    throw error;
  }
}

async function getSitesConfig() {
  if (!config) {
    await loadConfig();
  }
  const CACHE_KEY = config.CACHE_NAME; // sites-config-cache
  const CACHE_TIMESTAMP_KEY = `${config.CACHE_NAME}-timestamp`;

  try {
    const cachedData = await chrome.storage.local.get([CACHE_KEY, CACHE_TIMESTAMP_KEY]);
    const now = Date.now();

    if (cachedData[CACHE_KEY] && cachedData[CACHE_KEY].length > 0 && cachedData[CACHE_TIMESTAMP_KEY]) {
      if (now - cachedData[CACHE_TIMESTAMP_KEY] < EXPIRATION_TIME_MS) {
        // Check LAST_MODIFIED endpoint
        try {
          const lastModifiedResponse = await fetch(`${config.BASE_URL}${config.ENDPOINTS.LAST_MODIFIED}`, {
            method: 'GET',
            headers: getHeaders()
          });
          if (!lastModifiedResponse.ok) {
            const text = await lastModifiedResponse.text();
            throw new Error(`Failed to fetch last modified: ${lastModifiedResponse.status}, ${text}`);
          }
          const { lastModified } = await lastModifiedResponse.json();
          if (!lastModified || lastModified <= cachedData[CACHE_TIMESTAMP_KEY]) {
            console.log('Returning cached sitesConfig (not modified)');
            return cachedData[CACHE_KEY];
          }
        } catch (error) {
          console.warn('Failed to check last modified, using cached data:', error.message);
          return cachedData[CACHE_KEY];
        }
      }
    }

    // Fetch from API
    console.log('Fetching sitesConfig from API');
    const response = await fetch(`${config.BASE_URL}${config.ENDPOINTS.SITES_CONFIG}?t=${Date.now()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to fetch sitesConfig: ${response.status}, ${text}`);
    }
    const data = await response.json();
    await chrome.storage.local.set({
      [CACHE_KEY]: data,
      [CACHE_TIMESTAMP_KEY]: now
    });
    console.log('Fetched and cached sitesConfig:', data);
    return data;
  } catch (error) {
    console.warn('Failed to fetch sitesConfig, using cached data:', error.message);
    const cachedData = await chrome.storage.local.get(CACHE_KEY);
    return cachedData[CACHE_KEY] || [];
  }
}

async function getThemes() {
  if (!config) {
    await loadConfig();
  }
  try {
    const response = await fetch(`${config.BASE_URL}${config.ENDPOINTS.THEMES}`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to fetch themes: ${response.status}, ${text}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch themes:', error);
    throw error;
  }
}

async function checkAndSendURL(tab) {
  if (!config) {
    await loadConfig();
  }
  try {
    const sitesConfig = await getSitesConfig();
    const urlExists = sitesConfig.some(site => tab.url.startsWith(site.url));
    if (!urlExists) {
      console.log('URL does not exist, sending to server:', tab.url);
      const data = { url: tab.url };
      const headers = getHeaders();
      headers.append('Content-Type', 'application/json');
      const response = await fetch(`${config.BASE_URL}${config.ENDPOINTS.SAVE_NEW}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to send URL: ${response.status}, ${text}`);
      }
      console.log('URL sent to server successfully');
    } else {
      console.log('URL already exists in sitesConfig:', tab.url);
    }
  } catch (error) {
    console.error('Error in checkAndSendURL:', error);
  }
}

async function getNftOwner(nftId) {
  if (!config) {
    await loadConfig();
  }
  try {
    const response = await fetch(`${config.BASE_URL}${config.ENDPOINTS.GET_NFT_OWNER}?nftId=${nftId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to get NFT owner: ${response.status}, ${text}`);
    }
    const data = await response.json();
    return data.owner;
  } catch (error) {
    console.error('Failed to get NFT owner:', error);
    throw error;
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
        sendResponse({ error: error.message, sitesConfig: [] });
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
  } else if (request.action === 'getConfig') {
    if (!config) {
      loadConfig()
        .then(() => {
          sendResponse({
            BASE_URL: config.BASE_URL,
            ENDPOINTS: config.ENDPOINTS,
            SERVICE_VAL: config.SERVICE_VAL
          });
        })
        .catch(error => {
          console.error('getConfig error:', error);
          sendResponse({ error: error.message });
        });
    } else {
      sendResponse({
        BASE_URL: config.BASE_URL,
        ENDPOINTS: config.ENDPOINTS,
        SERVICE_VAL: config.SERVICE_VAL
      });
    }
    return true;
  } else if (request.action === 'getThemes') {
    getThemes()
      .then(themes => sendResponse({ themes }))
      .catch(error => {
        console.error('getThemes error:', error);
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
  getSitesConfig().catch(error => {
    console.error('Failed to fetch sitesConfig on install:', error);
  });

  // Open the options.html page upon installation
  chrome.tabs.create({ url: chrome.runtime.getURL("options.html") });
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