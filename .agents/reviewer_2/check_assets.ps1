Add-Type -AssemblyName System.Drawing

$noRenderEnemiesPath = "C:\Users\hudso\Desktop\Game Assets\min max standard\no render\no render enemies"
$noRenderWeaponsPath = "C:\Users\hudso\Desktop\Game Assets\min max standard\no render\no render weapons"
$verifiedEnemiesPath = "C:\Users\hudso\Desktop\Game Assets\min max standard\verified\verified enemies"

Write-Host "=== NO RENDER ENEMIES ==="
if (Test-Path $noRenderEnemiesPath) {
    $nre = Get-ChildItem $noRenderEnemiesPath -File
    Write-Host "Count:" $nre.Count
    foreach ($f in $nre) {
        $img = [System.Drawing.Image]::FromFile($f.FullName)
        Write-Host "File:" $f.Name "Size:" "$($img.Width)x$($img.Height)"
        $img.Dispose()
    }
} else {
    Write-Host "Path does not exist: $noRenderEnemiesPath"
}

Write-Host "`n=== NO RENDER WEAPONS ==="
if (Test-Path $noRenderWeaponsPath) {
    $nrw = Get-ChildItem $noRenderWeaponsPath -File
    Write-Host "Count:" $nrw.Count
} else {
    Write-Host "Path does not exist: $noRenderWeaponsPath"
}

Write-Host "`n=== VERIFIED ENEMIES ==="
if (Test-Path $verifiedEnemiesPath) {
    $ve = Get-ChildItem $verifiedEnemiesPath -File
    Write-Host "Count:" $ve.Count
    $non64x64Count = 0
    foreach ($f in $ve) {
        $img = [System.Drawing.Image]::FromFile($f.FullName)
        if ($img.Width -ne 64 -or $img.Height -ne 64) {
            Write-Host "NON 64x64:" $f.Name "Size:" "$($img.Width)x$($img.Height)"
            $non64x64Count++
        }
        $img.Dispose()
    }
    Write-Host "Non 64x64 enemies count:" $non64x64Count
} else {
    Write-Host "Path does not exist: $verifiedEnemiesPath"
}
