# Azure Translator Text API configuration
$subscriptionKey = "6XNbWvAgn5GctqBmm1M5ZOJgBI2HzQ6zrcNUXTAUWyilLmcZhAgmJQQJ99BEACYeBjFXJ3w3AAAbACOGp2fM"
$endpoint = "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0"
$region = "eastus"

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

# Language codes and their corresponding Azure Translate codes
$languageMap = @{
    "af" = "af"
    "am" = "am"
    "ar" = "ar"
    "az" = "az"
    "bg" = "bg"
    "bn" = "bn"
    "bs" = "bs"
    "ca" = "ca"
    "cs" = "cs"
    "da" = "da"
    "de" = "de"
    "el" = "el"
    "es" = "es"
    "et" = "et"
    "eu" = "eu"
    "fa" = "fa"
    "fi" = "fi"
    "fil" = "fil"
    "fr" = "fr"
    "gu" = "gu"
    "he" = "he"
    "hi" = "hi"
    "hr" = "hr"
    "hu" = "hu"
    "hy" = "hy"
    "id" = "id"
    "is" = "is"
    "it" = "it"
    "ja" = "ja"
    "ka" = "ka"
    "kk" = "kk"
    "km" = "km"
    "kn" = "kn"
    "ko" = "ko"
    "ky" = "ky"
    "lt" = "lt"
    "lv" = "lv"
    "mk" = "mk"
    "ml" = "ml"
    "mn" = "mn"
    "mr" = "mr"
    "ms" = "ms"
    "my" = "my"
    "ne" = "ne"
    "nl" = "nl"
    "no" = "no"
    "pa" = "pa"
    "pl" = "pl"
    "pt_BR" = "pt"
    "pt_PT" = "pt"
    "ro" = "ro"
    "ru" = "ru"
    "si" = "si"
    "sk" = "sk"
    "sl" = "sl"
    "sq" = "sq"
    "sr" = "sr"
    "sv" = "sv"
    "sw" = "sw"
    "ta" = "ta"
    "te" = "te"
    "th" = "th"
    "tr" = "tr"
    "uk" = "uk"
    "ur" = "ur"
    "uz" = "uz"
    "vi" = "vi"
}

# Function to translate text using Azure Translator Text API
function Translate-Text {
    param (
        [string]$Text,
        [string]$TargetLanguage
    )
    
    $body = @{
        "Text" = $Text
    }
    
    $headers = @{
        'Ocp-Apim-Subscription-Key' = $subscriptionKey
        'Ocp-Apim-Subscription-Region' = $region
        'Content-Type' = 'application/json'
    }
    
    $uri = "$endpoint&to=$TargetLanguage"
    
    try {
        $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body (ConvertTo-Json @($body))
        return $response[0].translations[0].text
    }
    catch {
        Write-Warning "Failed to translate text: $_"
        # Return original text with language prefix as fallback
        $prefixes = @{
            "af" = "Afrikaans: "
            "am" = "Amharic: "
            "ar" = "Arabic: "
            "az" = "Azerbaijani: "
            "bg" = "Bulgarian: "
            "bn" = "Bengali: "
            "bs" = "Bosnian: "
            "ca" = "Catalan: "
            "cs" = "Czech: "
            "da" = "Danish: "
            "de" = "German: "
            "el" = "Greek: "
            "es" = "Spanish: "
            "et" = "Estonian: "
            "eu" = "Basque: "
            "fa" = "Persian: "
            "fi" = "Finnish: "
            "fil" = "Filipino: "
            "fr" = "French: "
            "gu" = "Gujarati: "
            "he" = "Hebrew: "
            "hi" = "Hindi: "
            "hr" = "Croatian: "
            "hu" = "Hungarian: "
            "hy" = "Armenian: "
            "id" = "Indonesian: "
            "is" = "Icelandic: "
            "it" = "Italian: "
            "ja" = "Japanese: "
            "ka" = "Georgian: "
            "kk" = "Kazakh: "
            "km" = "Khmer: "
            "kn" = "Kannada: "
            "ko" = "Korean: "
            "ky" = "Kyrgyz: "
            "lt" = "Lithuanian: "
            "lv" = "Latvian: "
            "mk" = "Macedonian: "
            "ml" = "Malayalam: "
            "mn" = "Mongolian: "
            "mr" = "Marathi: "
            "ms" = "Malay: "
            "my" = "Burmese: "
            "ne" = "Nepali: "
            "nl" = "Dutch: "
            "no" = "Norwegian: "
            "pa" = "Punjabi: "
            "pl" = "Polish: "
            "pt_BR" = "Portuguese (Brazil): "
            "pt_PT" = "Portuguese (Portugal): "
            "ro" = "Romanian: "
            "ru" = "Russian: "
            "si" = "Sinhala: "
            "sk" = "Slovak: "
            "sl" = "Slovenian: "
            "sq" = "Albanian: "
            "sr" = "Serbian: "
            "sv" = "Swedish: "
            "sw" = "Swahili: "
            "ta" = "Tamil: "
            "te" = "Telugu: "
            "th" = "Thai: "
            "tr" = "Turkish: "
            "uk" = "Ukrainian: "
            "ur" = "Urdu: "
            "uz" = "Uzbek: "
            "vi" = "Vietnamese: "
        }
        return "$($prefixes[$TargetLanguage])$Text"
    }
}

# Get list of all language directories
$languages = Get-ChildItem -Path "_locales" -Directory | Where-Object { $_.Name -ne "en" }

foreach ($lang in $languages) {
    $langCode = $lang.Name
    $azureLangCode = $languageMap[$langCode]
    
    if (-not $azureLangCode) {
        Write-Host "No Azure Translate code for $langCode. Skipping..."
        continue
    }
    
    Write-Host "Translating for $($lang.Name)..."
    
    # Read translations for this language
    $translations = Get-Content -Path "_locales\$($lang.Name)\messages.json" -Raw | ConvertFrom-Json
    
    # Update translations for new keys
    foreach ($key in $newKeys) {
        if ($translations.$key) {
            # Get the English text to translate
            $englishText = $englishTemplate.$key.message
            
            # Translate the text
            $translatedText = Translate-Text -Text $englishText -TargetLanguage $azureLangCode
            
            # Update the translation
            $translations.$key.message = $translatedText
        }
    }
    
    # Convert to JSON and write back with proper encoding
    $json = $translations | ConvertTo-Json -Depth 10
    [System.Text.Encoding]::UTF8.GetBytes($json) | Set-Content -Path "_locales\$($lang.Name)\messages.json" -Encoding Byte
}

Write-Host "Finished translating all languages with Azure Translator Text API"
