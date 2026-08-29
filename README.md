# ZenRmouse

Turn your phone into a wireless mouse, keyboard, and media controller over WiFi.

```
Phone (Expo) ──WiFi/WebSocket──► Node.js Server ──TCP──► PowerShell Bridge ──► Win32 API ──► Cursor movement, clicks, key presses
```

## Features

| Feature | Description |
|---------|-------------|
| **Touch Mouse** | Swipe to move cursor, tap to click, drag mode, two-finger scroll |
| **Motion Mouse** | Tilt your phone to control the cursor (accelerometer) |
| **Keyboard** | Full Unicode support (Turkish and all languages), hotkeys (Ctrl+C, Alt+Tab, etc.) |
| **Media Keys** | Volume up/down, mute, play/pause, next/previous track, stop |
| **QR Code Pairing** | Scan QR code to connect automatically |
| **Auto-Reconnect** | Reconnects when returning from background |

## Architecture

```
┌─────────────────┐     WiFi/WebSocket      ┌──────────────┐      TCP       ┌────────────────┐
│                 │ ──────────────────────►  │              │ ────────────►  │                │
│  Phone App      │                          │  Node.js     │               │  PowerShell    │
│  (React Native) │ ◄──────────────────────  │  Server      │ ◄────────────  │  Bridge        │
│                 │                          │  (WS:8321)   │               │  (TCP:8322)    │
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

## Requirements

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Windows** | 10/11 | PowerShell 5.1+ required (pre-installed) |
| **Node.js** | v18+ | For running the server |
| **JDK** | 17 | For building APK only |
| **Android SDK** | Any | For building APK + ADB only |
| **Android Phone** | USB debugging enabled | For installing APK |

> **Note:** JDK and Android SDK are only needed to build the APK. You can skip them if you use a pre-built APK.

## Installation

### Step 1: Clone the Repo

```bash
git clone https://github.com/Sugoi-ni/zenRmouse.git
cd zenRmouse
```

### Step 2: Run Setup

```bash
setup.bat
```

This will:
- Create desktop shortcuts
- Set up auto-start on boot
- Install server dependencies (`npm install`)

### Step 3: Start the Server

```bash
start.bat
```

Or manually from terminal:

```bash
cd server
npm install
node src/index.js
```

You should see:

```
==================================================
  ZenRmouse Server Started!
==================================================
  QR page:    http://192.168.1.8:8320
  WebSocket:  ws://192.168.1.8:8321
  Screen:     1920x1080
==================================================
```

### Step 4: Install the APK

**Option A: Build it yourself** (requires JDK + Android SDK):

```bash
build.bat
```

**Option B: Use a pre-built APK** (recommended):

Install `app-debug.apk` on your phone:
1. Connect USB cable
2. Run `adb install app-debug.apk`
3. Or transfer the APK to your phone and install it

### Step 5: Connect

1. Open ZenRmouse on your phone
2. Enter your PC's IP address (e.g., `192.168.1.8`)
3. Port: `8321`
4. Tap **Connect**
5. Green dot = connected!

> **Alternative:** Open `http://192.168.1.8:8320` in your PC browser to generate a QR code and scan it from the phone app.

## Usage

### Touch Mouse

- **Swipe** → Move cursor
- **Tap** → Left click
- **Two-finger swipe** → Scroll
- **Long press + drag** → Drag mode (double-tap and hold)

### Motion Mouse

- **Tilt phone** → Move cursor
- **Calibrate** → Tap screen to set center point

### Keyboard

- **Text input** → Turkish and Unicode character support
- **Control keys** → Enter, Space, Tab, Escape, Backspace
- **Shortcuts** → Ctrl+C, Ctrl+V, Alt+Tab, Windows key
- **Arrow keys** → Up, Down, Left, Right
- **F keys** → F1 - F12

### Media

- **Volume +/-** → Volume up/down
- **Mute** → Mute all sound
- **Play/Pause** → Music/video control
- **Next/Previous** → Skip track
- **Stop** → Stop playback

## Troubleshooting

### "bridge not connected" error

The PowerShell bridge can't connect to the server:

```bash
# Kill all processes and restart
taskkill /F /IM node.exe
taskkill /F /IM powershell.exe
start.bat
```

### Phone can't connect to server

1. Are PC and phone on the same WiFi network?
2. Is Windows Firewall blocking port 8321?
3. Is the IP address correct? (check with `ipconfig`)

### Metro bundler not running

```bash
cd mobile
npx expo start --dev-client
```

### ADB not connected

```bash
# Make sure USB debugging is enabled
adb devices
adb reverse tcp:8081 tcp:8081
```

### Media keys not working

Media keys use Win32 VK codes. If they don't work:
1. Restart the server and bridge
2. Close and reopen the app

## Project Structure

```
zenRmouse/
├── server/                  # Node.js server
│   ├── src/
│   │   ├── index.js         # WebSocket + HTTP server
│   │   └── win32/
│   │       ├── bridge.js    # TCP bridge manager
│   │       ├── bridge.ps1   # PowerShell TCP client
│   │       └── InputHelper.cs  # C# Win32 API wrapper
│   └── package.json
├── mobile/                  # React Native (Expo) app
│   ├── src/
│   │   ├── screens/         # Connection, Control screens
│   │   ├── components/      # Touchpad, Motion, Keyboard, Media
│   │   └── ws/              # WebSocket hook
│   ├── App.tsx
│   └── android/             # Android build files
├── desktop/                 # Desktop shortcut scripts
├── setup.bat                # One-click setup
├── start.bat                # Start server + Metro
├── build.bat                # Build APK + install
└── README.md
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Mobile | React Native (Expo), TypeScript |
| Server | Node.js, WebSocket (ws) |
| Bridge | PowerShell TCP, C# P/Invoke |
| Input | Windows Win32 API (SetCursorPos, SendInput, keybd_event) |
| Theme | Purple dark theme |

## License

MIT
