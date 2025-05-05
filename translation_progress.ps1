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

Write-Host "Translation Progress Report:`n"

foreach ($langDir in $languageDirs) {
    $langFile = Join-Path $langDir.FullName "messages.json"
    
    # Skip English since it's our reference
    if ($langDir.Name -eq "en") {
        continue
    }
    
    Write-Host "`n$($langDir.Name) - Missing Translations:"
    
    # Read translations
    $translations = Get-Content -Path $langFile -Raw | ConvertFrom-Json
    
    # Check each new key
    foreach ($key in $newKeys) {
        if (-not $translations.$key -or $translations.$key.message -eq $englishTemplate.$key.message) {
            Write-Host "  - $key"
        }
    }
}
