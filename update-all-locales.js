const fs = require('fs');
const path = require('path');

// Path to the _locales directory
const localesDir = path.join(__dirname, '_locales');

// Translations for "Adds a chat button to XRP websites for instant wallet-to-wallet chat."
const translations = {
    "af": "Voeg 'n knoppie by XRP-webwerwe toe vir kitsboodskappe tussen beursies.",
    "am": "ፈጣን የዋሌት-ወደ-ዋሌት ውይይት ለማድረግ በXRP ድረ-ገጾች ላይ የውይይት ቁልፍ ያክላል።",
    "ar": "يضيف زر دردشة إلى مواقع XRP للدردشة الفورية بين المحافظ.",
    "az": "XRP veb saytlarında cüzdanlar arası sürətli söhbət üçün söhbət düyməsi əlavə edir.",
    "bg": "Добавя бутон за чат в уебсайтовете на XRP за незабавен чат между портфейли.",
    "bn": "XRP ওয়েবসাইটে ওয়ালেট থেকে ওয়ালেট চ্যাটের জন্য একটি চ্যাট বোতাম যোগ করে।",
    "bs": "Dodaje dugme za chat na XRP veb stranice za trenutni razgovor između novčanika.",
    "ca": "Afegeix un botó de xat als llocs web XRP per a xats instantanis entre moneders.",
    "cs": "Přidá tlačítko chatu na webové stránky XRP pro okamžitý chat mezi peněženkami.",
    "da": "Tilføjer en chatknap til XRP-websteder til øjeblikkelig pengepulje-til-pengepulje-chat.",
    "de": "Fügt XRP-Websites eine Chat-Schaltfläche für sofortigen Wallet-zu-Wallet-Chat hinzu.",
    "el": "Προσθέτει ένα κουμπί συνομιλίας σε ιστοσελίδες XRP για άμεση συνομιλία πορτοφολιού προς πορτοφόλι.",
    "en": "Adds a chat button to XRP websites for instant wallet-to-wallet chat.",
    "es": "Agrega un botón de chat a los sitios web de XRP para chatear al instante entre billeteras.",
    "et": "Lisab XRP veebisaitidele vestlusnupu kiireks rahakottidevaheliseks suhtluseks.",
    "eu": "Gehieneko txanpon-txanpon elkarrizketarako botoi bat gehitzen die XRP webguneei.",
    "fa": "یک دکمه چت به وب‌سایت‌های XRP برای چت فوری کیف پول به کیف پول اضافه می‌کند.",
    "fi": "Lisää XRP-verkkosivustoille chat-painikkeen välittömään lompakkojen väliseen keskusteluun.",
    "fil": "Nagdaragdag ng pindutan ng chat sa mga website ng XRP para sa instant na wallet-to-wallet chat.",
    "fr": "Ajoute un bouton de discussion aux sites Web XRP pour un chat instantané de portefeuille à portefeuille.",
    "gu": "XRP વેબસાઇટ્સ પર વોલેટ-થી-વોલેટ ચેટ માટે ચેટ બટન ઉમેરે છે.",
    "he": "מוסיף כפתור צ'את לאתרי XRP לצ'אט מיידי בין ארנקים.",
    "hi": "XRP वेबसाइट्स पर त्वरित वॉलेट-टू-वॉलेट चैट के लिए एक चैट बटन जोड़ता है।",
    "hr": "Dodaje gumb za chat na XRP web stranice za trenutni razgovor između novčanika.",
    "hu": "Csevegőgombot ad hozzá az XRP weboldalakhoz azonnali pénztárca-közötti csevegéshez.",
    "hy": "Ավելացնում է խոսակցության կոճակ XRP կայքերում՝ ակնթարթային դրամապանակ-դեպի-դրամապանակ զրույցի համար:",
    "id": "Menambahkan tombol obrolan ke situs web XRP untuk obrolan dompet-ke-dompet instan.",
    "is": "Bætir við spjallhnappi á XRP vefsíður fyrir augnabliks veski-til-veski spjall.",
    "it": "Aggiunge un pulsante di chat ai siti web XRP per la chat istantanea da portafoglio a portafoglio.",
    "ja": "XRPウェブサイトにチャットボタンを追加し、ウォレット間のインスタントチャットを可能にします。",
    "ka": "XRP-ის ვებგვერდებს უერთდება ჩეთის ღილაკი სწრაფი ფულის ტრანსფერისთვის საფულეებს შორის.",
    "kk": "XRP веб-сайттарына дереу әмияннан-әмиянға чат үшін чат түймесін қосады.",
    "km": "បន្ថែមប៊ូតុងជជែកទៅកាន់គេហទំព័រ XRP សម្រាប់ការជជែកភ្លាមៗពីកាបូបទឹកប្រាក់ទៅកាបូបទឹកប្រាក់។",
    "kn": "XRP ವೆಬ್‌ಸೈಟ್‌ಗಳಿಗೆ ತ್ವರಿತ ವ್ಯಾಲೆಟ್-ಟು-ವ್ಯಾಲೆಟ್ ಚಾಟ್‌ಗಾಗಿ ಚಾಟ್ ಬಟನ್ ಸೇರಿಸುತ್ತದೆ.",
    "ko": "XRP 웹사이트에 지갑 간 즉각적인 채팅을 위한 채팅 버튼을 추가합니다.",
    "ky": "XRP вебсайттарына капчыктан-капчыкка тез чат үчүн чат баскычын кошот.",
    "lt": "Prideda pokalbių mygtuką XRP svetainėse, kad galėtumėte akimirksniu kalbėtis piniginėlėmis.",
    "lv": "Pievieno tērzēšanas pogu XRP tīmekļa vietnēm, lai nodrošinātu tūlītēju tērzēšanu starp maciņiem.",
    "mk": "Додава копче за разговор на веб-страниците на XRP за инстант разговор од паричник до паричник.",
    "ml": "XRP വെബ്‌സൈറ്റുകളിൽ വാലറ്റ്-ടു-വാലറ്റ് ചാറ്റിനായി ഒരു ചാറ്റ് ബട്ടൺ ചേർക്കുന്നു.",
    "mn": "XRP вэбсайтуудад хэтэвчнээс хэтэвчинд шуурхай чатах товч нэмнэ.",
    "mr": "XRP वेबसाइटवर त्वरित वॉलेट-टू-वॉलेट चॅटसाठी चॅट बटण जोडते.",
    "ms": "Menambahkan butang sembang ke laman web XRP untuk sembang dompet-ke-dompet segera.",
    "my": "XRP ဝဘ်ဆိုက်များတွင် ချက်ချင်း ပိုက်ဆံအိတ်မှ ပိုက်ဆံအိတ်သို့ ချက်တင်စကားပြောရန် ချတ်ခလုတ်တစ်ခုကို ထည့်ပေးသည်။",
    "ne": "XRP वेबसाइटहरूमा तत्काल वालेट-टु-वालेट च्याटको लागि च्याट बटन थप्छ।",
    "nl": "Voegt een chatknop toe aan XRP-websites voor directe portemonnee-naar-portemonnee chats.",
    "no": "Legger til en knapp for samtale på XRP-nettsteder for øyeblikkelig lommebok-til-lommebok-samtale.",
    "pa": "XRP ਵੈੱਬਸਾਈਟਾਂ 'ਤੇ ਤੁਰੰਤ ਵਾਲਿਟ-ਟੂ-ਵਾਲਿਟ ਚੈਟ ਲਈ ਇੱਕ ਚੈਟ ਬਟਨ ਜੋੜਦਾ ਹੈ।",
    "pl": "Dodaje przycisk czatu na stronach XRP umożliwiający natychmiastową rozmowę między portfelami.",
    "pt_BR": "Adiciona um botão de chat aos sites XRP para bate-papo instantâneo de carteira para carteira.",
    "pt_PT": "Adiciona um botão de chat aos sites XRP para conversa instantânea entre carteiras.",
    "ro": "Adaugă un buton de chat pe site-urile XRP pentru chat instant între portofele.",
    "ru": "Добавляет кнопку чата на сайты XRP для мгновенного обмена сообщениями между кошельками.",
    "si": "XRP වෙබ් අඩවි වලට ක්ෂණික බඩුත්ත-සිට-බඩුත්ත කතාබහ සඳහා කතාබහ බොත්තමක් එකතු කරයි.",
    "sk": "Pridáva tlačidlo chatu na webové stránky XRP pre okamžitý chat medzi peňaženkami.",
    "sl": "Doda gumb za klepet na spletne strani XRP za takojšen klepet med denarnicami.",
    "sq": "Shton një buton bisede në faqet e internetit XRP për bisedë të menjëhershme portofili-në-portofil.",
    "sr": "Додаје дугме за ћаскање на XRP веб-сајтовима за тренутно ћаскање између новчаника.",
    "sv": "Lägger till en chattknapp på XRP-webbplatser för omedelbar plånbok-till-plånbok-chatt.",
    "sw": "Huweka kifungo cha gumzo kwenye tovuti za XRP kwa gumzo la papo kwa papo la mkoba-hadi-mkoba.",
    "ta": "XRP வலைத்தளங்களில் உடனடி வாலட்டு-க்கு-வாலட்டு அரட்டைக்கான அரட்டை பொத்தானைச் சேர்க்கிறது.",
    "te": "XRP వెబ్‌సైట్‌లకు తక్షణ వాలెట్-టు-వాలెట్ చాట్ కోసం ఒక చాట్ బటన్‌ని జోడిస్తుంది.",
    "th": "เพิ่มปุ่มแชทไปยังเว็บไซต์ XRP สำหรับการแชทระหว่างกระเป๋าเงินทันที",
    "tr": "Anında cüzdanlar arası sohbet için XRP web sitelerine bir sohbet düğmesi ekler.",
    "uk": "Додає кнопку чату на сайти XRP для миттєвого обміну повідомленнями між гаманцями.",
    "ur": "ایکس آر پی کی ویب سائٹس پر فوری والیٹ سے والیٹ چیٹ کے لیے ایک چیٹ بٹن شامل کرتا ہے۔",
    "vi": "Thêm nút trò chuyện vào các trang web XRP để trò chuyện tức thì giữa các ví.",
    "zh_CN": "在XRP网站上添加聊天按钮，实现钱包间的即时聊天。",
    "zh_TW": "在XRP網站上新增聊天按鈕，實現錢包間的即時聊天。",
    "zu": "Ineza inkinobho yokuxoxisana kumawebhusayithi e-XRP yokuxoxisana ngokushesha phakathi kwama-wallet."
};

