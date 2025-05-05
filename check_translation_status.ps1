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

# Get list of all language directories
$languages = Get-ChildItem -Path "_locales" -Directory | Where-Object { $_.Name -ne "en" }

# Create a report object
$report = @{ }

foreach ($lang in $languages) {
    $langCode = $lang.Name
    Write-Host "Checking translations for $langCode..."
    
    # Read translations for this language
    $translations = Get-Content -Path "_locales\$langCode\messages.json" -Raw | ConvertFrom-Json
    
    # Check each new key
    $missingTranslations = @()
    $placeholderTranslations = @()
    $englishTranslations = @()
    
    foreach ($key in $newKeys) {
        if (-not $translations.$key) {
            $missingTranslations += $key
        }
        elseif ($translations.$key.message -eq $englishTemplate.$key.message) {
            $englishTranslations += $key
        }
        elseif ($translations.$key.message -like "*:*") {
            $placeholderTranslations += $key
        }
    }
    
    $report[$langCode] = @{
        Missing = $missingTranslations
        Placeholder = $placeholderTranslations
        English = $englishTranslations
        Total = $newKeys.Count
        MissingCount = $missingTranslations.Count
        PlaceholderCount = $placeholderTranslations.Count
        EnglishCount = $englishTranslations.Count
    }
}

# Sort languages by number of missing/placeholder translations
$sortedReport = $report.GetEnumerator() | Sort-Object { $_.Value.MissingCount + $_.Value.PlaceholderCount + $_.Value.EnglishCount } -Descending

# Output the report
Write-Host "Translation Status Report"
Write-Host "======================="
Write-Host ""

foreach ($entry in $sortedReport) {
    $langCode = $entry.Key
    $data = $entry.Value
    
    Write-Host "Language: $langCode"
    Write-Host "- Missing translations: $($data.MissingCount)"
    Write-Host "- Placeholder translations: $($data.PlaceholderCount)"
    Write-Host "- English translations: $($data.EnglishCount)"
    Write-Host "- Total new keys: $($data.Total)"
    
    if ($data.MissingCount -gt 0) {
        Write-Host "  Missing keys:"
        foreach ($key in $data.Missing) {
            Write-Host "    - $key"
        }
    }
    
    if ($data.PlaceholderCount -gt 0) {
        Write-Host "  Placeholder keys:"
        foreach ($key in $data.Placeholder) {
            Write-Host "    - $key"
        }
    }
    
    if ($data.EnglishCount -gt 0) {
        Write-Host "  English translations:"
        foreach ($key in $data.English) {
            Write-Host "    - $key"
        }
    }
    
    Write-Host ""
}

# Save the report to a file
$report | ConvertTo-Json -Depth 10 | Set-Content -Path "translation_status_report.json" -Encoding UTF8
Write-Host "Saved detailed report to translation_status_report.json"