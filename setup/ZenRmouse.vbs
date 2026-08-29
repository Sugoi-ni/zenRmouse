Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Auto-detect repo location
Dim repoPath
repoPath = ""

' Check common locations
Dim locations
locations = Array( _
    WshShell.ExpandEnvironmentStrings("%USERPROFILE%") & "\WiiCtl", _
    WshShell.ExpandEnvironmentStrings("%USERPROFILE%") & "\zenRmouse", _
    "C:\WiiCtl", _
    "C:\zenRmouse", _
    "D:\WiiCtl", _
    "D:\zenRmouse" _
)

For Each loc In locations
    If fso.FileExists(loc & "\server\src\index.js") Then
        repoPath = loc
        Exit For
    End If
Next

If repoPath = "" Then
    WScript.Quit
End If

WshShell.CurrentDirectory = repoPath & "\server"
WshShell.Run "node src\index.js", 0, False
