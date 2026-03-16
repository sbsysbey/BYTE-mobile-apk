$ErrorActionPreference = 'Stop'

function Invoke-Robocopy {
    param(
        [Parameter(Mandatory = $true)][string]$Source,
        [Parameter(Mandatory = $true)][string]$Destination
    )

    robocopy $Source $Destination /E /NFL /NDL /NJH /NJS /NC /NS | Out-Null
    if ($LASTEXITCODE -gt 7) {
        throw "robocopy failed for $Source -> $Destination with exit code $LASTEXITCODE"
    }
}

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Host "[1/4] Web dosyalari www klasorune kopyalaniyor..."
Copy-Item *.html www -Force
Copy-Item manifest.json www -Force
Copy-Item sw.js www -Force
Invoke-Robocopy -Source "css" -Destination "www\css"
Invoke-Robocopy -Source "js" -Destination "www\js"
Invoke-Robocopy -Source "modules" -Destination "www\modules"
Invoke-Robocopy -Source "videos" -Destination "www\videos"

Write-Host "[2/4] Capacitor Android kopyalama yapiliyor..."
npx cap copy android

Write-Host "[3/4] Android temiz derleme yapiliyor..."
Push-Location android
.\gradlew clean assembleDebug
Pop-Location

Write-Host "[4/4] APK hazir"
Write-Host "Konum: android\app\build\outputs\apk\debug\app-debug.apk"
