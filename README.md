# XRP Wallet Messenger from TextRP (Browser Extension)

## Introduction
This Chrome extension dynamically scans web pages for XRP wallet addresses and provides functionalities to interact with these addresses directly through the context menu. Users can easily navigate to related XRP transactions or account details by right-clicking on detected addresses.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Dependencies](#dependencies)
- [Configuration](#configuration)
- [Development](#development)
- [Documentation](#documentation)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Contributors](#contributors)
- [License](#license)

## Installation
To install the extension:

1. Download the extension package.
2. Navigate to `chrome://extensions/` in the Google Chrome browser.
3. Enable Developer Mode by toggling the switch in the upper right corner.
4. Click on "Load unpacked" and select the extension directory.

## Usage
After installation, the extension automatically scans web pages for XRP wallet addresses. Users can interact with detected addresses by right-clicking to open a context menu with various options.

## Features
- **Automatic Detection**: Scans all web pages for XRP wallet addresses.
- **Context Menu Integration**: Provides a context menu option to interact with the detected addresses.
- **Support for Multiple Formats**: Detects XRP addresses in various formats across web content.

## Dependencies
- Google Chrome Browser
- Node.js
- Webpack
- Babel
- xrpl


## Configuration
The extension requires no additional configuration after installation.

## Development
To set up the development environment and build the extension, follow these steps:

1. **Clone the repository**:
    ```sh
    git clone https://github.com/yourusername/xrp-wallet-messenger.git
    cd xrp-wallet-messenger
    ```

2. **Install dependencies**:
    ```sh
    npm install
    npm install --save-dev webpack webpack-cli babel-loader @babel/core @babel/preset-env
    npm install xrpl
    ```

3. **Build the extension**:
    ```sh
    npx webpack --mode production
    ```

4. **Watch for changes and rebuild automatically**:
    ```sh
    npx webpack --watch
    ```

5. **Load the extension in Chrome**:
    - Navigate to `chrome://extensions/`
    - Enable Developer Mode
    - Click "Load unpacked" and select the corresponding directory

## Documentation
Refer to the `manifest.json` for the extension's configuration and structure. Code comments in `background.js` and `content.js` provide insights into the functionality and flow of the extension.

## Examples
Navigating to a web page containing XRP wallet addresses will automatically highlight them. Right-clicking on an address provides a context menu to perform actions defined in the extension.

## Troubleshooting
If the extension does not detect addresses as expected, ensure that:

- The web page is fully loaded before the detection starts.
- The extension has permission to run in the current context.
- The extension is up to date with the latest code changes.

## Contributors
To contribute to this extension, please fork the repository and submit a pull request with your proposed changes.

## License
This project is licensed under the [MIT License](LICENSE).
