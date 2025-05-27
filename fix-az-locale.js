const fs = require('fs');
const path = require('path');

const azFile = path.join(__dirname, '_locales', 'az', 'messages.json');

// Read the file with UTF-8 encoding
let content = fs.readFileSync(azFile, 'utf8');

// Replace the extDescription message
const newDesc = 'XRP veb saytlarında cüzdanlar arası sürətli söhbət üçün söhbət düyməsi əlavə edir.';
const updatedContent = content.replace(
    /"extDescription"\s*:\s*\{[^}]*"message"\s*:\s*"[^"]*"/,
    `"extDescription": { "message": "${newDesc}"`
);

// Write the updated content back to the file
fs.writeFileSync(azFile, updatedContent, 'utf8');

console.log('Azerbaijani locale updated successfully!');
