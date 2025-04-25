let buttonStyles = {
  background: '#0077db',
  text: '#ffffff',
  hover: '#005bb5',
  borderRadius: null,
  border: null,
  fontSize: null,
  fontStyle: null,
  textTransform: null,
  textDecoration: null
};

async function loadSitesConfig() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: 'getSitesConfig' }, response => {
      if (response.error) {
        console.error('Error received from background.js:', response.error);
        reject(new Error(response.error));
      } else {
        resolve(response.sitesConfig);
      }
    });
  });
}

function findXRPAddresses(text) {
  const xrpRegex = /r[1-9A-HJ-NP-Za-km-z]{24,34}/g;
  return text.match(xrpRegex);
}

function findFirstXRPAddressInArray(array) {
  for (const text of array) {
    const addresses = findXRPAddresses(text);
    if (addresses && addresses.length > 0) {
      return addresses[0];
    }
  }
  return null;
}

function findXRPAddressInNode(node) {
  if (node) {
    for (let i = 0; i < node.attributes.length; i++) {
      const attribute = node.attributes[i];
      const value = attribute.value;
      if (attribute.name === 'href' && value.includes('/profile/')) {
        const xrpAddress = value.split('/profile/')[1];
        return xrpAddress;
      } else if (attribute.name === 'href' && value.includes('/explorer/')) {
        const xrpAddress = value.split('/explorer/')[1];
        return xrpAddress;
      }
      const xrpAddress = findXRPAddresses(value);
      if (xrpAddress) {
        return xrpAddress[0];
      }
    }
    const xrpAddress = findXRPAddresses(node.textContent);
    if (xrpAddress) {
      return xrpAddress[0];
    }
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      if (child.nodeType === Node.ELEMENT_NODE) {
        const result = findXRPAddressInNode(child);
        if (result) {
          return result;
        }
      }
    }
  }
  return null;
}

function getXrpAddress(nftId) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: 'getXrpAddress', nftId }, (response) => {
      if (response && response.error) {
        reject(response.error);
      } else if (response && response.xrpAddress) {
        resolve(response.xrpAddress);
      } else {
        reject('No valid response received.');
      }
    });
  });
}

function createButton(xrpAddress, buttonText) {
  const button = document.createElement('button');
  button.classList.add('contact-nft-owner-button');
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.gap = '0.4em';
  button.style.padding = '8px 16px';
  button.style.margin = '10px 0';
  button.style.border = buttonStyles.border || 'none'; // Explicitly set to 'none' if border is null
  button.style.borderRadius = buttonStyles.borderRadius || '5px';
  button.style.cursor = 'pointer';
  button.style.flex = '1';
  if (buttonStyles.fontSize) button.style.fontSize = buttonStyles.fontSize;
  if (buttonStyles.fontStyle) button.style.fontStyle = buttonStyles.fontStyle;
  if (buttonStyles.textTransform) button.style.textTransform = buttonStyles.textTransform;
  if (buttonStyles.textDecoration) button.style.textDecoration = buttonStyles.textDecoration;
  const icon = document.createElement('img');
  icon.src = chrome.runtime.getURL('icons/button_icon.svg');
  icon.classList.add('img');
  icon.style.width = '24px';
  icon.style.height = '24px';
  icon.style.border = 'none';
  icon.style.borderRadius = '0';
  button.appendChild(icon);
  const textSpan = document.createElement('span');
  textSpan.classList.add('text');
  textSpan.textContent = buttonText;
  button.appendChild(textSpan);
  button.addEventListener('click', () => {
    const cleanAddress = xrpAddress.replace(/[^a-zA-Z0-9]/g, '');
    const url = `https://app.textrp.io/#/user/@${cleanAddress}`;
    window.open(url, '_blank');
  });
  return button;
}

