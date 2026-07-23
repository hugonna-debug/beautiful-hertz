Add-Type -AssemblyName System.Drawing

function Audit-Folder($folderPath, $folderName) {
    Write-Host "=========================================="
    Write-Host "Auditing ${folderName} - ${folderPath}"
    Write-Host "=========================================="
    if (-not (Test-Path $folderPath)) {
        Write-Host "Folder does NOT exist: ${folderPath}"
        return
    }
    $files = Get-ChildItem -Path $folderPath -Filter *.png
    Write-Host "Total PNG count: $($files.Count)"
    
    $stats = @{}
    $non64 = @()

    foreach ($f in $files) {
        try {
            $img = [System.Drawing.Image]::FromFile($f.FullName)
            $w = $img.Width
            $h = $img.Height
            $key = "${w}x${h}"
            if (-not $stats.ContainsKey($key)) { $stats[$key] = 0 }
            $stats[$key]++

            if ($w -ne 64 -or $h -ne 64) {
                $non64 += [PSCustomObject]@{ Name=$f.Name; Width=$w; Height=$h; FullPath=$f.FullName }
            }

            $img.Dispose()
        } catch {
            Write-Host "ERROR reading $($f.Name): $_"
        }
    }

    Write-Host "Dimension Summary:"
    foreach ($k in $stats.Keys) {
        Write-Host "  $k : $($stats[$k]) files"
    }

    if ($non64.Count -gt 0) {
        Write-Host "`nNon-64x64 Files ($($non64.Count) files):"
        foreach ($item in $non64) {
            Write-Host "  - $($item.Name) : $($item.Width)x$($item.Height)"
        }
    } else {
        Write-Host "`nAll files in this folder are 64x64 icon images!"
    }
}

Audit-Folder "C:\Users\hudso\Desktop\Game Assets\min max standard\verified\verified body" "Verified Body"
Audit-Folder "C:\Users\hudso\Desktop\Game Assets\min max standard\verified\verified boots" "Verified Boots"
Audit-Folder "C:\Users\hudso\Desktop\Game Assets\min max standard\no render\no render body" "No Render Body"
Audit-Folder "C:\Users\hudso\Desktop\Game Assets\min max standard\no render\no render boots" "No Render Boots"
