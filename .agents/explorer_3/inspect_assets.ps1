Add-Type -AssemblyName System.Drawing

function Inspect-Dir($path, $label) {
    Write-Host "=== $label ==="
    if (Test-Path $path) {
        $files = Get-ChildItem -Path $path -Filter *.png
        Write-Host "Total PNG files: $($files.Count)"
        $groups = @{}
        foreach ($f in $files) {
            try {
                $img = [System.Drawing.Image]::FromFile($f.FullName)
                $key = "$($img.Width)x$($img.Height)"
                if (-not $groups.ContainsKey($key)) {
                    $groups[$key] = @()
                }
                $groups[$key] += $f.Name
                $img.Dispose()
            } catch {
                Write-Host "Failed to read $($f.Name): $_"
            }
        }
        foreach ($key in $groups.Keys) {
            Write-Host "Dimension $key : $($groups[$key].Count) files"
            Write-Host "  Examples: $($groups[$key][0..4] -join ', ')"
        }
    } else {
        Write-Host "Directory not found: $path"
    }
    Write-Host ""
}

Inspect-Dir "C:\Users\hudso\Desktop\Game Assets\min max standard\verified\verified body" "VERIFIED BODY"
Inspect-Dir "C:\Users\hudso\Desktop\Game Assets\min max standard\verified\verified boots" "VERIFIED BOOTS"
Inspect-Dir "C:\Users\hudso\Desktop\Game Assets\no render\no render body" "NO RENDER BODY"
Inspect-Dir "C:\Users\hudso\Desktop\Game Assets\no render\no render boots" "NO RENDER BOOTS"

# Also check project assets folder in feature-creep-clicker-game / public / src if any
