Add-Type -AssemblyName System.Drawing

function Check-All-Pixels($folderPath, $folderName) {
    Write-Host "Checking all files in ${folderName} (${folderPath})..."
    if (-not (Test-Path $folderPath)) {
        Write-Host "Folder does not exist!"
        return
    }
    $files = Get-ChildItem -Path $folderPath -Filter *.png
    $zeroPixels = @()
    $non64 = @()
    $corrupt = @()

    foreach ($f in $files) {
        try {
            $bmp = [System.Drawing.Bitmap]::FromFile($f.FullName)
            if ($bmp.Width -ne 64 -or $bmp.Height -ne 64) {
                $non64 += "$($f.Name) ($($bmp.Width)x$($bmp.Height))"
            }
            $hasPixels = $false
            for ($x = 0; $x -lt $bmp.Width; $x++) {
                for ($y = 0; $y -lt $bmp.Height; $y++) {
                    if ($bmp.GetPixel($x, $y).A -gt 0) {
                        $hasPixels = $true
                        break
                    }
                }
                if ($hasPixels) { break }
            }
            if (-not $hasPixels) {
                $zeroPixels += $f.Name
            }
            $bmp.Dispose()
        } catch {
            $corrupt += $f.Name
        }
    }

    Write-Host "Result for ${folderName}:"
    Write-Host "  - Non-64x64 count: $($non64.Count) $($non64 -join ', ')"
    Write-Host "  - Completely empty (0 pixels) count: $($zeroPixels.Count) $($zeroPixels -join ', ')"
    Write-Host "  - Corrupt count: $($corrupt.Count) $($corrupt -join ', ')"
}

Check-All-Pixels "C:\Users\hudso\Desktop\Game Assets\min max standard\verified\verified body" "Verified Body"
Check-All-Pixels "C:\Users\hudso\Desktop\Game Assets\min max standard\verified\verified boots" "Verified Boots"
Check-All-Pixels "C:\Users\hudso\Desktop\Game Assets\min max standard\no render\no render body" "No Render Body"
Check-All-Pixels "C:\Users\hudso\Desktop\Game Assets\min max standard\no render\no render boots" "No Render Boots"
