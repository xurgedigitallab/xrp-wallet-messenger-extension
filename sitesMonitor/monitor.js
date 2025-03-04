const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Load sites configuration
const configPath = path.join(__dirname, '../sitesConfig.json');
const sitesConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Set Chrome extension path
const extensionPath = path.join(__dirname, '../');

async function checkSite(site) {
    const browser = await puppeteer.launch({
        headless: false, // Headless mode must be disabled to load the extension
        args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`,
            '--window-size=1920,1080' // Set window size to 1920x1080
        ]
    });
    const page = await browser.newPage();

    // Set page viewport size
    await page.setViewport({ width: 1920, height: 1080 });

    try {
        // Navigate to the URL
        await page.goto(site.sitesMonitorUrl, { waitUntil: 'networkidle2' });

        // Check if the URL was redirected
        const currentUrl = page.url();
        if (currentUrl !== site.sitesMonitorUrl) {
            console.log(`----------------------------${site.url}----------------------------`);
            console.log(`URL was redirected from ${site.url} to ${currentUrl}`);
        } else {
            console.log(`URL did not redirect: ${site.url}`);
        }

        await new Promise(resolve => setTimeout(resolve, 5000));
        // If the site is dynamic, click the necessary element
        if (site.isDynamic && site.clickSelector) {
            try {
                await page.waitForSelector(site.clickSelector, { timeout: 5000 });
                await page.click(site.clickSelector);
                console.log(`Clicked on dynamic element`);
            } catch (error) {
                console.log(`Failed to click on dynamic element: ${site.clickSelector}`);
            }
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
        // Check if the selector exists
        try {
            await page.waitForSelector(site.selector, { timeout: 5000 });
            console.log(`Selector found`);
        } catch (error) {
            console.log(`Selector not found: ${site.selector}`);
        }

        // Check if the insertSelector exists
        try {
            await page.waitForSelector(site.insertSelector, { timeout: 5000 });
            console.log(`Insert selector found`);
        } catch (error) {
            console.log(`Insert selector not found: ${site.insertSelector}`);
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
        // Wait for the button to be inserted
        try {
            await page.waitForSelector('.contact-nft-owner-button', { timeout: 10000 });
            console.log('Button is inserted');
        } catch (error) {
            console.log('Button is not inserted');
        }
        console.log(`-----------------------------------------------------------------`);
        await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
        console.error(`Error checking site ${site.url}:`, error);
    } finally {
        await browser.close();
    }
}

async function monitorSites() {
    for (const site of sitesConfig) {
        await checkSite(site);
    }
}

// Run the monitoring function
monitorSites();