Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\Arif\WiiCtl\server"
WshShell.Run "node src\index.js", 0, False
