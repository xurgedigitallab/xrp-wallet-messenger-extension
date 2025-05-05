# Get the English template
$englishTemplate = Get-Content -Path "_locales\en\messages.json" -Raw | ConvertFrom-Json

# Define the new keys that need translation
$newKeys = @(
    "buttonTextTokenCreator",
    "previewButtonText",
    "themeSelectLabel",
    "themeBlue",
    "themeGreen",
    "themeRed",
    "themeDark",
    "themeLight",
    "configLoadError",
    "themeSaved",
    "feedbackRequired",
    "configNotLoaded",
    "feedbackSuccess",
    "feedbackError",
    "stepPinExtension",
    "stepClickOptions",
    "saveButtonText",
    "feedbackButtonText",
    "closeButtonText",
    "cancelButtonText",
    "submitButtonText",
    "optionsDescription1",
    "optionsDescription2"
)

# Read Danish translations
$translations = Get-Content -Path "_locales\da\messages.json" -Raw | ConvertFrom-Json

# Create a new translations object
$newTranslations = @{ }

# Copy all existing translations
foreach ($key in $translations.PSObject.Properties.Name) {
    $newTranslations.$key = $translations.$key
}

# Update translations for new keys
foreach ($key in $newKeys) {
    if ($translations.$key) {
        # Add translations for the new keys
        $translations.$key.message = switch ($key) {
            'buttonTextTokenCreator' { 'Chat med tokenopretters tegnebog' }
            'previewButtonText' { 'Chat-knap forhåndsvisning' }
            'themeSelectLabel' { 'Vælg knap tema:' }
            'themeBlue' { 'Blå' }
            'themeGreen' { 'Grøn' }
            'themeRed' { 'Rød' }
            'themeDark' { 'Mørk' }
            'themeLight' { 'Lys' }
            'configLoadError' { 'Kunne ikke indlæse konfiguration. Feedback-indsendelse er deaktiveret.' }
            'themeSaved' { 'Tema gemt succesfuldt' }
            'feedbackRequired' { 'Angiv venligst feedback før indsendelse.' }
            'configNotLoaded' { 'Konfiguration ikke indlæst. Feedback-indsendelse er deaktiveret.' }
            'feedbackSuccess' { 'Feedback sendt succesfuldt' }
            'feedbackError' { 'Kunne ikke sende feedback. Prøv venligst igen senere.' }
            'stepPinExtension' { 'Fæst udvidelsen' }
            'stepClickOptions' { 'Klik på ikonets indstillinger' }
            'saveButtonText' { 'Gem' }
            'feedbackButtonText' { 'Giv feedback' }
            'closeButtonText' { 'Luk' }
            'cancelButtonText' { 'Annuller' }
            'submitButtonText' { 'Send' }
            'optionsDescription1' { 'Tilføjer en chat-knap til XRP-websider for' }
            'optionsDescription2' { 'Eller højreklik på enhver XRP-adresse for' }
            default { $translations.$key.message }
        }
    }
}

# Convert to JSON and write back
$json = $newTranslations | ConvertTo-Json -Depth 10
$json | Set-Content -Path "_locales\da\messages.json" -Encoding UTF8

Write-Host "Updated Danish translations with new values"
