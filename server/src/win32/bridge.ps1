# WiiCtl Win32 input bridge — TCP version
# Listens on a local TCP port, reads commands, writes results.
# Node server creates the TCP socket; this script connects to it.
Param([int]$Port = 8322)

$csPath = Join-Path (Split-Path $MyInvocation.MyCommand.Path) "InputHelper.cs"
Add-Type -Path $csPath -ErrorAction Stop

$endpoint = New-Object System.Net.IPEndPoint([System.Net.IPAddress]::Loopback, $Port)
$client = New-Object System.Net.Sockets.TcpClient
$client.Connect($endpoint)
$stream = $client.GetStream()
$reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
$writer = New-Object System.IO.StreamWriter($stream, [System.Text.Encoding]::UTF8)
$writer.AutoFlush = $true

try {
    while ($true) {
        $line = $reader.ReadLine()
        if ($null -eq $line) { break }
        $line = $line.Trim()
        if ($line.Length -eq 0) { continue }

        $parts = $line.Split(' ')
        $verb = $parts[0].ToUpperInvariant()

        try {
            switch ($verb) {
                "QUIT"   { $writer.WriteLine("OK:bye"); break }
                "MOVE"   { [InputHelper]::Move([int]$parts[1], [int]$parts[2]) }
                "CLICK"  { [InputHelper]::MouseClick($parts[1]) }
                "DOWN"   { [InputHelper]::MouseDown($parts[1]) }
                "UP"     { [InputHelper]::MouseUp($parts[1]) }
                "SCROLL" { [InputHelper]::Scroll([int]$parts[1]) }
                "TAP"    { [InputHelper]::Tap([byte]$parts[1]) }
                "TAPK"   { [InputHelper]::TapKey($parts[1]) }
                "TYPE" {
                    $rest = $line.Substring($parts[0].Length + 1)
                    [InputHelper]::Type($rest)
                }
                "HOTKEY" { [InputHelper]::Hotkey($parts[1], $parts[2]) }
                "MEDIA"  { [InputHelper]::Media($parts[1]) }
                "SCREEN" {
                    $result = [InputHelper]::Screen()
                    $writer.WriteLine("OK:" + $result)
                    continue
                }
                default {
                    $writer.WriteLine("ERR:unknown $verb")
                    continue
                }
            }
            $writer.WriteLine("OK")
        }
        catch {
            $writer.WriteLine("ERR:" + $_.Exception.Message)
        }
    }
}
finally {
    $reader.Close()
    $writer.Close()
    $client.Close()
}