// Function to update a single locale file
function updateLocale(langCode, translation) {
    const filePath = path.join(localesDir, langCode, 'messages.json');
    
    // Check if directory exists
    if (!fs.existsSync(path.dirname(filePath))) {
        console.log(`Skipping (directory not found): ${path.dirname(filePath)}`);
        return;
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        console.log(`Skipping (file not found): ${filePath}`);
        return;
    }
    
    try {
        // Read the file
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Create a backup if it doesn't exist
        const backupPath = `${filePath}.bak`;
        if (!fs.existsSync(backupPath)) {
            fs.copyFileSync(filePath, backupPath);
            console.log(`Created backup at: ${backupPath}`);
        }
        
        // Parse the JSON
        const json = JSON.parse(content);
        
        // Update the extDescription if it exists
        if (json.extDescription) {
            json.extDescription.message = translation;
            
            // Save the updated file with pretty print
            fs.writeFileSync(filePath, JSON.stringify(json, null, 4) + '\n', 'utf8');
            console.log(`Updated (${langCode}): ${filePath}`);
        } else {
            console.log(`Skipped (no extDescription): ${filePath}`);
        }
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
}

// Process all translations
console.log('Starting to update locale files...\n');

Object.entries(translations).forEach(([langCode, translation]) => {
    updateLocale(langCode, translation);
});

console.log('\nUpdate complete. Backups were created with .bak extension.');
