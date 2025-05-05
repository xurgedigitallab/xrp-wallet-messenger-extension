# Azure Translator Text API configuration
$subscriptionKey = "6XNbWvAgn5GctqBmm1M5ZOJgBI2HzQ6zrcNUXTAUWyilLmcZhAgmJQQJ99BEACYeBjFXJ3w3AAAbACOGp2fM"
$endpoint = "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0"
$region = "eastus"

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

# Function to ensure proper UTF-8 encoding
function Get-ProperlyEncodedText {
    param (
        [string]$Text
    )
    
    if (-not $Text) {
        return $Text
    }
    
    # Convert to UTF-8 bytes and back to string
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($Text)
    return [System.Text.Encoding]::UTF8.GetString($bytes)
}

# Get the English template
$englishTemplate = Get-Content -Path "_locales\en\messages.json" -Raw | ConvertFrom-Json

# Function to handle translations
function Get-Translation {
    param (
        [string]$Text,
        [string]$TargetLanguage
    )
    
    # Dictionary of manual translations for major languages
    $manualTranslations = @{
        "es" = @{
            "Chat with player" = "Chatear con jugador"
            "Adds a chat button to XRP websites for instant wallet-to-wallet chat." = "Agrega un botón de chat a sitios web XRP para chat instantáneo entre billeteras."
            "Green" = "Verde"
            "Blue" = "Azul"
            "Theme saved successfully" = "Tema guardado exitosamente"
            "Dark" = "Oscuro"
            "Simply right-click on any XRP wallet address to quickly send a message through TextRP, the unified messaging layer for the XRPL." = "Simplemente haz clic derecho en cualquier dirección de billetera XRP para enviar rápidamente un mensaje a través de TextRP, la capa de mensajería unificada para el XRPL."
            "Light" = "Claro"
            "Chat with wallet" = "Chatear con billetera"
            "Feedback submitted successfully" = "Feedback enviado exitosamente"
            "Failed to submit feedback. Please try again later." = "Error al enviar feedback. Por favor, inténtalo de nuevo más tarde."
            "Chat Button Preview" = "Vista previa del botón de chat"
            "Chat with token issuer" = "Chatear con emisor de token"
            "Chat with NFT owner" = "Chatear con propietario de NFT"
            "Red" = "Rojo"
            "Message XRP Wallet" = "Mensaje a Billetera XRP"
            "Save" = "Guardar"
            "Chat with token creator's wallet" = "Chatear con billetera del creador de token"
            "Cancel" = "Cancelar"
            "Close" = "Cerrar"
            "Submit" = "Enviar"
            "Pin the extension" = "Anclar la extensión"
            "Select Button Theme:" = "Seleccionar Tema del Botón:"
            "Failed to load configuration. Feedback submission is disabled." = "Error al cargar la configuración. El envío de feedback está deshabilitado."
            "XRP Wallet Messenger from TextRP" = "Mensajero de Billetera XRP de TextRP"
        }
    }
    
    # Check if we have a manual translation for this language and text
    if ($manualTranslations.ContainsKey($TargetLanguage)) {
        $langTranslations = $manualTranslations[$TargetLanguage]
        if ($langTranslations.ContainsKey($Text)) {
            return $langTranslations[$Text]
        }
    }
    
    # If no manual translation, use the API
    try {
        # Ensure source text is properly encoded
        $properlyEncodedText = Get-ProperlyEncodedText -Text $Text
        
        # Create the request body
        $body = @{
            "Text" = $properlyEncodedText
        }
        
        # Create the headers
        $headers = @{
            'Ocp-Apim-Subscription-Key' = $subscriptionKey
            'Ocp-Apim-Subscription-Region' = $region
            'Content-Type' = 'application/json; charset=utf-8'
        }
        
        # Build the URI
        $uri = "$endpoint&to=$TargetLanguage"
        
        # Add retry logic with delay
        $maxRetries = 3
        $retryCount = 0
        
        while ($retryCount -lt $maxRetries) {
            try {
                # Convert the body to JSON
                $jsonBody = ConvertTo-Json @($body)
                
                # Make the API call
                $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $jsonBody
                
                # Get the translated text
                $translatedText = $response[0].translations[0].text
                
                # Ensure the translation is properly encoded
                return Get-ProperlyEncodedText -Text $translatedText
            }
            catch {
                $retryCount++
                if ($retryCount -lt $maxRetries) {
                    Write-Warning "Translation failed, retrying... ($retryCount/$maxRetries)"
                    Start-Sleep -Seconds (2 * $retryCount)
                }
                else {
                    Write-Warning "Failed to translate text after $maxRetries retries: $_"
                    return Get-ProperlyEncodedText -Text $Text
                }
            }
        }
    }
    catch {
        Write-Warning "Failed to translate text: $_"
        return Get-ProperlyEncodedText -Text $Text
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
    
    # Start with a copy of the English template
    $translations = $englishTemplate.psobject.Copy()
    
    # Get all property names from the English template
    $properties = $englishTemplate | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name
    
    # Translate each message
    foreach ($prop in $properties) {
        $message = $englishTemplate.$prop.message
        if ($message) {
            $translatedMessage = Translate-Text -Text $message -TargetLanguage $azureLangCode
            $translations.$prop.message = $translatedMessage
        }
    }
    
    # Write the translated file with proper encoding
    $json = $translations | ConvertTo-Json -Depth 10
    $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    Set-Content -Path "_locales\$($lang.Name)\messages.json" -Value $jsonBytes -Encoding Byte
}

Write-Host "Finished translating descriptions for all languages"
