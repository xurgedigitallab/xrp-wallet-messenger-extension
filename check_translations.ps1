# Get the English template
$englishTemplate = Get-Content -Path "_locales\en\messages.json" -Raw | ConvertFrom-Json

# Get all language directories
$languageDirs = Get-ChildItem -Path "_locales" -Directory

foreach ($langDir in $languageDirs) {
    $langFile = Join-Path $langDir.FullName "messages.json"
    
    # Skip English since it's our reference
    if ($langDir.Name -eq "en") {
        continue
    }
    
    Write-Host "`nChecking $($langDir.Name) translations..."
    
    # Read translations
    $translations = Get-Content -Path $langFile -Raw | ConvertFrom-Json
    
    # Check each key
    foreach ($key in $englishTemplate.PSObject.Properties.Name) {
        if ($translations.$key -and $translations.$key.message) {
            # Check if the translation is different from English
            if ($translations.$key.message -eq $englishTemplate.$key.message) {
                Write-Host "WARNING: $($langDir.Name) uses English translation for '$key': $($translations.$key.message)"
            }
        } else {
            Write-Host "ERROR: $($langDir.Name) is missing translation for '$key'"
        }
    }
}
