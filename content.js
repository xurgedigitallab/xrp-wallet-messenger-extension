async function loadSitesConfig() {
  const response = await fetch(chrome.runtime.getURL('sitesConfig.json'));
  const sites = await response.json();
  return sites;
}

function findXRPAddresses(text) {
  const xrpRegex = /r[1-9A-HJ-NP-Za-km-z]{24,34}/g;
  return text.match(xrpRegex);
}

function findXRPAddressInNode(node) {
  if (node) {
    // Search in attributes of the current node
    for (let i = 0; i < node.attributes.length; i++) {
      const attribute = node.attributes[i];
      const value = attribute.value;
      if (attribute.name === 'href') {
        if (value.includes('/profile/')) {
          const xrpAddress = value.split('/profile/')[1];
          console.log('Found XRP address in href:', xrpAddress);
          return xrpAddress;
        } else {
          const xrpAddress = findXRPAddresses(value);
          if (xrpAddress) {
            console.log('Found XRP address in href attribute:', attribute.name, 'with value:', value);
            return xrpAddress[0];
          }
        }
      }
      const xrpAddress = findXRPAddresses(value);
      if (xrpAddress) {
        console.log('Found XRP address in attribute:', attribute.name, 'with value:', value);
        return xrpAddress[0];
      }
    }

    // Search in the text content of the current node
    const xrpAddress = findXRPAddresses(node.textContent);
    if (xrpAddress) {
      console.log('Found XRP address in text content:', node.textContent);
      return xrpAddress[0];
    }

    // Recursively search in child nodes
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

  // Set button styles
  button.style.backgroundColor = '#0077db';
  button.style.color = '#ffffff';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.gap = '0.4em';
  button.style.padding = '8px 16px';
  button.style.margin = '10px 0';
  button.style.border = 'none';
  button.style.borderRadius = '5px';
  button.style.cursor = 'pointer';
  button.style.flex = '1'; // Allow the button to flex

  // Create and append the SVG icon
  const icon = document.createElement('img');
  icon.src = chrome.runtime.getURL('icons/button_icon.svg');
  icon.classList.add('img');
  icon.style.width = '24px'; // Set fixed width for the icon
  icon.style.height = '24px'; // Set fixed height for the icon
  icon.style.border = 'none'; // Ensure no border
  icon.style.borderRadius = '0'; // Ensure no border radius
  button.appendChild(icon);

  // Add text span
  const textSpan = document.createElement('span');
  textSpan.classList.add('text');
  textSpan.textContent = buttonText;
  button.appendChild(textSpan);

  // Add click event to open a new tab
  button.addEventListener('click', () => {
    const cleanAddress = xrpAddress.replace(/[^a-zA-Z0-9]/g, '');
    const url = `https://app.textrp.io/#/user/@${cleanAddress}:synapse.textrp.io`;
    window.open(url, '_blank');
  });

  return button;
}

function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .contact-nft-owner-button {
      transition: background-color 0.2s, box-shadow 0.2s;
      width: 100%; /* Ensure the button takes the full width of its container */
    }
    .contact-nft-owner-button:hover {
      background-color: #005bb5 !important; /* Darker shade on hover */
    }
    .img {
      width: 24px; /* Set fixed width */
      height: 24px; /* Set fixed height */
      object-fit: contain; /* Ensure image fits within the set dimensions */
      border: none; /* Ensure no border */
      border-radius: 0; /* Ensure no border radius */
    }
    .text {
      font-weight: 600;
      line-height: 1; /* Ensure text is vertically centered */
    }
  `;
  document.head.appendChild(style);
}

async function insertButton(site, button, siteUrl) {
  // Debugging: Log all potential insert containers
  const potentialContainers = document.querySelectorAll(site.insertSelector);
  console.log('Potential insert containers:', potentialContainers);

  const insertContainer = await waitForElement(site.insertSelector);
  console.log('Found insert container:', insertContainer);

  // Remove the button if it already exists
  const existingButton = insertContainer.querySelector('.contact-nft-owner-button');
  if (existingButton) {
    existingButton.remove();
  }

  if (!insertContainer) {
    console.error('Selector not found:', site.insertSelector);
    return;
  }

  // For specific sites, insert the button using different methods.
  if (siteUrl === 'https://xrplexplorer.com') {
    insertContainer.insertAdjacentElement('afterend', button);
  } else if (siteUrl === 'https://neefty.io') {
    insertContainer.insertAdjacentElement('afterend', button);
  } else if (siteUrl === 'https://xmagnetic.org') {
    insertContainer.insertAdjacentElement('afterend', button);
  } else {
    // By default, insert as the last child
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

async function insertButtonForSite(site) {
  console.log(`Checking URL: ${window.location.href}`);

  try {
    const container = await waitForElement(site.selector);
    console.log('Found Owner address container:', container);

    let xrpAddress = null;
    let nftId = null;
    if (site.url === 'https://app.zerpmon.world') {
      xrpAddress = window.location.pathname.split('/').pop();
      console.log('Extracted XRP address from URL:', xrpAddress);
    } else if (site.url === 'https://sologenic.org') {
      nftId = window.location.pathname.split('/').pop().split('?')[0];
      console.log('found nftId', nftId);

      xrpAddress = await getXrpAddress(nftId);
      console.log('found xrpAddress', xrpAddress);
    } else {
      xrpAddress = findXRPAddressInNode(container);
    }

    if (xrpAddress) {
      console.log('Found XRP address:', xrpAddress);

      // Check if the specific "Chat with player" button already exists
      let buttonText = 'Chat with NFT owner';
      if (site.type === 'game') {
        buttonText = 'Chat with player';
      }
      if (site.type === 'wallet') {
        buttonText = 'Chat with wallet';
      }
      if (site.type === 'token') {
        buttonText = 'chat with token issuer';
      }

      const button = createButton(xrpAddress, buttonText);
      await insertButton(site, button, site.url);
      console.log('Button inserted:', button);
    } else {
      console.log('XRP address not found in node:', site.selector, 'on URL:', site.url);
    }
  } catch (error) {
    console.error(error.message);
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
    }, 500); // Adjust debounce time as needed
  });

  const targetNode = document.querySelector('body'); // Observe changes on the entire body
  observer.observe(targetNode, { childList: true, subtree: true });
  console.log('MutationObserver set up for dynamic content.');
}

async function checkAndInsertButton() {
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

// Step-by-step debugging for Sologenic.org
async function debugSelectors() {
  const selectors = [
    '#content-scroll',
    '#content-scroll > div',
    '#content-scroll > div > div.nft-container',
    '#content-scroll > div > div.nft-container > div.left.top',
    '#content-scroll > div > div.nft-container > div.left.top > div'
  ];

  for (const selector of selectors) {
    try {
      const element = await waitForElement(selector);
      console.log(`Found element for selector: ${selector}`, element);
    } catch (error) {
      console.error(error.message);
      break; // Stop if any selector fails
    }
  }
}

window.addEventListener('load', () => {
  injectStyles();
  checkAndInsertButton();
  debugSelectors(); // Debugging for Sologenic.org
});

// Monitor URL changes and re-run checkAndInsertButton
let lastUrl = location.href;
new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    setTimeout(checkAndInsertButton, 1000); // Allow time for the new page to load
  }
}).observe(document, { subtree: true, childList: true });
