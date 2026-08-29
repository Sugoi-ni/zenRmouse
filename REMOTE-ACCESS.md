# Remote Access Setup (Mobile Data)

## Option: Tailscale (Recommended - Free)

Tailscale creates a private VPN between your devices. Works from anywhere.

### Setup Steps:

1. **Install Tailscale on PC**
   - Download: https://tailscale.com/download
   - Login with Google/Microsoft/GitHub

2. **Install Tailscale on Phone**
   - Download from App Store / Play Store
   - Login with SAME account

3. **Start ZenRmouse**
   - Run `start-remote.bat`
   - It will use your Tailscale IP automatically

4. **Connect from Phone**
   - Open the app
   - Scan QR code or enter Tailscale IP manually

### How it works:
- Tailscale gives your PC a static IP (like 100.x.x.x)
- This IP works from anywhere in the world
- No port forwarding needed
- Free for personal use

### Alternative: Phone Hotspot
- Turn on phone hotspot
- Connect PC to phone's WiFi
- Start normally with `start.bat`
