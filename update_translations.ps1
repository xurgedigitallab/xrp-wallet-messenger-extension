# Get the English template
$englishTemplate = Get-Content -Path "_locales\en\messages.json" -Raw | ConvertFrom-Json

# Get all language directories
$languageDirs = Get-ChildItem -Path "_locales" -Directory

foreach ($langDir in $languageDirs) {
    $langFile = Join-Path $langDir.FullName "messages.json"
    
    # Read existing translations
    $existingTranslations = @{ }
    if (Test-Path $langFile) {
        $existingTranslations = Get-Content -Path $langFile -Raw | ConvertFrom-Json
    }

    # Create new translations object
    $newTranslations = @{ }

    # Copy all keys from English template
    foreach ($key in $englishTemplate.PSObject.Properties.Name) {
        $newTranslation = @{ }
        
        # Copy message if it exists in existing translations
        if ($existingTranslations.$key -and $existingTranslations.$key.message) {
            $newTranslation.message = $existingTranslations.$key.message
        } else {
            $newTranslation.message = $englishTemplate.$key.message
        }
        
        # Copy description from English template
        $newTranslation.description = $englishTemplate.$key.description
        
        $newTranslations.$key = $newTranslation
    }

    # Convert to JSON and write back
    $json = $newTranslations | ConvertTo-Json -Depth 10
    $json | Set-Content -Path $langFile -Encoding UTF8
    
    Write-Host "Updated translations for $($langDir.Name)"
}
