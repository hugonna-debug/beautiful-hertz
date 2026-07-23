Add-Type -AssemblyName System.Drawing

Write-Host "=== PUBLIC LPC WEAPONS ==="
$publicWeapons = Get-ChildItem "C:\Users\hudso\.gemini\antigravity\worktrees\beautiful-hertz\feature-creep-clicker-game\public\assets\lpc\weapons" -File
foreach ($f in $publicWeapons) {
    $img = [System.Drawing.Image]::FromFile($f.FullName)
    $rows = $img.Height / 64
    $cols = $img.Width / 64
    Write-Host "$($f.Name) : $($img.Width)x$($img.Height) (Cols=$cols, Rows=$rows)"
    $img.Dispose()
}

Write-Host "`n=== VERIFIED WEAPONS (DESKTOP) ==="
$verifiedPath = "C:\Users\hudso\Desktop\Game Assets\min max standard\verified\verified weapons"
if (Test-Path $verifiedPath) {
    $verifiedWeapons = Get-ChildItem $verifiedPath -File -Filter "*.png"
    foreach ($f in $verifiedWeapons) {
        $img = [System.Drawing.Image]::FromFile($f.FullName)
        $rows = $img.Height / 64
        $cols = $img.Width / 64
        Write-Host "$($f.Name) : $($img.Width)x$($img.Height) (Cols=$cols, Rows=$rows)"
        $img.Dispose()
    }
} else {
    Write-Host "Verified path not found: $verifiedPath"
}
