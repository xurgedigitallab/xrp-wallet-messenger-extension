document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('color-select');
    const saveButton = document.getElementById('save-button');
    chrome.storage.sync.get('buttonColor', (result) => {
      if (result.buttonColor) {
        select.value = result.buttonColor.background;
      }
    });
    saveButton.addEventListener('click', () => {
      const selectedOption = select.options[select.selectedIndex];
      const buttonColor = {
        background: select.value,
        text: selectedOption.getAttribute('data-text'),
        hover: selectedOption.getAttribute('data-hover')
      };
      chrome.storage.sync.set({ buttonColor }, () => {
        alert('Theme saved successfully');
      });
    });
  });