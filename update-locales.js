const fs = require('fs');
const path = require('path');

// Path to the _locales directory
const localesDir = path.join(__dirname, '_locales');

// Translations for "Adds a chat button to XRP websites for instant wallet-to-wallet chat."
const translations = {
    "az": "XRP veb saytlarında cüzdanlar arası sürətli söhbət üçün söhbət düyməsi əlavə edir.",
    // Add more translations as needed
};

// Function to update a single locale file
function updateLocale(langCode, translation) {
    const filePath = path.join(localesDir, langCode, 'messages.json');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        console.log(`Skipping (file not found): ${filePath}`);
        return;
    }
    
    try {
        // Read the file
        const content = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(content);
        
        // Update the extDescription if it exists
        if (json.extDescription) {
            // Create a backup if it doesn't exist
            const backupPath = `${filePath}.bak`;
            if (!fs.existsSync(backupPath)) {
                fs.copyFileSync(filePath, backupPath);
                console.log(`Created backup at: ${backupPath}`);
            }
            
            // Update the message
            json.extDescription.message = translation;
            
            // Save the updated file
            fs.writeFileSync(filePath, JSON.stringify(json, null, 4) + '\n', 'utf8');
            console.log(`Updated (${langCode}): ${filePath}`);
        } else {
            console.log(`Skipped (no extDescription): ${filePath}`);
        }
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
}

// Update all locales
Object.entries(translations).forEach(([langCode, translation]) => {
    updateLocale(langCode, translation);
});

console.log('\nUpdate complete. Backups were created with .bak extension.');
