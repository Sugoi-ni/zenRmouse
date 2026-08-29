using System;
using System.Runtime.InteropServices;
using System.Text;
using System.Collections.Generic;

public static class InputHelper
{
    [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
    [DllImport("user32.dll")] public static extern bool GetCursorPos(out POINT p);
    [DllImport("user32.dll")] public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, UIntPtr dwExtraInfo);
    [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);
    [DllImport("user32.dll")] public static extern int GetSystemMetrics(int nIndex);

    [StructLayout(LayoutKind.Sequential)]
    public struct POINT { public int X; public int Y; }

    [StructLayout(LayoutKind.Sequential)]
    public struct INPUT { public uint type; public InputUnion U; }
    [StructLayout(LayoutKind.Explicit)]
    public struct InputUnion {
        [FieldOffset(0)] public KEYBDINPUT ki;
        [FieldOffset(0)] public MOUSEINPUT mi;
    }
    [StructLayout(LayoutKind.Sequential)]
    public struct KEYBDINPUT {
        public ushort wVk;
        public ushort wScan;
        public uint dwFlags;
        public uint time;
        public UIntPtr dwExtraInfo;
    }
    [StructLayout(LayoutKind.Sequential)]
    public struct MOUSEINPUT {
        public int dx;
        public int dy;
        public uint mouseData;
        public uint dwFlags;
        public uint time;
        public UIntPtr dwExtraInfo;
    }

    [DllImport("user32.dll", SetLastError = true)]
    static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

    const uint MOUSEEVENTF_LEFTDOWN   = 0x0002;
    const uint MOUSEEVENTF_LEFTUP     = 0x0004;
    const uint MOUSEEVENTF_RIGHTDOWN  = 0x0008;
    const uint MOUSEEVENTF_RIGHTUP    = 0x0010;
    const uint MOUSEEVENTF_MIDDLEDOWN = 0x0020;
    const uint MOUSEEVENTF_MIDDLEUP   = 0x0040;
    const uint MOUSEEVENTF_WHEEL      = 0x0800;
    const uint MOUSEEVENTF_WHEEL_DELTA = 120;
    const uint KEYEVENTF_KEYUP      = 0x0002;
    const uint KEYEVENTF_SCANCODE   = 0x0008;
    const uint KEYEVENTF_EXTENDEDKEY = 0x0001;
    const uint KEYEVENTF_UNICODE    = 0x0004;
    const int SM_CXSCREEN = 0;
    const int SM_CYSCREEN = 1;

    static readonly Dictionary<string, byte> _vk = new Dictionary<string, byte>(StringComparer.OrdinalIgnoreCase)
    {
        {"A",0x41},{"B",0x42},{"C",0x43},{"D",0x44},{"E",0x45},{"F",0x46},{"G",0x47},{"H",0x48},
        {"I",0x49},{"J",0x4A},{"K",0x4B},{"L",0x4C},{"M",0x4D},{"N",0x4E},{"O",0x4F},{"P",0x50},
        {"Q",0x51},{"R",0x52},{"S",0x53},{"T",0x54},{"U",0x55},{"V",0x56},{"W",0x57},{"X",0x58},
        {"Y",0x59},{"Z",0x5A},
        {"0",0x30},{"1",0x31},{"2",0x32},{"3",0x33},{"4",0x34},{"5",0x35},{"6",0x36},{"7",0x37},{"8",0x38},{"9",0x39},
        {"ENTER",0x0D},{"RETURN",0x0D},{"ESC",0x1B},{"ESCAPE",0x1B},{"TAB",0x09},{"SPACE",0x20},
        {"BACKSPACE",0x08},{"DELETE",0x2E},{"CTRL",0x11},{"CONTROL",0x11},{"SHIFT",0x10},{"ALT",0x12},
        {"WIN",0x5B},{"META",0x5B},{"LEFT",0x25},{"UP",0x26},{"RIGHT",0x27},{"DOWN",0x28},
        {"HOME",0x24},{"END",0x23},{"PAGEUP",0x21},{"PAGEDOWN",0x22},
        {"F1",0x70},{"F2",0x71},{"F3",0x72},{"F4",0x73},{"F5",0x74},{"F6",0x75},{"F7",0x76},{"F8",0x77},{"F9",0x78},{"F10",0x79},{"F11",0x7A},{"F12",0x7B},
        {"CAPSLOCK",0x14},{"NUMLOCK",0x90},{"SCROLLLOCK",0x91}
    };

