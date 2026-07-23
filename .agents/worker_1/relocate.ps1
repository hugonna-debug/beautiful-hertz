$srcEnemies = "C:\Users\hudso\Desktop\Game Assets\min max standard\verified\verified enemies"
$dstEnemies = "C:\Users\hudso\Desktop\Game Assets\min max standard\no render\no render enemies"
$srcWeapons = "C:\Users\hudso\Desktop\Game Assets\min max standard\verified\verified weapons"
$dstWeapons = "C:\Users\hudso\Desktop\Game Assets\min max standard\no render\no render weapons"

New-Item -ItemType Directory -Force -Path $dstEnemies | Out-Null
New-Item -ItemType Directory -Force -Path $dstWeapons | Out-Null

$enemyFiles = @(
    "Spritesheet - Base_Charas (1).png",
    "Spritesheet - Base_Charas (1)_mirrored.png",
    "dg_monster532.png",
    "dg_monster532_mirrored.png",
    "dg_monster732.png",
    "dg_monster732_mirrored.png"
)

foreach ($f in $enemyFiles) {
    $p = Join-Path $srcEnemies $f
    if (Test-Path $p) {
        Move-Item -Path $p -Destination (Join-Path $dstEnemies $f) -Force
        Write-Host "Moved enemy: $f"
    } else {
        Write-Host "Enemy file not found in src: $f"
    }
}

$weaponFiles = Get-ChildItem -Path $srcWeapons -Filter *.png -File
Write-Host "Found $($weaponFiles.Count) weapon files to move"
if ($weaponFiles.Count -gt 0) {
    Move-Item -Path "$srcWeapons\*.png" -Destination $dstWeapons -Force
    Write-Host "Moved all $($weaponFiles.Count) weapons to $dstWeapons"
}

$remainingEnemies = (Get-ChildItem -Path $dstEnemies -Filter *.png).Count
$remainingWeapons = (Get-ChildItem -Path $dstWeapons -Filter *.png).Count
Write-Host "Destination enemy count: $remainingEnemies"
Write-Host "Destination weapon count: $remainingWeapons"
