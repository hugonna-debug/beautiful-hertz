Add-Type -AssemblyName System.Drawing

function Deep-Audit-PNGs($folderPath, $folderLabel) {
    Write-Host "=== Deep Audit: $folderLabel ($folderPath) ==="
    if (-not (Test-Path $folderPath)) {
        Write-Host "Directory missing!"
        return
    }

    $files = Get-ChildItem -Path $folderPath -Filter *.png
    Write-Host "Total PNG files: $($files.Count)"
    
    $corrupt = @()
    $zeroSize = @()
    $non64 = @()
    $blankAlpha = @()

    foreach ($f in $files) {
        if ($f.Length -eq 0) {
            $zeroSize += $f.Name
            continue
        }
        try {
            $bmp = [System.Drawing.Bitmap]::FromFile($f.FullName)
            if ($bmp.Width -ne 64 -or $bmp.Height -ne 64) {
                $non64 += [PSCustomObject]@{ Name=$f.Name; Dimensions="$($bmp.Width)x$($bmp.Height)" }
            }
            # Sample alpha pixels to check if image is entirely transparent
            $hasPixel = $false
            for ($x = 0; $x -lt $bmp.Width; $x += 8) {
                for ($y = 0; $y -lt $bmp.Height; $y += 8) {
                    $pixel = $bmp.GetPixel($x, $y)
                    if ($pixel.A -gt 0) {
                        $hasPixel = $true
                        break
                    }
                }
                if ($hasPixel) { break }
            }
            if (-not $hasPixel) {
                $blankAlpha += $f.Name
            }
            $bmp.Dispose()
        } catch {
            $corrupt += $f.Name
        }
    }

    Write-Host "Zero-size files ($($zeroSize.Count)): $($zeroSize -join ', ')"
    Write-Host "Corrupt files ($($corrupt.Count)): $($corrupt -join ', ')"
    Write-Host "Non-64x64 files ($($non64.Count))"
    foreach ($n in $non64) { Write-Host "  - $($n.Name) ($($n.Dimensions))" }
    Write-Host "Completely blank/transparent sampled ($($blankAlpha.Count)): $($blankAlpha -join ', ')"
}

Deep-Audit-PNGs "C:\Users\hudso\Desktop\Game Assets\min max standard\verified\verified body" "Verified Body"
Deep-Audit-PNGs "C:\Users\hudso\Desktop\Game Assets\min max standard\verified\verified boots" "Verified Boots"
