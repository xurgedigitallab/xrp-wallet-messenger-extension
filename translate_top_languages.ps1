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

# Top priority languages based on number of speakers
$topLanguages = @{
    "zh" = "zh-Hans"  # Chinese
    "es" = "es"       # Spanish
    "hi" = "hi"       # Hindi
    "ar" = "ar"       # Arabic
    "bn" = "bn"       # Bengali
    "pt" = "pt"       # Portuguese (will handle both pt_BR and pt_PT)
    "ru" = "ru"       # Russian
    "fr" = "fr"       # French
    "de" = "de"       # German
    "ja" = "ja"       # Japanese
}

# Function to translate text using Microsoft Translator API
function Translate-Text {
    param (
        [string]$Text,
        [string]$TargetLanguage
    )
    
    $url = "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=$TargetLanguage"
    $headers = @{
        'Ocp-Apim-Subscription-Key' = '6XNbWvAgn5GctqBmm1M5ZOJgBI2HzQ6zrcNUXTAUWyilLmcZhAgmJQQJ99BEACYeBjFXJ3w3AAAbACOGp2fM'
        'Ocp-Apim-Subscription-Region' = 'eastus'
        'Content-Type' = 'application/json'
    }
    
    $body = @(
        @{
            'Text' = $Text
        }
    ) | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body
        return $response[0].translations[0].text
    }
    catch {
        Write-Warning "Failed to translate text: $_"
        return $Text  # Return original text if translation fails
    }
}

# Get list of all language directories
$languages = Get-ChildItem -Path "_locales" -Directory | Where-Object { $_.Name -ne "en" }

foreach ($lang in $languages) {
    $langCode = $lang.Name
    
    # Check if this is a top priority language
    if ($topLanguages.ContainsKey($langCode)) {
        Write-Host "Translating for $($lang.Name)..."
        
        # Read translations for this language
        $translations = Get-Content -Path "_locales\$($lang.Name)\messages.json" -Raw | ConvertFrom-Json
        
        # Create a new translations object
        $newTranslations = @{ }
        
        # Copy all existing translations
        foreach ($key in $translations.PSObject.Properties.Name) {
            $newTranslations.$key = $translations.$key
        }
        
        # Update translations for new keys
        foreach ($key in $newKeys) {
            if ($translations.$key) {
                # Get the English text to translate
                $englishText = $englishTemplate.$key.message
                
                # Translate the text
                $translatedText = Translate-Text -Text $englishText -TargetLanguage $topLanguages[$langCode]
                
                # Update the translation
                $translations.$key.message = $translatedText
            }
        }
        
        # Convert to JSON and write back
        $json = $newTranslations | ConvertTo-Json -Depth 10
        $json | Set-Content -Path "_locales\$($lang.Name)\messages.json" -Encoding UTF8
    }
}

Write-Host "Finished translating top priority languages"
