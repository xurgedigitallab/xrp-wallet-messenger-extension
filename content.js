let buttonStyles = {
  background: '#0077db',
  text: '#ffffff',
  hover: '#005bb5'
};

async function loadSitesConfig() {
  return new Promise((resolve, reject) => {
    console.log('Sending getSitesConfig message to background.js');
    chrome.runtime.sendMessage({ action: 'getSitesConfig' }, response => {
      if (response.error) {
        console.error('Error received from background.js:', response.error);
        reject(new Error(response.error));
      } else {
        console.log('Received sitesConfig from background.js');
        resolve(response.sitesConfig);
        console.log('Sites config:', response.sitesConfig);
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
        console.log('Found XRP address in href:', xrpAddress);
        return xrpAddress;
      } else if (attribute.name === 'href' && value.includes('/explorer/')) {
        const xrpAddress = value.split('/explorer/')[1];
        console.log('Found XRP address in href:', xrpAddress);
        return xrpAddress;
      }
      const xrpAddress = findXRPAddresses(value);
      if (xrpAddress) {
        console.log('Found XRP address in attribute:', attribute.name, 'with value:', value);
        return xrpAddress[0];
      }
    }
    const xrpAddress = findXRPAddresses(node.textContent);
    if (xrpAddress) {
      console.log('Found XRP address in text content:', node.textContent);
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
      console.log('Received response:', response);
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
  button.style.border = 'none';
  button.style.borderRadius = '5px';
  button.style.cursor = 'pointer';
  button.style.flex = '1';
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
  document.documentElement.style.setProperty('--button-background', buttonStyles.background);
  document.documentElement.style.setProperty('--button-text', buttonStyles.text);
  document.documentElement.style.setProperty('--button-hover', buttonStyles.hover);
}

function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .contact-nft-owner-button {
      background: linear-gradient(135deg, var(--button-background) 0%, var(--button-background) 40%, #ffffff 50%, var(--button-background) 60%, var(--button-background) 100%);
      background-size: 300%;
      background-repeat: no-repeat;
      background-position: 0px;
      color: var(--button-text);
      transition: background-color 0.2s, box-shadow 0.2s;
      width: 100%;
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
  console.log('Potential insert containers:', potentialContainers);
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
    console.log(`Primary insertSelector not found: ${site.insertSelector}`);
    if (site.secInsertSelector) {
      try {
        insertContainer = await waitForElement(site.secInsertSelector);
        console.log(`Secondary insertSelector not found: ${site.secInsertSelector}`);
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
    console.log('Existing button removed:', existingButton);
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
  console.log('Expression parts:', parts);
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
  console.log('Expression executed:', expression, 'Result:', currentObject);
  return currentObject;
}

async function insertButtonForSite(site) {
  console.log(`Checking URL: ${window.location.href}`);
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
      console.log('Extracting XRP address from URL:', site.addressInUrl);
      xrpAddress = parseAndExecuteExpression(site.addressInUrl);
      console.log('Extracted XRP address from URL:', xrpAddress);
      if (Array.isArray(xrpAddress)) {
        xrpAddress = findFirstXRPAddressInArray(xrpAddress);
      }
      console.log('Extracted XRP address from URL:', xrpAddress);
    } else if (site.addressInNftId) {
      if (site.addressInNftId === 'href') {
        const hrefContainer = await waitForElement(site.selector);
        console.log('Found href container:', hrefContainer);
        nftId = hrefContainer.href.split('/').pop();
        xrpAddress = await getXrpAddress(nftId);
        console.log('Found XRP address:', xrpAddress);
      } else {
        nftId = parseAndExecuteExpression(site.addressInNftId);
        console.log(`Extracted NFT ID: ${nftId}`);
        if (nftId) {
          nftId = String(nftId);
          xrpAddress = await getXrpAddress(nftId);
          console.log('Found XRP address:', xrpAddress);
        } else {
          console.error('NFT ID not found in URL path');
        }
      }
    } else if (site.noXRPAddressInPath && site.buttonExists) {
      try {
        container = await waitForElement(site.selector, 5000);
        console.log('Found Owner address container:', container);
        foundXRPAddress = findXRPAddresses(container.textContent);
        if (!foundXRPAddress) {
          throw new Error('XRP address not found in node:', site.selector, 'on URL:', site.url);
        }
        xrpAddress = findXRPAddressInNode(container);
      } catch (error) {
        console.error(`Primary selector not found or timed out: ${site.selector}`);
        secContainer = await waitForElement(site.secSelector, 5000);
        console.log('Found secondary Owner address container:', secContainer);
        xrpAddress = findXRPAddressInNode(secContainer);
      }
    } else {
      container = await waitForElement(site.selector);
      console.log('Found Owner address container:', container);
      xrpAddress = findXRPAddressInNode(container);
      console.log('Found XRP address:', xrpAddress);
    }
    if (xrpAddress) {
      console.log('Found XRP address:', xrpAddress);
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
          console.log('Existing button removed:', existingButton);
        }
      }
      const button = createButton(xrpAddress, buttonText);
      await insertButton(site, button, site.buttonAdjust);
      console.log('Button inserted:', button);
    } else {
      console.log('XRP address not found in node:', site.selector, 'on URL:', site.url);
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
          console.log('Detected new content:', mutation);
          insertButtonForSite(site);
        }
      });
    }, 500);
  });
  const targetNode = document.querySelector('body');
  observer.observe(targetNode, { childList: true, subtree: true });
  console.log('MutationObserver set up for dynamic content.');
}

async function checkAndInsertButton() {
  console.log('checkAndInsertButton called');
  const currentUrl = window.location.href;
  const sites = await loadSitesConfig();
  for (const site of sites) {
    if (currentUrl.startsWith(site.url)) {
      console.log(`Matching site found for URL: ${site.url}`);
      if (site.isDynamic) {
        observeDynamicContent(site);
      } else {
        insertButtonForSite(site);
      }
      break;
    }
  }
}

chrome.storage.sync.get('buttonColor', (result) => {
  if (result.buttonColor) {
    buttonStyles = result.buttonColor;
  }
  setButtonStyles();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.buttonColor) {
    buttonStyles = changes.buttonColor.newValue;
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
    console.log('URL changed:', currentUrl);
  }
}).observe(document, { subtree: true, childList: true });