# Path to the Azerbaijani messages.json
$azFile = "c:\Users\will\Downloads\xrp-wallet-messenger-extension\_locales\az\messages.json"

# Create a backup
$backupPath = "$azFile.bak"
if (-not (Test-Path $backupPath)) {
    Copy-Item -Path $azFile -Destination $backupPath -Force
    Write-Host "Created backup at: $backupPath"
}

try {
    # Read the JSON file with UTF-8 encoding
    $content = [System.IO.File]::ReadAllText($azFile, [System.Text.Encoding]::UTF8)
    $json = $content | ConvertFrom-Json
    
    # Update the extDescription
    if ($json.PSObject.Properties.Name -contains "extDescription") {
        $translation = [System.Text.Encoding]::UTF8.GetString([System.Text.Encoding]::GetEncoding('iso-8859-1').GetBytes("XRP veb saytlarında cüzdanlar arası sürətli söhbət üçün söhbət düyməsi əlavə edir."))
        $json.extDescription.message = $translation
        
        # Save the updated JSON with UTF-8 encoding
        $json | ConvertTo-Json -Depth 10 | Out-File -FilePath $azFile -Encoding utf8 -Force
        Write-Host "Successfully updated Azerbaijani locale."
    } else {
        Write-Host "extDescription not found in the JSON file."
    }
} catch {
    Write-Host "Error updating Azerbaijani locale: $_"
}
