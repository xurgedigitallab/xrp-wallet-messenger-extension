document.addEventListener('DOMContentLoaded', async () => {
  // Initialize translations
  const translations = {
    extName: chrome.i18n.getMessage('extName'),
    optionsDescription1: chrome.i18n.getMessage('optionsDescription1'),
    optionsDescription2: chrome.i18n.getMessage('optionsDescription2'),
    previewButtonText: chrome.i18n.getMessage('previewButtonText'),
    themeSelectLabel: chrome.i18n.getMessage('themeSelectLabel'),
    themeBlue: chrome.i18n.getMessage('themeBlue'),
    themeGreen: chrome.i18n.getMessage('themeGreen'),
    themeRed: chrome.i18n.getMessage('themeRed'),
    themeDark: chrome.i18n.getMessage('themeDark'),
    themeLight: chrome.i18n.getMessage('themeLight'),
    saveButtonText: chrome.i18n.getMessage('saveButtonText'),
    feedbackButtonText: chrome.i18n.getMessage('feedbackButtonText'),
    feedbackSuccess: chrome.i18n.getMessage('feedbackSuccess'),
    feedbackError: chrome.i18n.getMessage('feedbackError'),
    feedbackRequired: chrome.i18n.getMessage('feedbackRequired'),
    submittingFeedback: chrome.i18n.getMessage('submittingFeedback'),
    feedbackTitle: chrome.i18n.getMessage('feedbackTitle') || 'Provide Feedback',
    feedbackPlaceholder: chrome.i18n.getMessage('feedbackPlaceholder') || 'Enter your feedback here...',
    submitFeedback: chrome.i18n.getMessage('submitFeedback') || 'Submit',
    cancelFeedback: chrome.i18n.getMessage('cancelFeedback') || 'Cancel',
    changeButtonThemeLater: chrome.i18n.getMessage('changeButtonThemeLater'),
    stepPinExtension: chrome.i18n.getMessage('stepPinExtension'),
    stepClickOptions: chrome.i18n.getMessage('stepClickOptions'),
    tryWebsites: chrome.i18n.getMessage('tryWebsites'),
    howToChangeTheme: chrome.i18n.getMessage('howToChangeTheme'),
    tryXRPWebsites: chrome.i18n.getMessage('tryXRPWebsites')
  };
  
  // Apply translations to modal content
  function applyModalTranslations() {
    // Set title
    const title = document.querySelector('#feedbackModal h2[data-i18n]');
    if (title) {
      title.textContent = translations.feedbackTitle;
    }
    
    // Set placeholder
    const textarea = document.querySelector('#feedbackText[data-i18n-placeholder]');
    if (textarea) {
      textarea.placeholder = translations.feedbackPlaceholder;
    }
    
    // Set button texts
    const buttons = document.querySelectorAll('[data-i18n]');
    buttons.forEach(button => {
      const key = button.getAttribute('data-i18n');
      if (key && translations[key]) {
        button.textContent = translations[key];
      }
    });
  }

  // Set button text content
  const buttons = {
    'save-button': translations.saveButtonText,
    'feedbackButton': translations.feedbackButtonText,
    'preview-button': translations.previewButtonText
  };

  // Update button text
  Object.entries(buttons).forEach(([id, text]) => {
    const button = document.getElementById(id);
    if (button) {
      button.textContent = text;
    }
  });

  // Get elements for event handlers
  const selectElement = document.getElementById('color-select');
  const saveButtonElement = document.getElementById('save-button');
  const feedbackButtonElement = document.getElementById('feedbackButton');
  const feedbackModalElement = document.getElementById('feedbackModal');
  const closeModalButtonElement = document.getElementById('closeModal');
  const cancelFeedbackButtonElement = document.getElementById('cancelFeedback');
  const submitFeedbackButtonElement = document.getElementById('submitFeedback');
  const feedbackTextElement = document.getElementById('feedbackText');
  const previewButtonElement = document.getElementById('preview-button');

  // Add event listeners for buttons
  feedbackButtonElement.addEventListener('click', () => {
    const modal = document.getElementById('feedbackModal');
    if (modal) {
      // Apply translations before showing the modal
      applyModalTranslations();
      
      modal.classList.add('show');
      const feedbackText = document.getElementById('feedbackText');
      if (feedbackText) {
        feedbackText.focus();
      }
      
      // Add event listener for ESC key
      document.addEventListener('keydown', handleEscKey);

      // Add click-outside functionality
      modal.addEventListener('click', handleClickOutside);
    }
  });

  closeModalButtonElement.addEventListener('click', closeModal);
  cancelFeedbackButtonElement.addEventListener('click', closeModal);

  function handleEscKey(event) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }

  function handleClickOutside(event) {
    // Only close if clicked outside the modal content
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }

  function closeModal() {
    const modal = document.getElementById('feedbackModal');
    if (modal) {
      modal.classList.remove('show');
      
      // Remove event listeners
      document.removeEventListener('keydown', handleEscKey);
      modal.removeEventListener('click', handleClickOutside);

      // Clear feedback text
      const feedbackText = document.getElementById('feedbackText');
      if (feedbackText) {
        feedbackText.value = '';
      }
    }
  }

  submitFeedbackButtonElement.addEventListener('click', async () => {
    const message = feedbackTextElement.value.trim();
    if (!message) {
      alert(translations.feedbackRequired || 'Please enter feedback before submitting.');
      return;
    }

    if (!config.BASE_URL || !config.ENDPOINTS || !config.SERVICE_VAL) {
      alert(translations.configNotLoaded || 'Configuration not loaded. Feedback submission is disabled.');
      return;
    }

    const submitButton = document.getElementById('submitFeedback');
    const originalButtonText = submitButton.textContent;
    
    try {
      // Update button to show loading state
      submitButton.disabled = true;
      submitButton.textContent = translations.submittingFeedback || 'Submitting...';

      // Generate a unique ID for this feedback submission
      const feedbackId = typeof crypto !== 'undefined' && crypto.randomUUID ? 
        crypto.randomUUID() : 
        Date.now().toString(36) + Math.random().toString(36).substring(2);

      const feedbackData = {
        message,
        client: {
          userAgent: navigator.userAgent,
          extensionVersion: chrome.runtime.getManifest().version
        },
        session: {
          id: feedbackId,
          timestamp: new Date().toISOString()
        }
      };

      console.log('Sending feedback request:', {
        url: `${config.BASE_URL}${config.ENDPOINTS.FEEDBACK}`,
        method: 'POST',
        headers: {
          'x-svc-call': config.SERVICE_VAL,
          'Content-Type': 'application/json'
        },
        body: feedbackData
      });

      const response = await fetch(`${config.BASE_URL}${config.ENDPOINTS.FEEDBACK}`, {
        method: 'POST',
        headers: {
          'x-svc-call': config.SERVICE_VAL,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackData)
      });

      console.log('Feedback API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to submit feedback. Status: ${response.status}`);
      }

      const data = await response.json().catch(() => ({
        message: translations.feedbackSuccess || 'Feedback submitted successfully',
        timestamp: new Date().toISOString()
      }));
      
      console.log('Feedback submitted successfully:', data);
      alert(data.message || translations.feedbackSuccess || 'Feedback submitted successfully');
      feedbackTextElement.value = '';
      closeModal();
    } catch (error) {
      console.error('Error submitting feedback:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        type: typeof error
      });
      
      let errorMessage = 'An unexpected error occurred. Please try again later.';
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Unable to connect to the feedback server. Please check your internet connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      // Reset button state
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });

  // Update text elements
  const elements = {
    extName: 'extName',
    optionsDescription1: 'optionsDescription1',
    optionsDescription2: 'optionsDescription2',
    themeSelectLabel: 'themeSelectLabel',
    themeBlue: 'themeBlue',
    themeGreen: 'themeGreen',
    themeRed: 'themeRed',
    themeDark: 'themeDark',
    themeLight: 'themeLight',
    changeButtonThemeLater: 'changeButtonThemeLater',
    stepPinExtension: 'stepPinExtension',
    stepClickOptions: 'stepClickOptions',
    tryWebsites: 'tryWebsites',
    howToChangeTheme: 'howToChangeTheme',
    tryXRPWebsites: 'tryXRPWebsites'
  };

  // Update all elements with translations
  Object.entries(elements).forEach(([key, id]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = translations[key];
    }
  });

  // Function to update the preview button styles based on the selected theme
  function updatePreviewButton() {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    if (!selectedOption) return; // Guard against no selection

    // Set the button text
    previewButtonElement.textContent = translations.previewButtonText;

    const styles = {
      background: selectElement.value || '#0077db',
      color: selectedOption.getAttribute('data-text') || '#ffffff',
      borderRadius: selectedOption.getAttribute('data-border-radius') || '8px',
      border: selectedOption.getAttribute('data-border') || 'none',
      fontSize: selectedOption.getAttribute('data-font-size') || '14px',
      fontStyle: selectedOption.getAttribute('data-font-style') || 'normal',
      textTransform: selectedOption.getAttribute('data-text-transform') || 'none',
      textDecoration: selectedOption.getAttribute('data-text-decoration') || 'none'
    };

    // Apply styles to the preview button
    previewButtonElement.style.background = styles.background;
    previewButtonElement.style.color = styles.color;
    previewButtonElement.style.borderRadius = styles.borderRadius;
    previewButtonElement.style.border = styles.border;
    previewButtonElement.style.fontSize = styles.fontSize;
    previewButtonElement.style.fontStyle = styles.fontStyle;
    previewButtonElement.style.textTransform = styles.textTransform;
    previewButtonElement.style.textDecoration = styles.textDecoration;

    // Update hover effect
    const hoverColor = selectedOption.getAttribute('data-hover') || styles.background;
    previewButtonElement.addEventListener('mouseover', () => {
      previewButtonElement.style.background = hoverColor;
    });
    previewButtonElement.addEventListener('mouseout', () => {
      previewButtonElement.style.background = styles.background;
    });
  }

  // Initial update with default value
  updatePreviewButton();

  // Update preview on selection change
  ['change', 'input'].forEach(event => {
    selectElement.addEventListener(event, updatePreviewButton);
  });

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
    alert(chrome.i18n.getMessage("configLoadError"));
  }

  // Generate or retrieve session ID
  let sessionId = await new Promise(resolve => {
    chrome.storage.local.get('sessionId', result => {
      if (result.sessionId) {
        resolve(result.sessionId);
      } else {
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
      const themes = Array.isArray(response) ? response : response.themes || [];
      if (themes.length > 0) {
        // Clear existing options first
        while (selectElement.firstChild) {
          selectElement.removeChild(selectElement.firstChild);
        }

        // Add default options
        const defaultOptions = [
          { value: '#0077db', text: '#ffffff', hover: '#005bb5', name: 'Blue' },
          { value: '#28a745', text: '#ffffff', hover: '#1e7e34', name: 'Green' },
          { value: '#FC0033', text: '#ffffff', hover: '#bd2130', name: 'Red' },
          { value: '#343a40', text: '#ffffff', hover: '#23272b', name: 'Dark' },
          { value: '#f8f9fa', text: '#212529', hover: '#e2e6ea', name: 'Light' }
        ];

        // Add default options first
        defaultOptions.forEach(theme => {
          const option = document.createElement('option');
          option.value = theme.value;
          option.setAttribute('data-text', theme.text);
          option.setAttribute('data-hover', theme.hover);
          option.setAttribute('data-border-radius', '8px');
          option.setAttribute('data-border', 'none');
          option.setAttribute('data-font-size', '14px');
          option.setAttribute('data-font-style', 'normal');
          option.setAttribute('data-text-transform', 'none');
          option.setAttribute('data-text-decoration', 'none');
          option.textContent = theme.name;
          selectElement.appendChild(option);
        });

        // Add custom themes
        themes.forEach(theme => {
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
          selectElement.appendChild(option);
        });

        // Update preview
        updatePreviewButton();
      }
    }
  });

  // Save button handler
  saveButtonElement.addEventListener('click', async () => {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const buttonStyles = {
      background: selectElement.value,
      text: selectedOption.getAttribute('data-text') || null,
      borderRadius: selectedOption.getAttribute('data-border-radius') || null,
      border: selectedOption.getAttribute('data-border') || null,
      fontSize: selectedOption.getAttribute('data-font-size') || null,
      fontStyle: selectedOption.getAttribute('data-font-style') || null,
      textTransform: selectedOption.getAttribute('data-text-transform') || null,
      textDecoration: selectedOption.getAttribute('data-text-decoration') || null,
      hover: selectedOption.getAttribute('data-hover') || null
    };

    try {
      // Save to sync storage for persistence across devices
      await chrome.storage.sync.set({ buttonStyles });
      
      // Also save to local storage for immediate access
      await chrome.storage.local.set({ buttonStyles });
      
      // Notify all tabs to update their buttons
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'updateButtonStyles',
            styles: buttonStyles
          });
        } catch (error) {
          // Ignore errors for tabs that don't have the content script
          console.debug(`Could not update styles in tab ${tab.id}:`, error);
        }
      }
      
      console.log('Styles saved and updated successfully');
      const successMessage = chrome.i18n.getMessage('themeSaved') || 'Theme saved successfully';
      alert(successMessage);
    } catch (error) {
      console.error('Error saving styles:', error);
      alert('Failed to save theme. Please try again.');
    }
  });

  // Feedback modal handlers
  let isSubmitting = false;

  function openModal() {
    const modal = document.getElementById('feedbackModal');
    if (!modal) return;
    
    modal.classList.add('show');
    
    // Focus the feedback textarea
    const feedbackText = document.getElementById('feedbackText');
    if (feedbackText) {
      feedbackText.value = '';
      feedbackText.focus();
    }
  }

  function closeModal() {
    const modal = document.getElementById('feedbackModal');
    if (modal) {
      modal.classList.remove('show');
      
      // Clear feedback text
      const feedbackText = document.getElementById('feedbackText');
      if (feedbackText) {
        feedbackText.value = '';
      }
    }
  }

  function handleEscKey(event) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }

  function handleClickOutside(event) {
    const modal = document.getElementById('feedbackModal');
    if (modal && event.target === modal) {
      closeModal();
    }
  }

  // Add event listeners only once
  if (closeModalButtonElement) {
    closeModalButtonElement.removeEventListener('click', closeModal);
    closeModalButtonElement.addEventListener('click', closeModal);
  }

  if (cancelFeedbackButtonElement) {
    cancelFeedbackButtonElement.removeEventListener('click', closeModal);
    cancelFeedbackButtonElement.addEventListener('click', closeModal);
  }

  // Store the original button and remove all its event listeners
  const originalButton = submitFeedbackButtonElement;
  const newSubmitButton = originalButton.cloneNode(true);
  originalButton.parentNode.replaceChild(newSubmitButton, originalButton);
  
  // Add new event listener with proper cleanup
  newSubmitButton.addEventListener('click', async (event) => {
    // Prevent multiple submissions
    if (isSubmitting) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    }
    
    const feedback = feedbackTextElement.value.trim();
    if (!feedback) {
      alert(translations.feedbackRequired || 'Please enter your feedback');
      return;
    }

    isSubmitting = true;
    const originalText = newSubmitButton.textContent;
    newSubmitButton.disabled = true;
    newSubmitButton.textContent = translations.submittingFeedback || 'Submitting...';

    try {
      // Use the configured endpoint from config
      const feedbackEndpoint = `${config.BASE_URL}${config.ENDPOINTS.FEEDBACK}`;
      console.log('Sending feedback to:', feedbackEndpoint);
      
      const response = await fetch(feedbackEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-svc-call': "4x9f3b8c1d6e2f709a5b4c3e8d1f6x2b"
        },
        body: JSON.stringify({ 
          message: feedback,
          client: {
            userAgent: navigator.userAgent,
            extensionVersion: chrome.runtime.getManifest().version
          },
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
      }

      const data = await response.json();
      console.log('Feedback submitted successfully:', data);
      feedbackTextElement.value = '';
      closeModal();
      alert(translations.feedbackSuccess || 'Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      const errorMessage = error.message.includes('Failed to fetch') 
        ? 'Unable to connect to the server. Please check your internet connection.'
        : translations.feedbackError || 'Failed to submit feedback. Please try again.';
      alert(errorMessage);
    } finally {
      isSubmitting = false;
      newSubmitButton.disabled = false;
      newSubmitButton.textContent = originalText;
    }
  });

  // Add modal event listeners
  const modal = document.getElementById('feedbackModal');
  if (modal) {
    document.removeEventListener('keydown', handleEscKey);
    modal.removeEventListener('click', handleClickOutside);
    
    document.addEventListener('keydown', handleEscKey);
    modal.addEventListener('click', handleClickOutside);
  }
});