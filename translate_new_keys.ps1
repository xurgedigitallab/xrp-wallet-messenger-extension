# Get the English template
$englishTemplate = Get-Content -Path "_locales\en\messages.json" -Raw | ConvertFrom-Json

# Get all language directories
$languageDirs = Get-ChildItem -Path "_locales" -Directory

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

foreach ($langDir in $languageDirs) {
    $langFile = Join-Path $langDir.FullName "messages.json"
    
    # Skip English since it's our reference
    if ($langDir.Name -eq "en") {
        continue
    }
    
    Write-Host "`nProcessing $($langDir.Name) translations..."
    
    # Read existing translations
    $translations = Get-Content -Path $langFile -Raw | ConvertFrom-Json
    
    # Create a new translations object
    $newTranslations = @{ }
    
    # Copy all existing translations
    foreach ($key in $translations.PSObject.Properties.Name) {
        $newTranslations.$key = $translations.$key
    }
    
    # Add translations for new keys
    foreach ($key in $newKeys) {
        if (-not $translations.$key) {
            Write-Host "Adding new key '$key' to $($langDir.Name)"
            $newTranslation = @{ }
            $newTranslation.message = $englishTemplate.$key.message
            $newTranslation.description = $englishTemplate.$key.description
            $newTranslations.$key = $newTranslation
        }
    }
    
    # Convert to JSON and write back
    $json = $newTranslations | ConvertTo-Json -Depth 10
    $json | Set-Content -Path $langFile -Encoding UTF8
    
    Write-Host "Updated $($langDir.Name) with new translations"
}