function setButtonStyles() {
  // Set required styles with fallbacks
  document.documentElement.style.setProperty('--button-background', buttonStyles.background || '#0077db');
  document.documentElement.style.setProperty('--button-text', buttonStyles.text || '#ffffff');
  document.documentElement.style.setProperty('--button-hover', buttonStyles.hover || '#005bb5');
  // Set optional styles, resetting to default if null
  document.documentElement.style.setProperty('--button-border-radius', buttonStyles.borderRadius || '5px');
  document.documentElement.style.setProperty('--button-border', buttonStyles.border || 'none');
  document.documentElement.style.setProperty('--button-font-size', buttonStyles.fontSize || 'inherit');
  document.documentElement.style.setProperty('--button-font-style', buttonStyles.fontStyle || 'normal');
  document.documentElement.style.setProperty('--button-text-transform', buttonStyles.textTransform || 'none');
  document.documentElement.style.setProperty('--button-text-decoration', buttonStyles.textDecoration || 'none');
}

function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .contact-nft-owner-button {
      background: linear-gradient(135deg, var(--button-background) 0%, var(--button-background) 40%, #ffffff 50%, var(--button-background) 60%, var(--button-background) 100%);
      backgroundfavorite_border_size: 300%;
      background-repeat: no-repeat;
      background-position: 0px;
      color: var(--button-text);
      transition: background-color 0.2s, box-shadow 0.2s;
      width: 100%;
      border: var(--button-border, none);
      border-radius: var(--button-border-radius, 5px);
      font-size: var(--button-font-size, inherit);
      font-style: var(--button-font-style, normal);
      text-transform: var(--button-text-transform, none);
      text-decoration: var(--button-text-decoration, none);
    }
    .contact-nft-owner-button:hover {
      background-color: var(--button-hover);
      animation: light 1s;
    }
    .img {
      width: 24px;
      height: 24px;
      object-fit: contain;
      border: none;
      border-radius: 0;
    }
    .text {
      font-weight: 600;
      line-height: 1;
    }
    @keyframes light {
      0% {
        background-position: -600px;
      }
      100% {
        background-position: 0px;
      }
    }
  `;
  document.head.appendChild(style);
}

async function insertButton(site, button, buttonAdjust) {
  const potentialContainers = document.querySelector(site.insertSelector);
  let insertContainer;
  try {
    if (site.pageLoadDelay) {
      insertContainer = await waitForElement(site.insertSelector, 1000);
    } else if (site.secInsertSelector && site.buttonExists) {
      if (potentialContainers) {
        insertContainer = await waitForElement(site.insertSelector);
      } else {
        insertContainer = await waitForElement(site.secInsertSelector);
      }
    } else {
      insertContainer = await waitForElement(site.insertSelector);
    }
  } catch (error) {
    if (site.secInsertSelector) {
      try {
        insertContainer = await waitForElement(site.secInsertSelector);
      } catch (secError) {
        console.error(`Both primary and secondary insertSelectors not found: ${site.insertSelector}, ${site.secInsertSelector}`);
        return;
      }
    } else {
      console.error(`Secondary insertSelector not provided and primary insertSelector not found: ${site.insertSelector}`);
      return;
    }
  }
  const existingButton = document.querySelector('.contact-nft-owner-button');
  if (existingButton) {
    existingButton.remove();
  }
  if (buttonAdjust) {
    insertContainer.insertAdjacentElement(buttonAdjust, button);
  } else {
    insertContainer.appendChild(button);
  }
}

function waitForElement(selector, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const intervalTime = 100;
    let timeElapsed = 0;
    const interval = setInterval(() => {
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(interval);
        resolve(element);
      } else if (timeElapsed > timeout) {
        clearInterval(interval);
        reject(new Error(`Element with selector "${selector}" not found within timeout period.`));
      }
      timeElapsed += intervalTime;
    }, intervalTime);
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseAndExecuteExpression(expression) {
  const parts = expression.match(/(\w+\(.*?\))|(\w+)/g);
  let currentObject = window;
  for (const part of parts) {
    const methodMatch = part.match(/(\w+)\(([^)]*)\)/);
    if (methodMatch) {
      const methodName = methodMatch[1];
      const args = methodMatch[2].split(',').map(arg => arg.trim().replace(/['"]/g, ''));
      currentObject = currentObject[methodName](...args);
    } else {
      currentObject = currentObject[part];
    }
  }
  return currentObject;
}

async function insertButtonForSite(site) {
  try {
    let container = null;
    let secContainer = null;
    let xrpAddress = null;
    let nftId = null;
    let foundXRPAddress = null;
    if (site.pageLoadDelay) {
      await delay(site.pageLoadDelay);
    }
    if (site.addressInUrl) {
      xrpAddress = parseAndExecuteExpression(site.addressInUrl);
      if (Array.isArray(xrpAddress)) {
        xrpAddress = findFirstXRPAddressInArray(xrpAddress);
      }
    } else if (site.addressInNftId) {
      if (site.addressInNftId === 'href') {
        const hrefContainer = await waitForElement(site.selector);
        nftId = hrefContainer.href.split('/').pop();
        xrpAddress = await getXrpAddress(nftId);
      } else {
        nftId = parseAndExecuteExpression(site.addressInNftId);
        if (nftId) {
          nftId = String(nftId);
          xrpAddress = await getXrpAddress(nftId);
        } else {
          console.error('NFT ID not found in URL path');
        }
      }
    } else if (site.noXRPAddressInPath && site.buttonExists) {
      try {
        container = await waitForElement(site.selector, 5000);
        foundXRPAddress = findXRPAddresses(container.textContent);
        if (!foundXRPAddress) {
          throw new Error('XRP address not found in node:', site.selector, 'on URL:', site.url);
        }
        xrpAddress = findXRPAddressInNode(container);
      } catch (error) {
        console.error(`Primary selector not found or timed out: ${site.selector}`);
        secContainer = await waitForElement(site.secSelector, 5000);
        xrpAddress = findXRPAddressInNode(secContainer);
      }
    } else {
      container = await waitForElement(site.selector);
      xrpAddress = findXRPAddressInNode(container);
    }
    if (xrpAddress) {
      let buttonText = null;
      if (site.localesOn) {
        if (site.type === 'nft') {
          buttonText = chrome.i18n.getMessage('buttonTextNFT');
        }
        if (site.type === 'game') {
          buttonText = chrome.i18n.getMessage('buttonTextGame');
        }
        if (site.type === 'wallet') {
          buttonText = chrome.i18n.getMessage('buttonTextWallet');
        }
        if (site.type === 'token') {
          buttonText = chrome.i18n.getMessage('buttonTextToken');
        }
      } else {
        if (site.type === 'nft') {
          buttonText = 'Chat with NFT owner';
        }
        if (site.type === 'game') {
          buttonText = 'Chat with player';
        }
        if (site.type === 'wallet') {
          buttonText = 'Chat with wallet';
        }
        if (site.type === 'token') {
          buttonText = "Chat with token creator's wallet";
        }
      }
      if (site.secInsertSelector && site.buttonExists) {
        const existingButton = document.querySelector('.contact-nft-owner-button');
        if (existingButton) {
          existingButton.remove();
        }
      }
      const button = createButton(xrpAddress, buttonText);
      await insertButton(site, button, site.buttonAdjust);
    }
  } catch (error) {
    if (error.message.includes('Extension context invalidated')) {
      console.warn('Extension context invalidated. Aborting operation.');
    } else {
      console.error(error.message);
    }
  }
}

let debounceTimer;
function observeDynamicContent(site) {
  const observer = new MutationObserver((mutations) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          insertButtonForSite(site);
        }
      });
    }, 500);
  });
  const targetNode = document.querySelector('body');
  observer.observe(targetNode, { childList: true, subtree: true });
}

async function checkAndInsertButton() {
  const currentUrl = window.location.href;
  const sites = await loadSitesConfig();
  for (const site of sites) {
    if (currentUrl.startsWith(site.url)) {
      if (site.isDynamic) {
        observeDynamicContent(site);
      } else {
        insertButtonForSite(site);
      }
      break;
    }
  }
}

// Load saved button styles on initialization
chrome.storage.sync.get('buttonStyles', (result) => {
  if (result.buttonStyles) {
    buttonStyles = { ...buttonStyles, ...result.buttonStyles };
    setButtonStyles();
  }
});

// Listen for changes to button styles
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.buttonStyles) {
    buttonStyles = { ...buttonStyles, ...changes.buttonStyles.newValue };
    setButtonStyles();
  }
});

window.addEventListener('load', () => {
  injectStyles();
  checkAndInsertButton();
});

let lastUrl = location.href;
new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    setTimeout(checkAndInsertButton, 1500);
  }
}).observe(document, { subtree: true, childList: true });