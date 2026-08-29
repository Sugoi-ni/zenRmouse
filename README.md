# ZenRmouse

Telefonunuzu kablosuz fare, klavye ve medya kontrolucusu olarak kullanin.

```
Telefon (Expo) ──WiFi/WebSocket──► Node.js Sunucu ──TCP──► PowerShell Bridge ──► Win32 API ──► Fare hareket, tiklama, tus basimi
```

## Ozellikler

| Ozellik | Aciklama |
|---------|----------|
| **Dokunmatik Fare** | Parmak kaydirarak fareyi hareket ettirin, dokunarak tiklayin, surukleyin |
| **Hareketle Fare** | Telefonu egerek fareyi kontrol edin (ivmeolcer) |
| **Klavye** | Turkce ve tum Unicode karakterleri destekler, Ctrl+C, Alt+Tab gibi kisayollar |
| **Medya Tuslari** | Ses ac/kapa, sustur, oynat/duraklat, sonraki/onceki sarki |
| **QR Kod** | QR kodu okutarak otomatik baglanma |
| **Otomatik Baglanma** | Arka plandan dondugunde otomatik yeniden baglanma |

## Mimari

```
┌─────────────────┐     WiFi/WebSocket      ┌──────────────┐      TCP       ┌────────────────┐
│                 │ ──────────────────────►  │              │ ────────────►  │                │
│  Telefondaki    │                          │  Node.js     │               │  PowerShell    │
│  Uygulama       │ ◄──────────────────────  │  Sunucu      │ ◄────────────  │  Köprü         │
│  (React Native) │                          │  (WS:8321)   │               │  (TCP:8322)    │
└─────────────────┘                          └──────────────┘               └───────┬────────┘
                                                                                    │
                                                                         ┌──────────▼──────────┐
                                                                         │  C# P/Invoke        │
                                                                         │  (InputHelper.cs)    │
                                                                         └──────────┬──────────┘
                                                                                    │
                                                                         ┌──────────▼──────────┐
                                                                         │  Windows Win32 API  │
                                                                         │  SetCursorPos        │
                                                                         │  SendInput           │
                                                                         │  keybd_event         │
                                                                         └─────────────────────┘
```

## Gereksinimler

| Gereksinim | Versiyon | Aciklama |
|------------|----------|----------|
| **Windows** | 10/11 | PowerShell 5.1+ gerekli (varsayilan yuklu) |
| **Node.js** | v18+ | Sunucu icin |
| **JDK** | 17 | APK derlemek icin (sadece APK derleme icin) |
| **Android SDK** | Herhangi | APK derleme + ADB icin (sadece APK derleme icin) |
| **Android Telefon** | USB hata ayiklama acik | APK yuklemek icin |

> **Not:** Sadece sunucuyu calistirmak icin JDK ve Android SDK gerekmez. APK'yi baska bir yerden yukleyebilirsiniz.

## Kurulum

### Adim 1: Repo'yu Klonlayin

```bash
git clone https://github.com/Sugoi-ni/zenRmouse.git
cd zenRmouse
```

### Adim 2: Otomatik Kurulum

```bash
setup.bat
```

Bu komut:
- Masaustune kisayol olusturur
- Auto-start ayarlar
- Sunucu bagimliliklarini yukler (`npm install`)

### Adim 3: Sunucuyu Baslatin

```bash
start.bat
```

veya terminalden:

```bash
cd server
npm install
node src/index.js
```

Sunucu basladiginda sunlari gorursunuz:

```
==================================================
  ZenRmouse Sunucusu Baslatildi!
==================================================
  QR sayfasi:  http://192.168.1.8:8320
  WebSocket:   ws://192.168.1.8:8321
  Ekran boyutu: 1920x1080
==================================================
```

### Adim 4: APK'yi Yukleyin

**Yontem A: Kendiniz derleyin** (JDK + Android SDK gerekli):

```bash
build.bat
```

**Yontem B: Hazir APK kullanin** (tavsiye edilen):

