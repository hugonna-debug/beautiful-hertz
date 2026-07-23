Add-Type -AssemblyName System.Drawing

function Inspect-Dir-Recursive($path) {
    Write-Host "=== Searching: $path ==="
    if (Test-Path $path) {
        Get-ChildItem -Path $path -Recurse -Filter *.png | ForEach-Object {
            try {
                $img = [System.Drawing.Image]::FromFile($_.FullName)
                Write-Host "$($_.FullName.Replace($path, '')) | $($img.Width)x$($img.Height)"
                $img.Dispose()
            } catch {
                Write-Host "ERR reading $($_.FullName)"
            }
        }
    } else {
        Write-Host "Path not found: $path"
    }
}

Inspect-Dir-Recursive "C:\Users\hudso\Desktop\Game Assets\min max standard"
