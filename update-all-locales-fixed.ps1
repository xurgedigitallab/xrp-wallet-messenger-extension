# Path to the _locales directory
$localesDir = "c:\Users\will\Downloads\xrp-wallet-messenger-extension\_locales"

# Function to get the translation for a language code
function Get-Translation($langCode) {
    $translations = @{
        "af" = "Voeg 'n knoppie by XRP-webwerwe toe vir kitsboodskappe tussen beursies."
        "am" = "ፈጣን የዋሌት-ወደ-ዋሌት ውይይት ለማድረግ በXRP ድረ-ገጾች ላይ የውይይት ቁልፍ ያክላል።"
        "ar" = "يضيف زر دردشة إلى مواقع XRP للدردشة الفورية بين المحافظ."
        "az" = "Dərhal cüzdan-dan-cüzdana söhbət üçün XRP veb saytlarına söhbət düyməsi əlavə edir."
        "bg" = "Добавя бутон за чат в уебсайтовете на XRP за незабавен чат между портфейли."
        "bn" = "তাত্ক্ষণিক ওয়ালেট-থেকে-ওয়ালেট চ্যাটের জন্য XRP ওয়েবসাইটগুলিতে একটি চ্যাট বোতাম যোগ করে।"
        "bs" = "Dodaje dugme za ćaskanje na XRP web stranice za trenutno ćaskanje između novčanika."
        "ca" = "Afegeix un botó de xat als llocs web XRP per a xats instantanis entre moneders."
        "cs" = "Přidá tlačítko chatu na webové stránky XRP pro okamžitý chat mezi peněženkami."
        "da" = "Tilføjer en chatknap til XRP-websteder til øjeblikkelig pengepulje-til-pengepulje-chat."
        "de" = "Fügt XRP-Websites eine Chat-Schaltfläche für sofortigen Wallet-zu-Wallet-Chat hinzu."
        "el" = "Προσθέτει ένα κουμπί συνομιλίας σε ιστοσελίδες XRP για άμεση συνομιλία πορτοφολιού προς πορτοφόλι."
        "en" = "Adds a chat button to XRP websites for instant wallet-to-wallet chat."
        "es" = "Agrega un botón de chat a los sitios web de XRP para chatear al instante entre billeteras."
        "et" = "Lisab XRP veebisaitidele vestlusnupu kiireks rahakottidevaheliseks suhtluseks."
        "eu" = "Gehieneko txanpon-txanpon elkarrizketarako botoi bat gehitzen die XRP webguneei."
        "fa" = "یک دکمه چت به وب‌سایت‌های XRP برای چت فوری کیف پول به کیف پول اضافه می‌کند."
        "fi" = "Lisää XRP-verkkosivustoille chat-painikkeen välittömään lompakkojen väliseen keskusteluun."
        "fil" = "Nagdaragdag ng pindutan ng chat sa mga website ng XRP para sa instant na wallet-to-wallet chat."
        "fr" = "Ajoute un bouton de discussion aux sites Web XRP pour un chat instantané de portefeuille à portefeuille."
        "gu" = "XRP વેબસાઇટ્સ પર વોલેટ-થી-વોલેટ ચેટ માટે ચેટ બટન ઉમેરે છે."
        "he" = "מוסיף כפתור צ'את לאתרי XRP לצ'אט מיידי בין ארנקים."
        "hi" = "XRP वेबसाइट्स पर त्वरित वॉलेट-टू-वॉलेट चैट के लिए एक चैट बटन जोड़ता है।"
        "hr" = "Dodaje gumb za chat na XRP web stranice za trenutni razgovor između novčanika."
        "hu" = "Csevegőgombot ad hozzá az XRP weboldalakhoz azonnali pénztárca-közötti csevegéshez."
        "hy" = "Ավելացնում է խոսակցության կոճակ XRP կայքերում՝ ակնթարթային դրամապանակ-դեպի-դրամապանակ զրույցի համար:"
        "id" = "Menambahkan tombol obrolan ke situs web XRP untuk obrolan dompet-ke-dompet instan."
        "is" = "Bætir við spjallhnappi á XRP vefsíður fyrir augnabliks veski-til-veski spjall."
        "it" = "Aggiunge un pulsante di chat ai siti web XRP per la chat istantanea da portafoglio a portafoglio."
        "ja" = "XRPウェブサイトにチャットボタンを追加し、ウォレット間のインスタントチャットを可能にします。"
        "ka" = "ამატებს ჩეთის ღილაკს XRP ვებსაიტებზე სწრაფი საფულე-დან-საფულემდე ჩეთისთვის."
        "kk" = "XRP веб-сайттарына дереу әмияннан-әмиянға чат үшін чат түймесін қосады."
        "km" = "បន្ថែមប៊ូតុងជជែកទៅកាន់គេហទំព័រ XRP សម្រាប់ការជជែកភ្លាមៗពីកាបូបទឹកប្រាក់ទៅកាបូបទឹកប្រាក់។"
        "kn" = "ತ್ವರಿತ ವ್ಯಾಲೆಟ್-ಟು-ವ್ಯಾಲೆಟ್ ಚಾಟ್ಗಾಗಿ XRP ವೆಬ್‌ಸೈಟ್‌ಗಳಿಗೆ ಚಾಟ್ ಬಟನ್ ಸೇರಿಸುತ್ತದೆ."
        "ko" = "XRP 웹사이트에 지갑 간 즉각적인 채팅을 위한 채팅 버튼을 추가합니다."
        "ky" = "XRP вебсайттарына капчыктан-капчыкка тез чат үчүн чат баскычын кошот."
        "lt" = "Prideda pokalbių mygtuką XRP svetainėse, kad galėtumėte akimirksniu kalbėtis piniginėlėmis."
        "lv" = "Pievieno tērzēšanas pogu XRP tīmekļa vietnēm, lai nodrošinātu tūlītēju tērzēšanu starp maciņiem."
        "mk" = "Додава копче за разговор на веб-страниците на XRP за инстант разговор од паричник до паричник."
        "ml" = "ഉടനടി വാലറ്റ്-ടു-വാലറ്റ് ചാറ്റിനായി XRP വെബ്‌സൈറ്റുകളിലേക്ക് ഒരു ചാറ്റ് ബട്ടൺ ചേർക്കുന്നു."
        "mn" = "XRP вэбсайтуудад хэтэвчнээс хэтэвчинд шуурхай чатах товч нэмнэ."
        "mr" = "त्वरित वॉलेट-टू-वॉलेट चॅटसाठी XRP वेबसाइटवर चॅट बटण जोडते."
        "ms" = "Menambahkan butang sembang ke laman web XRP untuk sembang dompet-ke-dompet segera."
        "my" = "XRP ဝဘ်ဆိုက်များတွင် ချက်ချင်း ပိုက်ဆံအိတ်မှ ပိုက်ဆံအိတ်သို့ ချက်တင်စကားပြောရန် ချတ်ခလုတ်တစ်ခုကို ထည့်ပေးသည်။"
        "ne" = "तत्काल वालेट-टु-वालेट च्याटको लागि XRP वेबसाइटहरूमा च्याट बटन थप्छ।"
        "nl" = "Voegt een chatknop toe aan XRP-websites voor directe portemonnee-naar-portemonnee chats."
        "no" = "Legger til en knapp for samtale på XRP-nettsteder for øyeblikkelig lommebok-til-lommebok-samtale."
        "pa" = "XRP ਵੈੱਬਸਾਈਟਾਂ 'ਤੇ ਤੁਰੰਤ ਵਾਲਿਟ-ਟੂ-ਵਾਲਿਟ ਚੈਟ ਲਈ ਇੱਕ ਚੈਟ ਬਟਨ ਜੋੜਦਾ ਹੈ।"
        "pl" = "Dodaje przycisk czatu na stronach XRP umożliwiający natychmiastową rozmowę między portfelami."
        "pt_BR" = "Adiciona um botão de chat aos sites XRP para bate-papo instantâneo de carteira para carteira."
        "pt_PT" = "Adiciona um botão de chat aos sites XRP para conversa instantânea entre carteiras."
        "ro" = "Adaugă un buton de chat pe site-urile XRP pentru chat instant între portofele."
        "ru" = "Добавляет кнопку чата на сайты XRP для мгновенного обмена сообщениями между кошельками."
        "si" = "ක්ෂණික බඩුත්ත-සිට-බඩුත්ත කතාබහ සඳහා XRP වෙබ් අඩවි වලට කතාබහ බොත්තමක් එකතු කරයි."
        "sk" = "Pridáva tlačidlo chatu na webové stránky XRP pre okamžitý chat medzi peňaženkami."
        "sl" = "Doda gumb za klepet na spletne strani XRP za takojšen klepet med denarnicami."
        "sq" = "Shton një buton bisede në faqet e internetit XRP për bisedë të menjëhershme portofili-në-portofil."
        "sr" = "Додаје дугме за ћаскање на XRP веб-сајтовима за тренутно ћаскање између новчаника."
        "sv" = "Lägger till en chattknapp på XRP-webbplatser för omedelbar plånbok-till-plånbok-chatt."
        "sw" = "Huweka kifungo cha gumzo kwenye tovuti za XRP kwa gumzo la papo kwa papo la mkoba-hadi-mkoba."
        "ta" = "உடனடி வாலட்டு-க்கு-வாலட்டு அரட்டைக்கு XRP வலைத்தளங்களுக்கு ஒரு அரட்டை பொத்தானைச் சேர்க்கிறது."
        "te" = "తక్షణ వాలెట్-టు-వాలెట్ చాట్ కోసం XRP వెబ్‌సైట్‌లకు చాట్ బటన్‌ను జోడిస్తుంది."
        "th" = "เพิ่มปุ่มแชทไปยังเว็บไซต์ XRP สำหรับการแชทระหว่างกระเป๋าเงินทันที"
        "tr" = "Anında cüzdanlar arası sohbet için XRP web sitelerine bir sohbet düğmesi ekler."
        "uk" = "Додає кнопку чату на веб-сайти XRP для миттєвого спілкування між гаманцями."
        "ur" = "فوری والیٹ سے والیٹ چیٹ کے لیے ایکس آر پی کی ویب سائٹس پر چیٹ کا بٹن شامل کرتا ہے۔"
        "uz" = "XRP veb-saytlariga zudlik bilan hamyonlar orasidagi suhbat uchun chat tugmachasini qo'shadi."
        "vi" = "Thêm nút trò chuyện vào các trang web XRP để trò chuyện tức thì giữa các ví."
        "zh_CN" = "在XRP网站上添加聊天按钮，实现钱包间的即时聊天。"
        "zh_TW" = "在XRP網站上新增聊天按鈕，實現錢包間的即時聊天。"
        "zu" = "Ineza inkinobho yokuxoxisana kumawebhusayithi e-XRP yokuxoxisana ngokushesha kusuka kuwalethi kuye kuwalethi."
    }
    
    return $translations[$langCode]
}

