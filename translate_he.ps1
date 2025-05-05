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

# Read Hebrew translations
$translations = Get-Content -Path "_locales\he\messages.json" -Raw | ConvertFrom-Json

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
            'buttonTextTokenCreator' { 'צ'אט עם הארנק של יוצר הטוקן' }
            'previewButtonText' { 'תצוגה מקדימה של כפתור צ'אט' }
            'themeSelectLabel' { 'בחר נושא כפתור:' }
            'themeBlue' { 'כחול' }
            'themeGreen' { 'ירוק' }
            'themeRed' { 'אדום' }
            'themeDark' { 'داكن' }
            'themeLight' { 'בהיר' }
            'configLoadError' { 'לא ניתן לטעון את ההגדרות. שליחת משוב מוגבלת.' }
            'themeSaved' { 'נושא נשמר בהצלחה' }
            'feedbackRequired' { 'אנא הכנס משוב לפני שליחה.' }
            'configNotLoaded' { 'ההגדרות לא נטענו. שליחת משוב מוגבלת.' }
            'feedbackSuccess' { 'משוב נשלח בהצלחה' }
            'feedbackError' { 'שליחת משוב נכשלה. אנא נסה שוב מאוחר יותר.' }
            'stepPinExtension' { 'תתאים את ההרחבה' }
            'stepClickOptions' { 'לחץ על אפשרויות הסמל' }
            'saveButtonText' { 'שמור' }
            'feedbackButtonText' { 'הוסף משוב' }
            'closeButtonText' { 'סגור' }
            'cancelButtonText' { 'ביטול' }
            'submitButtonText' { 'שלח' }
            'optionsDescription1' { 'הוספת כפתור צ'אט לאתרי XRP עבור' }
            'optionsDescription2' { 'או לחץ ימני על כל כתובת XRP עבור' }
            default { $translations.$key.message }
        }
    }
}

# Convert to JSON and write back
$json = $newTranslations | ConvertTo-Json -Depth 10
$json | Set-Content -Path "_locales\he\messages.json" -Encoding UTF8

Write-Host "Updated Hebrew translations with new values"
