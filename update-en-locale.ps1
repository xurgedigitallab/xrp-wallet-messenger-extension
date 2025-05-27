# Path to the English messages.json
$enFile = "c:\Users\will\Downloads\xrp-wallet-messenger-extension\_locales\en\messages.json"

# Create a backup
$backupPath = "$enFile.bak"
if (-not (Test-Path $backupPath)) {
    Copy-Item -Path $enFile -Destination $backupPath -Force
    Write-Host "Created backup at: $backupPath"
}

try {
    # Read the JSON file
    $json = Get-Content -Path $enFile -Raw -Encoding UTF8 | ConvertFrom-Json
    
    # Update the extDescription
    if ($json.PSObject.Properties.Name -contains "extDescription") {
        $json.extDescription.message = "Adds a chat button to XRP websites for instant wallet-to-wallet chat."
        
        # Save the updated JSON
        $json | ConvertTo-Json -Depth 10 | Out-File -FilePath $enFile -Encoding utf8NoBOM -Force
        Write-Host "Successfully updated English locale."
    } else {
        Write-Host "extDescription not found in the JSON file."
    }
} catch {
    Write-Host "Error updating English locale: $_"
}