`app-debug.apk` dosyasini telefonunuza yukleyin:
1. USB kablosu baglayin
2. `adb install app-debug.apk` calistirin
3. veya APK dosyasini telefona gonderip yukleyin

### Adim 5: Baglanin

1. Telefonda ZenRmouse uygulamasini acin
2. Bilgisayarin IP adresini girin (ornegin `192.168.1.8`)
3. Port: `8321`
4. **Baglan** butonuna basin
5. Yesil nokta gorun = baglandi!

> **Alternatif:** `http://192.168.1.8:8320` adresinden QR kodu olusturup telefonunuzla okutabilirsiniz.

## Kullanim

### Dokunmatik Fare

- **Parmak kaydir** → Fareyi hareket ettir
- **Dokun** → Sol tik
- **Iki parmak kaydir** → Scroll
- **Uzun bas + surukle** → Surukleme modu (ift tikla ve bekle)

### Hareketle Fare

- **Telefonu eg** → Fareyi hareket ettir
- **Kalibrasyon** → Ekrana dokunarak merkez noktayi ayarla

### Klavye

- **Metin girisi** → Turkce ve Unicode karakter destegi
- **Kontrol tuslari** → Enter, Space, Tab, Escape, Backspace
- **Kisayollar** → Ctrl+C, Ctrl+V, Alt+Tab, Windows tusu
- **Ok tuslari** → Yukari, asagi, sol, sag
- **F tuslari** → F1 - F12

### Medya

- **Ses +/-** → Sesi ac/kapa
- **Sustur** → Sesi tamamen kapat
- **Oynat/Duraklat** → Muzik/video kontrol
- **Sonraki/Onceki** → Sarki degistir
- **Durdur** → Calmayi durdur

## Sorun Giderme

### "bridge not connected" hatasi

Bridge (PowerShell) sunucuya baglanamiyor:

```bash
# tum surecleri oldur ve yeniden baslat
taskkill /F /IM node.exe
taskkill /F /IM powershell.exe
start.bat
```

### Telefondan sunucuya baglanamiyor

1. PC ve telefon ayni WiFi aginda mi?
2. Windows Firewall port 8321'i engelliyor mu?
3. IP adresi dogru mu? (`ipconfig` ile kontrol edin)

### Metro bundler calismiyor

```bash
cd mobile
npx expo start --dev-client
```

### ADB baglantisi yok

```bash
# USB hata ayiklamanin acik oldugundan emin olun
adb devices
adb reverse tcp:8081 tcp:8081
```

### Medya tuslari calismadi

Medya tuslari Win32 VK kodlariyla calisir. Eger calmazsa:
1. Sunucuyu ve bridge'i yeniden baslatin
2. Uygulamayi kapatip acin

## Proje Yapisi

```
zenRmouse/
├── server/                  # Node.js sunucu
│   ├── src/
│   │   ├── index.js         # WebSocket + HTTP sunucu
│   │   └── win32/
│   │       ├── bridge.js    # TCP köprü yoneticisi
│   │       ├── bridge.ps1   # PowerShell TCP istemcisi
│   │       └── InputHelper.cs  # C# Win32 API
│   └── package.json
├── mobile/                  # React Native (Expo) uygulama
│   ├── src/
│   │   ├── screens/         # Baglanti, Kontrol ekranlari
│   │   ├── components/      # Dokunmatik, Hareket, Klavye, Medya
│   │   └── ws/              # WebSocket hook'u
│   ├── App.tsx
│   └── android/             # Android build dosyalari
├── desktop/                 # Masaustu kisayol scriptleri
├── setup.bat                # Otomatik kurulum
├── start.bat                # Sunucu + Metro baslatma
├── build.bat                # APK derleme + yukleme
└── README.md
```

## Teknoloji

| Bilesen | Teknoloji |
|---------|-----------|
| Mobil | React Native (Expo), TypeScript |
| Sunucu | Node.js, WebSocket (ws) |
| Köprü | PowerShell TCP, C# P/Invoke |
| Girdi | Windows Win32 API (SetCursorPos, SendInput, keybd_event) |
| Tema | Mor koyu tema |

## Lisans

MIT
