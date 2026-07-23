$noRenderWeaponsPath = "C:\Users\hudso\Desktop\Game Assets\min max standard\no render\no render weapons"
$verifiedWeaponsPath = "C:\Users\hudso\Desktop\Game Assets\min max standard\verified\verified weapons"

if (Test-Path $noRenderWeaponsPath) {
    $files = [System.IO.Directory]::GetFiles($noRenderWeaponsPath)
    Write-Host "no render weapons count:" $files.Count
}

if (Test-Path $verifiedWeaponsPath) {
    $filesV = [System.IO.Directory]::GetFiles($verifiedWeaponsPath)
    Write-Host "verified weapons count:" $filesV.Count
} else {
    Write-Host "verified weapons dir does not exist or was moved"
}