    public static string Screen()
    {
        int w = GetSystemMetrics(SM_CXSCREEN);
        int h = GetSystemMetrics(SM_CYSCREEN);
        return w.ToString() + "," + h.ToString();
    }

    public static void Move(int x, int y)
    {
        int w = GetSystemMetrics(SM_CXSCREEN);
        int h = GetSystemMetrics(SM_CYSCREEN);
        if (x < 0) x = 0; if (x >= w) x = w - 1;
        if (y < 0) y = 0; if (y >= h) y = h - 1;
        SetCursorPos(x, y);
    }

    public static void MouseClick(string button)
    {
        uint d = 0, u = 0;
        switch (button.ToLower())
        {
            case "left":   d = MOUSEEVENTF_LEFTDOWN;   u = MOUSEEVENTF_LEFTUP;   break;
            case "right":  d = MOUSEEVENTF_RIGHTDOWN;  u = MOUSEEVENTF_RIGHTUP;  break;
            case "middle": d = MOUSEEVENTF_MIDDLEDOWN; u = MOUSEEVENTF_MIDDLEUP; break;
            default: return;
        }
        mouse_event(d, 0, 0, 0, UIntPtr.Zero);
        mouse_event(u, 0, 0, 0, UIntPtr.Zero);
    }

    public static void MouseDown(string button)
    {
        uint d = 0;
        switch (button.ToLower())
        {
            case "left":   d = MOUSEEVENTF_LEFTDOWN;   break;
            case "right":  d = MOUSEEVENTF_RIGHTDOWN;  break;
            case "middle": d = MOUSEEVENTF_MIDDLEDOWN; break;
            default: return;
        }
        mouse_event(d, 0, 0, 0, UIntPtr.Zero);
    }

    public static void MouseUp(string button)
    {
        uint u = 0;
        switch (button.ToLower())
        {
            case "left":   u = MOUSEEVENTF_LEFTUP;   break;
            case "right":  u = MOUSEEVENTF_RIGHTUP;  break;
            case "middle": u = MOUSEEVENTF_MIDDLEUP; break;
            default: return;
        }
        mouse_event(u, 0, 0, 0, UIntPtr.Zero);
    }

    public static void Scroll(int amt)
    {
        if (amt == 0) return;
        uint data = (uint)(MOUSEEVENTF_WHEEL_DELTA * amt);
        mouse_event(MOUSEEVENTF_WHEEL, 0, 0, data, UIntPtr.Zero);
    }

    static byte VkOf(string name)
    {
        if (name.Length == 1)
        {
            char c = name[0];
            if (c >= 'a' && c <= 'z') return (byte)(c - 'a' + 0x41);
            if (c >= 'A' && c <= 'Z') return (byte)(c - 'A' + 0x41);
            if (c >= '0' && c <= '9') return (byte)(c - '0' + 0x30);
        }
        byte v;
        if (_vk.TryGetValue(name, out v)) return v;
        return 0;
    }

