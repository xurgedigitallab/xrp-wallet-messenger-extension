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
    
    # Update translations for new keys
    foreach ($key in $newKeys) {
        if ($translations.$key) {
            # Add translations for the new keys
            switch ($langDir.Name) {
                'fa' {
                    $translations.$key.message = switch ($key) {
                        'buttonTextTokenCreator' { 'چت با کیف پول سازنده توکن' }
                        'previewButtonText' { 'پیش‌نمایش دکمه چت' }
                        'themeSelectLabel' { 'انتخاب تم دکمه:' }
                        'themeBlue' { 'آبی' }
                        'themeGreen' { 'سبز' }
                        'themeRed' { 'قرمز' }
                        'themeDark' { 'تیره' }
                        'themeLight' { 'روشن' }
                        'configLoadError' { 'بارگذاری پیکربندی شکست خورد. ارسال بازخورد غیرفعال شده است.' }
                        'themeSaved' { 'تم با موفقیت ذخیره شد' }
                        'feedbackRequired' { 'لطفاً قبل از ارسال، بازخورد را وارد کنید.' }
                        'configNotLoaded' { 'پیکربندی بارگذاری نشد. ارسال بازخورد غیرفعال شده است.' }
                        'feedbackSuccess' { 'بازخورد با موفقیت ارسال شد' }
                        'feedbackError' { 'ارسال بازخورد شکست خورد. لطفاً دوباره تلاش کنید.' }
                        'stepPinExtension' { 'پین افزونه' }
                        'stepClickOptions' { 'بر روی گزینه‌های آیکون کلیک کنید' }
                        'saveButtonText' { 'ذخیره' }
                        'feedbackButtonText' { 'ارسال بازخورد' }
                        'closeButtonText' { 'بستن' }
                        'cancelButtonText' { 'لغو' }
                        'submitButtonText' { 'ارسال' }
                        'optionsDescription1' { 'افزودن دکمه چت به سایت‌های XRP برای' }
                        'optionsDescription2' { 'یا راست کلیک روی هر آدرس XRP برای' }
                        default { $translations.$key.message }
                    }
                }
                'da' {
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
                # Add more language cases as needed
                default {
                    # For other languages, keep the English value
                    $translations.$key.message = $englishTemplate.$key.message
                }
            }
        }
    }
    
    # Convert to JSON and write back
    $json = $newTranslations | ConvertTo-Json -Depth 10
    $json | Set-Content -Path $langFile -Encoding UTF8
    
    Write-Host "Updated $($langDir.Name) with translated values"
}
