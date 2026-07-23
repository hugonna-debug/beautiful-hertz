Add-Type -AssemblyName System.Drawing

$blankFiles = @(
    "leg_armor_0.png", "leg_armor_0_mirrored.png",
    "leg_armor_1.png", "leg_armor_1_mirrored.png",
    "leg_armor_2.png", "leg_armor_2_mirrored.png",
    "leg_armor_3.png", "leg_armor_3_mirrored.png",
    "leg_armor_4.png", "leg_armor_4_mirrored.png",
    "leg_armor_5.png", "leg_armor_5_mirrored.png"
)

$bodyPath = "C:\Users\hudso\Desktop\Game Assets\min max standard\verified\verified body"

Write-Host "=== Full Pixel Audit on Suspicious Blank Files ==="
foreach ($name in $blankFiles) {
    $filePath = Join-Path $bodyPath $name
    if (Test-Path $filePath) {
        $bmp = [System.Drawing.Bitmap]::FromFile($filePath)
        $nonAlphaCount = 0
        for ($x = 0; $x -lt $bmp.Width; $x++) {
            for ($y = 0; $y -lt $bmp.Height; $y++) {
                $pixel = $bmp.GetPixel($x, $y)
                if ($pixel.A -gt 0) {
                    $nonAlphaCount++
                }
            }
        }
        Write-Host "$name : non-transparent pixels = $nonAlphaCount / $($bmp.Width * $bmp.Height)"
        $bmp.Dispose()
    } else {
        Write-Host "$name not found!"
    }
}