    public static void Tap(byte vk)
    {
        if (vk == 0) return;
        keybd_event(vk, 0, 0, UIntPtr.Zero);
        keybd_event(vk, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
    }

    public static void TapKey(string name)
    {
        Tap(VkOf(name));
    }

    public static void Type(string text)
    {
        foreach (char c in text)
        {
            if (c == '\r' || c == '\n') { Tap(0x0D); continue; }
            if (c == '\t') { Tap(0x09); continue; }

            // Tum karakterler icin Unicode kullan (klavey duzeninden bagimsiz)
            SendUnicodeChar(c);
        }
    }

    static void SendUnicodeChar(char c)
    {
        INPUT[] inputs = new INPUT[2];

        // Key down
        inputs[0].type = 1; // INPUT_KEYBOARD
        inputs[0].U.ki.wVk = 0;
        inputs[0].U.ki.wScan = (ushort)c;
        inputs[0].U.ki.dwFlags = KEYEVENTF_UNICODE;
        inputs[0].U.ki.time = 0;
        inputs[0].U.ki.dwExtraInfo = UIntPtr.Zero;

        // Key up
        inputs[1].type = 1;
        inputs[1].U.ki.wVk = 0;
        inputs[1].U.ki.wScan = (ushort)c;
        inputs[1].U.ki.dwFlags = KEYEVENTF_UNICODE | KEYEVENTF_KEYUP;
        inputs[1].U.ki.time = 0;
        inputs[1].U.ki.dwExtraInfo = UIntPtr.Zero;

        SendInput(2, inputs, Marshal.SizeOf(typeof(INPUT)));
    }

    public static void Hotkey(string modsArg, string keyName)
    {
        string[] mods = modsArg.Split(new char[] {' '}, StringSplitOptions.RemoveEmptyEntries);
        List<byte> down = new List<byte>();
        foreach (string m in mods)
        {
            byte vk = VkOf(m);
            if (vk != 0) { keybd_event(vk, 0, 0, UIntPtr.Zero); down.Add(vk); }
        }
        byte kv = VkOf(keyName);
        if (kv != 0)
        {
            keybd_event(kv, 0, 0, UIntPtr.Zero);
            keybd_event(kv, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        }
        for (int i = down.Count - 1; i >= 0; i--)
            keybd_event(down[i], 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
    }

    static void SendScan(ushort scan, uint flags)
    {
        INPUT[] inputs = new INPUT[1];
        inputs[0].type = 1;
        inputs[0].U.ki.wVk = 0;
        inputs[0].U.ki.wScan = scan;
        inputs[0].U.ki.dwFlags = flags | KEYEVENTF_SCANCODE;
        inputs[0].U.ki.time = 0;
        inputs[0].U.ki.dwExtraInfo = UIntPtr.Zero;
        SendInput(1, inputs, Marshal.SizeOf(typeof(INPUT)));
    }

    // VK codes for media keys (0x00 prefix = no extended, 0x01 prefix = extended)
    static readonly Dictionary<string, ushort> _mediaVk = new Dictionary<string, ushort>(StringComparer.OrdinalIgnoreCase)
    {
        {"volumeup",   0xAF},
        {"volumedown", 0xAE},
        {"mute",       0xAD},
        {"next",       0xB0},
        {"prev",       0xB1},
        {"playpause",  0xB3},
        {"stop",       0xB2},
    };

    public static void Media(string key)
    {
        ushort vk;
        if (!_mediaVk.TryGetValue(key, out vk)) return;

        INPUT[] inputs = new INPUT[2];

        // Key down
        inputs[0].type = 1; // INPUT_KEYBOARD
        inputs[0].U.ki.wVk = vk;
        inputs[0].U.ki.wScan = 0;
        inputs[0].U.ki.dwFlags = KEYEVENTF_EXTENDEDKEY;
        inputs[0].U.ki.time = 0;
        inputs[0].U.ki.dwExtraInfo = UIntPtr.Zero;

        // Key up
        inputs[1].type = 1;
        inputs[1].U.ki.wVk = vk;
        inputs[1].U.ki.wScan = 0;
        inputs[1].U.ki.dwFlags = KEYEVENTF_EXTENDEDKEY | KEYEVENTF_KEYUP;
        inputs[1].U.ki.time = 0;
        inputs[1].U.ki.dwExtraInfo = UIntPtr.Zero;

        SendInput(2, inputs, Marshal.SizeOf(typeof(INPUT)));
    }
}