# Get all messages.json files
$localeFiles = Get-ChildItem -Path $localesDir -Filter "messages.json" -Recurse

foreach ($file in $localeFiles) {
    # Get the language code from the parent directory name
    $langCode = $file.Directory.Name
    
    # Get the translation for this language
    $translation = Get-Translation $langCode
    
    # Skip if we don't have a translation for this language
    if (-not $translation) {
        Write-Host "Skipping (no translation): $($file.FullName)"
        continue
    }
    
    # Create a backup
    $backupPath = $file.FullName + ".bak"
    if (-not (Test-Path $backupPath)) {
        Copy-Item -Path $file.FullName -Destination $backupPath -Force
    }
    
    try {
        # Read the JSON file with UTF-8 encoding
        $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
        $json = $content | ConvertFrom-Json
        
        # Update the extDescription if it exists
        if ($json.PSObject.Properties.Name -contains "extDescription") {
            $json.extDescription.message = $translation
            
            # Save the updated JSON with proper formatting and UTF-8 encoding
            $json | ConvertTo-Json -Depth 10 | Out-File -FilePath $file.FullName -Encoding utf8NoBOM -Force
            Write-Host "Updated ($langCode): $($file.FullName)"
        } else {
            Write-Host "Skipped (no extDescription): $($file.FullName)"
        }
    } catch {
        Write-Host "Error processing: $($file.FullName) - $_"
    }
}

Write-Host "`nLocale update complete. Backups were created with .bak extension."
