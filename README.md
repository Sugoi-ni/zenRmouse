# ZenRmouse

Phone-to-PC remote control application. Use your phone as a wireless mouse, keyboard, and media controller over WiFi.

## Features

- **Touch Mouse** — Tap to click, drag to move, double-tap-hold for drag mode, two-finger scroll
- **Motion Mouse** — Accelerometer-based cursor control with calibration
- **Keyboard** — Full Unicode support (Turkish and all characters), common hotkeys (Ctrl+C, Alt+Tab, etc.)
- **Media Keys** — Volume up/down, mute, play/pause, next/previous track, stop
- **QR Code Pairing** — Scan QR code to connect automatically
- **Auto-Reconnect** — App reconnects when returning from background

## Architecture

```
┌─────────────┐    WiFi/WebSocket    ┌──────────────┐    TCP    ┌──────────────┐
│  React      │ ───────────────────► │  Node.js     │ ───────► │  PowerShell  │
│  Native     │                      │  Server      │          │  Bridge      │
│  (Expo)     │ ◄─────────────────── │  (WS:8321)   │ ◄─────── │  (TCP:8322)  │
└─────────────┘                      └──────────────┘          └──────┬───────┘
                                                                     │
                                                              ┌──────▼───────┐
                                                              │  C# P/Invoke │
                                                              │  (InputHelper)│
                                                              └──────┬───────┘
                                                                     │
                                                              ┌──────▼───────┐
                                                              │  Windows     │
                                                              │  Win32 API   │
                                                              └──────────────┘
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Mobile | React Native (Expo), TypeScript |
| Server | Node.js, WebSocket |
| Bridge | PowerShell TCP, C# P/Invoke |
| Input | Windows Win32 API (SetCursorPos, SendInput, keybd_event) |

## Prerequisites

- **Windows PC** with PowerShell 5.1+
- **Node.js** v18+
- **JDK 17** (for Android build)
- **Android SDK** (for APK build)
- **Android phone** with USB debugging enabled

## Quick Start

### 1. Start Server (on PC)

```bash
cd server
npm install
node src/index.js
```

Server runs on:
- WebSocket: `ws://YOUR_IP:8321`
- QR Code page: `http://YOUR_IP:8320`

### 2. Build & Install Mobile App

```bash
cd mobile
npm install

# Set environment variables
$env:JAVA_HOME = "C:\path\to\jdk17"
$env:ANDROID_HOME = "C:\path\to\Android\Sdk"

# Build
cd android
.\gradlew.bat assembleDebug

# Install to phone
adb install app\build\outputs\apk\debug\app-debug.apk
```

### 3. Connect

1. Open ZenRmouse on phone
2. Open `http://YOUR_PC_IP:8320` in PC browser
3. Scan QR code from phone app
4. Done!

## Alternative: Manual Connection

Enter IP address and port manually instead of scanning QR code.

## Auto-Start Server on Boot

Run `start-server.vbs` to add server to Windows startup.

## License

MIT
