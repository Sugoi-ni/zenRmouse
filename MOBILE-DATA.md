# Mobile Data Setup Guide

## Option 1: Phone Hotspot (Easiest)

1. Open phone's **Hotspot** settings
2. Turn on mobile hotspot
3. Connect your **PC** to the phone's WiFi hotspot
4. Start ZenRmouse normally with `start.bat`
5. Open the app — it will find the PC automatically

## Option 2: Same WiFi Network

1. Connect both PC and phone to the same WiFi
2. Start ZenRmouse with `start.bat`
3. Open the app — scan QR or enter IP manually

## Troubleshooting

- **"Unable to load script"**: Make sure Metro is running (green window)
- **Connection failed**: Check if PC firewall allows port 8321
- **Can't find IP**: Run `ipconfig` in CMD and look for "IPv4 Address"
