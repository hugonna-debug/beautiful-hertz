Add-Type -AssemblyName System.Drawing

$verifiedPath = "C:\Users\hudso\Desktop\Game Assets\min max standard\verified\verified weapons"
$noRenderPath = "C:\Users\hudso\Desktop\Game Assets\min max standard\no render\no render weapons"

$files = Get-ChildItem $verifiedPath -File -Recurse -Filter "*.png"

$validLpc = @()
$invalidIcons = @()

foreach ($f in $files) {
    try {
        $img = [System.Drawing.Image]::FromFile($f.FullName)
        $w = $img.Width
        $h = $img.Height
        $img.Dispose()

        if ($w -ge 832 -and ($h -eq 256 -or $h -eq 384 -or $h -eq 1344)) {
            $validLpc += [PSCustomObject]@{ Name=$f.Name; Width=$w; Height=$h; FullPath=$f.FullName }
        } else {
            $invalidIcons += [PSCustomObject]@{ Name=$f.Name; Width=$w; Height=$h; FullPath=$f.FullName }
        }
    } catch {
        $invalidIcons += [PSCustomObject]@{ Name=$f.Name; Width=0; Height=0; FullPath=$f.FullName }
    }
}

Write-Host "=== AUDIT RESULT (RECURSIVE) ==="
Write-Host "Total PNG files evaluated: $($files.Count)"
Write-Host "Valid LPC Weapon Sheets: $($validLpc.Count)"
Write-Host "Incompatible / Single Icons (No Render): $($invalidIcons.Count)"

Write-Host "`n--- Size Breakdown ---"
$invalidGrouped = $invalidIcons | Group-Object -Property Width, Height
foreach ($g in $invalidGrouped) {
    Write-Host "$($g.Count) files with size $($g.Name)"
}
