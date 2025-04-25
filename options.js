document.addEventListener('DOMContentLoaded', async () => {
  const select = document.getElementById('color-select');
  const saveButton = document.getElementById('save-button');
  const feedbackButton = document.getElementById('feedbackButton');
  const feedbackModal = document.getElementById('feedbackModal');
  const closeModalButton = document.getElementById('closeModal');
  const cancelFeedbackButton = document.getElementById('cancelFeedback');
  const submitFeedbackButton = document.getElementById('submitFeedback');
  const feedbackText = document.getElementById('feedbackText');

  // Fetch config from background script
  let config = {};
  try {
    config = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'getConfig' }, response => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (typeof response === 'undefined') {
          reject(new Error('No response received from background script'));
          return;
        }
        if (response.error) {
          reject(new Error(response.error));
          return;
        }
        resolve(response);
      });
    });
  } catch (error) {
    console.error('Error fetching config:', error.message);
    feedbackButton.disabled = true; // Disable feedback button if config fails
    alert('Failed to load configuration. Feedback submission is disabled.');
  }

  // Generate or retrieve session ID
  let sessionId = await new Promise(resolve => {
    chrome.storage.local.get('sessionId', result => {
      if (result.sessionId) {
        resolve(result.sessionId);
      } else {
        // Fallback to random string if crypto.randomUUID is unavailable
        const newSessionId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
        chrome.storage.local.set({ sessionId: newSessionId }, () => {
          resolve(newSessionId);
        });
      }
    });
  });

  // Fetch themes from background script
  chrome.runtime.sendMessage({ action: 'getThemes' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error sending getThemes message:', chrome.runtime.lastError.message);
      return;
    }
    if (typeof response === 'undefined') {
      console.error('No response received for getThemes');
      return;
    }
    if (response.error) {
      console.error('Error fetching themes:', response.error);
    } else {
      // Handle themes as array directly or from response.themes
      const themes = Array.isArray(response) ? response : response.themes || [];
      if (themes.length > 0) {
        themes.forEach(theme => {
          const existingOption = Array.from(select.options).find(opt => opt.value === theme.background);
          if (!existingOption) {
            const option = document.createElement('option');
            option.value = theme.background;
            option.setAttribute('data-text', theme.text || '');
            option.setAttribute('data-hover', theme.hover || '');
            option.setAttribute('data-border-radius', theme.borderRadius || '');
            option.setAttribute('data-border', theme.border || '');
            option.setAttribute('data-font-size', theme.fontSize || '');
            option.setAttribute('data-font-style', theme.fontStyle || '');
            option.setAttribute('data-text-transform', theme.textTransform || '');
            option.setAttribute('data-text-decoration', theme.textDecoration || '');
            option.textContent = theme.name || 'Unnamed Theme';
            select.appendChild(option);
          } else {
            existingOption.setAttribute('data-text', theme.text || '');
            existingOption.setAttribute('data-hover', theme.hover || '');
            existingOption.setAttribute('data-border-radius', theme.borderRadius || '');
            existingOption.setAttribute('data-border', theme.border || '');
            existingOption.setAttribute('data-font-size', theme.fontSize || '');
            existingOption.setAttribute('data-font-style', theme.fontStyle || '');
            existingOption.setAttribute('data-text-transform', theme.textTransform || '');
            existingOption.setAttribute('data-text-decoration', theme.textDecoration || '');
            existingOption.textContent = theme.name || 'Unnamed Theme';
          }
        });
      }

      // Load saved theme
      chrome.storage.sync.get('buttonStyles', (result) => {
        if (result.buttonStyles && result.buttonStyles.background) {
          select.value = result.buttonStyles.background;
        }
      });
    }
  });

  // Save theme
  saveButton.addEventListener('click', () => {
    const selectedOption = select.options[select.selectedIndex];
    const buttonStyles = {
      background: select.value,
      text: selectedOption.getAttribute('data-text') || null,
      hover: selectedOption.getAttribute('data-hover') || null,
      borderRadius: selectedOption.getAttribute('data-border-radius') || null,
      border: selectedOption.getAttribute('data-border') || null,
      fontSize: selectedOption.getAttribute('data-font-size') || null,
      fontStyle: selectedOption.getAttribute('data-font-style') || null,
      textTransform: selectedOption.getAttribute('data-text-transform') || null,
      textDecoration: selectedOption.getAttribute('data-text-decoration') || null
    };
    chrome.storage.sync.set({ buttonStyles }, () => {
      // console.log('Saved button styles:', buttonStyles);
      alert('Theme saved successfully');
    });
  });

  // Feedback modal handlers
  function openModal() {
    feedbackModal.style.display = 'flex';
    feedbackText.focus();
  }

  function closeModal() {
    feedbackModal.style.display = 'none';
    feedbackText.value = '';
  }

  feedbackButton.addEventListener('click', openModal);
  closeModalButton.addEventListener('click', closeModal);
  cancelFeedbackButton.addEventListener('click', closeModal);

  // Close modal when clicking outside
  feedbackModal.addEventListener('click', (e) => {
    if (e.target === feedbackModal) {
      closeModal();
    }
  });

  // Submit feedback
  submitFeedbackButton.addEventListener('click', async () => {
    const message = feedbackText.value.trim();
    if (!message) {
      alert('Please enter feedback before submitting.');
      return;
    }

    if (!config.BASE_URL || !config.ENDPOINTS || !config.SERVICE_VAL) {
      alert('Configuration not loaded. Feedback submission is disabled.');
      return;
    }

    const feedbackData = {
      message,
      client: {
        userAgent: navigator.userAgent,
        extensionVersion: chrome.runtime.getManifest().version
      },
      session: {
        sessionId,
        timestamp: new Date().toISOString()
      }
    };

    try {
      const headers = new Headers();
      headers.append('x-svc-call', config.SERVICE_VAL);
      headers.append('Content-Type', 'application/json');

      const response = await fetch(`${config.BASE_URL}${config.ENDPOINTS.FEEDBACK}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(feedbackData)
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${text}`);
      }

      const data = await response.json();
      alert(`${data.message} at ${data.timestamp}`);
      closeModal();
    } catch (error) {
      console.error('Failed to submit feedback:', error.message);
      alert('Failed to submit feedback. Please try again later.');
    }
  });
});