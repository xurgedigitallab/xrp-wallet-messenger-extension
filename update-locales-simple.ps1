# Path to the _locales directory
$localesDir = "c:\Users\will\Downloads\xrp-wallet-messenger-extension\_locales"

# List of languages to update with their translations
$languages = @{
    "en" = "Adds a chat button to XRP websites for instant wallet-to-wallet chat."
    "es" = "Agrega un botón de chat a los sitios web de XRP para chatear al instante entre billeteras."
    "fr" = "Ajoute un bouton de discussion aux sites Web XRP pour un chat instantané de portefeuille à portefeuille."
    "de" = "Fügt XRP-Websites eine Chat-Schaltfläche für sofortigen Wallet-zu-Wallet-Chat hinzu."
    "ja" = "XRPウェブサイトにチャットボタンを追加し、ウォレット間のインスタントチャットを可能にします。"
    "zh_CN" = "在XRP网站上添加聊天按钮，实现钱包间的即时聊天。"
    "zh_TW" = "在XRP網站上新增聊天按鈕，實現錢包間的即時聊天。"
    "ko" = "XRP 웹사이트에 지갑 간 즉각적인 채팅을 위한 채팅 버튼을 추가합니다."
    "ru" = "Добавляет кнопку чата на сайты XRP для мгновенного обмена сообщениями между кошельками."
    "pt_BR" = "Adiciona um botão de chat aos sites XRP para bate-papo instantâneo de carteira para carteira."
    "pt_PT" = "Adiciona um botão de chat aos sites XRP para conversa instantânea entre carteiras."
    "it" = "Aggiunge un pulsante di chat ai siti web XRP per la chat istantanea da portafoglio a portafoglio."
    "nl" = "Voegt een chatknop toe aan XRP-websites voor directe portemonnee-naar-portemonnee chats."
    "pl" = "Dodaje przycisk czatu na stronach XRP umożliwiający natychmiastową rozmowę między portfelami."
    "tr" = "Anında cüzdanlar arası sohbet için XRP web sitelerine bir sohbet düğmesi ekler."
    "ar" = "يضيف زر دردشة إلى مواقع XRP للدردشة الفورية بين المحافظ."
    "hi" = "XRP वेबसाइट्स पर त्वरित वॉलेट-टू-वॉलेट चैट के लिए एक चैट बटन जोड़ता है।"
    "th" = "เพิ่มปุ่มแชทไปยังเว็บไซต์ XRP สำหรับการแชทระหว่างกระเป๋าเงินทันที"
    "vi" = "Thêm nút trò chuyện vào các trang web XRP để trò chuyện tức thì giữa các ví."
    "id" = "Menambahkan tombol obrolan ke situs web XRP untuk obrolan dompet-ke-dompet instan."
    "ms" = "Menambahkan butang sembang ke laman web XRP untuk sembang dompet-ke-dompet segera."
}

# Process each language
foreach ($lang in $languages.Keys) {
    $filePath = Join-Path $localesDir $lang "messages.json"
    
    # Check if the file exists
    if (-not (Test-Path $filePath)) {
        Write-Host "Skipping (file not found): $filePath"
        continue
    }
    
    try {
        # Create a backup
        $backupPath = "$filePath.bak"
        if (-not (Test-Path $backupPath)) {
            Copy-Item -Path $filePath -Destination $backupPath -Force
        }
        
        # Read the JSON file
        $json = Get-Content -Path $filePath -Raw -Encoding UTF8 | ConvertFrom-Json
        
        # Update the extDescription if it exists
        if ($json.PSObject.Properties.Name -contains "extDescription") {
            $json.extDescription.message = $languages[$lang]
            
            # Save the updated JSON with proper formatting
            $json | ConvertTo-Json -Depth 10 | Out-File -FilePath $filePath -Encoding utf8NoBOM -Force
            Write-Host "Updated ($lang): $filePath"
        } else {
            Write-Host "Skipped (no extDescription): $filePath"
        }
    } catch {
        Write-Host "Error processing $filePath : $_"
    }
}

Write-Host "`nUpdate complete. Backups were created with .bak extension."
