$ErrorActionPreference = "Stop"

function U {
    param([string]$Text)
    return [regex]::Unescape($Text)
}

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $ProjectRoot

$env:JAVA_HOME = "F:\Android Studio\jbr"
$env:ANDROID_HOME = "C:\Users\CZY\AppData\Local\Android\Sdk"
$env:NDK_HOME = "C:\Users\CZY\AppData\Local\Android\Sdk\ndk\30.0.14904198"

$javaBin = Join-Path $env:JAVA_HOME "bin"
$platformTools = Join-Path $env:ANDROID_HOME "platform-tools"
$emulatorTools = Join-Path $env:ANDROID_HOME "emulator"
$javaExe = Join-Path $javaBin "java.exe"
$adbExe = Join-Path $platformTools "adb.exe"
$emulatorExe = Join-Path $emulatorTools "emulator.exe"
$ndkToolchain = Join-Path $env:NDK_HOME "toolchains\llvm\prebuilt\windows-x86_64"

function Test-RequiredPath {
    param(
        [string]$Path,
        [string]$Name
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        Write-Host ((U '\u9519\u8bef\uff1a\u672a\u627e\u5230') + " " + $Name + ": " + $Path) -ForegroundColor Red
        exit 1
    }
}

Test-RequiredPath $javaExe "java.exe"
Test-RequiredPath $adbExe "adb.exe"
Test-RequiredPath $emulatorExe "emulator.exe"
Test-RequiredPath $ndkToolchain "NDK toolchain"

$excludedPaths = @(
    "F:\Java\bin",
    "F:\Java\jre\bin"
)

$currentPaths = $env:Path -split ";" | Where-Object {
    $pathItem = $_.Trim()
    $pathItem -and ($excludedPaths -notcontains $pathItem)
}

$env:Path = (@($javaBin, $platformTools, $emulatorTools) + $currentPaths) -join ";"

Write-Host ((U '\u5df2\u5207\u6362\u5230\u9879\u76ee\u6839\u76ee\u5f55\uff1a') + $ProjectRoot)
Write-Host "JAVA_HOME=$env:JAVA_HOME"
Write-Host "ANDROID_HOME=$env:ANDROID_HOME"
Write-Host "NDK_HOME=$env:NDK_HOME"

Write-Host ""
Write-Host "java -version:"
& $javaExe -version

Write-Host ""
Write-Host (U '\u5df2\u521b\u5efa\u7684 Android \u6a21\u62df\u5668\u5217\u8868\uff1a')
& $emulatorExe -list-avds

Write-Host ""
Write-Host (U '\u5f53\u524d\u8fde\u63a5\u7684 Android \u8bbe\u5907\uff1a')
& $adbExe devices

Write-Host ""
Write-Host (U '\u542f\u52a8 Tauri Android Debug\uff1a')
npm run tauri android dev
exit $LASTEXITCODE
