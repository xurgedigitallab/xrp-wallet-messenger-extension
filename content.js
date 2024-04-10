function findXRPAddresses(text) {
  // Regular expression to match XRP wallet addresses
  const xrpRegex = /r[1-9A-HJ-NP-Za-km-z]{24,34}/g;
  

  return text.match(xrpRegex);

}

function scanForWalletAddresses() {
  const allText = document.body.innerText;
  const addresses = findXRPAddresses(allText);
  // Process addresses found
}

// Scan for addresses in tooltips
document.addEventListener('mouseover', function(event) {
  let tooltipText = event.target.getAttribute('title');
  if (tooltipText) {
    const addresses = findXRPAddresses(tooltipText);
    // Process addresses found
  }
});
//scan for address in tooltips If the tooltip is 
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('title')) {
          const tooltipText = node.getAttribute('title');
          console.log('lol',tooltipText);
          if (tooltipText) {
            const addresses = findXRPAddresses(tooltipText);
            // Process addresses found
          }
        }
      });
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
  
  document.addEventListener('mouseover', function(event) {
    const computedStyle = window.getComputedStyle(event.target, '::before');
    // Extract content from computedStyle if possible
    const content = computedStyle.content;
    if (content) {
        
      const addresses = findXRPAddresses(content);
      // Process addresses found
    }
  });
  
  function processElementForXRPAddress(element) {
    // Get the title attribute of the element
    const tooltipText = element.getAttribute('title');
    
    if (tooltipText) {
      // If there's a title attribute, pass its content to findXRPAddresses
      const addresses = findXRPAddresses(tooltipText);
      // Process addresses found, you can add your logic here
      //pass addresses to background.js
      
      console.log(addresses);
    }
  }
  
  // Add an event listener to document to catch all mouseover events
  document.addEventListener('mouseover', function(event) {
    // Check if the target of the mouseover event is an image with a class 'avatar-sm'
    if (event.target.tagName === 'IMG' && event.target.classList.contains('avatar-sm')) {
      // If so, pass the image element to the processing function
      processElementForXRPAddress(event.target);
    }
  });
  
  document.addEventListener('contextmenu', function(event) {
    let targetElement = event.target;
    let xrpAddress = findXRPAddressInAttributes(targetElement);

    if (xrpAddress) {
        chrome.runtime.sendMessage({ type: 'rightClickWithXRPAddress', address: xrpAddress });
    }
});

function findXRPAddressInAttributes(element) {
    // Check common attributes that might contain an XRP address
    const attributesToCheck = ['href', 'src', 'data', 'title', 'alt'];
    
    for (let attr of attributesToCheck) {
        if (element.hasAttribute(attr)) {
            let potentialAddress = element.getAttribute(attr);
            let addresses = findXRPAddresses(potentialAddress);
            if (addresses && addresses.length > 0) {
                return addresses[0]; // Return the first found address
            }
        }
    }
    return null; // Return null if no address is found
}

scanForWalletAddresses();
