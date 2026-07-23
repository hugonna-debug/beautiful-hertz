$json = Get-Content "public/assets/min_max/min_max_manifest.json" -Raw | ConvertFrom-Json
Write-Host "Enemies count in manifest:" $json.enemies.Length
Write-Host "Weapons count in manifest:" $json.weapons.Length

Write-Host "`nChecking if any moved enemy is in manifest:"
$movedEnemies = @("Spritesheet - Base_Charas (1).png", "Spritesheet - Base_Charas (1)_mirrored.png", "dg_monster532.png", "dg_monster532_mirrored.png", "dg_monster732.png", "dg_monster732_mirrored.png")
foreach ($e in $movedEnemies) {
    $found = $json.enemies | Where-Object { $_ -like "*$e*" }
    if ($found) {
        Write-Host "FOUND IN MANIFEST (BAD):" $e
    } else {
        Write-Host "Not in manifest (GOOD):" $e
    }
}
