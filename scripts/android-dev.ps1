$ErrorActionPreference = "Stop"

function U {
    param([string]$Text)
    return [regex]::Unescape($Text)
}

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $ProjectRoot

$env:JAVA_HOME = "F:\Android\jbr"
$env:ANDROID_HOME = "C:\Users\CZY\AppData\Local\Android\Sdk"
$env:NDK_HOME = "C:\Users\CZY\AppData\Local\Android\Sdk\ndk\30.0.14904198"

$existingGradleOpts = [string]$env:GRADLE_OPTS
$filteredGradleOpts = [regex]::Replace(
    $existingGradleOpts,
    '(?i)(?:^|\s)-Dorg\.gradle\.java\.home=(?:"[^"]*"|\S+)',
    ''
).Trim()
$gradleJavaOption = "-Dorg.gradle.java.home=$env:JAVA_HOME"
$env:GRADLE_OPTS = (@($gradleJavaOption, $filteredGradleOpts) | Where-Object { $_ }) -join " "

$javaBin = Join-Path $env:JAVA_HOME "bin"
$platformTools = Join-Path $env:ANDROID_HOME "platform-tools"
$emulatorTools = Join-Path $env:ANDROID_HOME "emulator"
$javaExe = Join-Path $javaBin "java.exe"
$jvmConfig = Join-Path $env:JAVA_HOME "lib\jvm.cfg"
$serverJvm = Join-Path $env:JAVA_HOME "bin\server\jvm.dll"
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
Test-RequiredPath $jvmConfig "jvm.cfg"
Test-RequiredPath $serverJvm "jvm.dll"
Test-RequiredPath $adbExe "adb.exe"
Test-RequiredPath $emulatorExe "emulator.exe"
Test-RequiredPath $ndkToolchain "NDK toolchain"

$excludedPaths = @(
    "F:\Java\bin",
    "F:\Java\jre\bin",
    "F:\Android Studio\jbr\bin",
    "F:\Android Studio\jbr\jre\bin"
)

function Get-NormalizedPathEntry {
    param([string]$PathEntry)

    $normalized = $PathEntry.Trim().Trim('"')
    if ($normalized.Length -gt 3) {
        $normalized = $normalized.TrimEnd('\', '/')
    }
    return $normalized
}

$excludedPathSet = [System.Collections.Generic.HashSet[string]]::new(
    [System.StringComparer]::OrdinalIgnoreCase
)
foreach ($excludedPath in $excludedPaths) {
    [void]$excludedPathSet.Add((Get-NormalizedPathEntry $excludedPath))
}

$pathSet = [System.Collections.Generic.HashSet[string]]::new(
    [System.StringComparer]::OrdinalIgnoreCase
)
$updatedPaths = [System.Collections.Generic.List[string]]::new()

foreach ($pathEntry in (@($javaBin, $platformTools, $emulatorTools) + ($env:Path -split ";"))) {
    $normalizedPath = Get-NormalizedPathEntry $pathEntry
    if ($normalizedPath -and
        -not $excludedPathSet.Contains($normalizedPath) -and
        $pathSet.Add($normalizedPath)) {
        [void]$updatedPaths.Add($normalizedPath)
    }
}

$env:Path = $updatedPaths -join ";"

Write-Host ((U '\u5df2\u5207\u6362\u5230\u9879\u76ee\u6839\u76ee\u5f55\uff1a') + $ProjectRoot)
Write-Host "JAVA_HOME=$env:JAVA_HOME"
Write-Host "ANDROID_HOME=$env:ANDROID_HOME"
Write-Host "NDK_HOME=$env:NDK_HOME"

Write-Host ""
Write-Host (U 'Get-Command java \u5b9e\u9645\u8def\u5f84\uff1a')
$resolvedJava = (Get-Command java -CommandType Application -ErrorAction Stop).Source
Write-Host $resolvedJava
if (-not [string]::Equals($resolvedJava, $javaExe, [System.StringComparison]::OrdinalIgnoreCase)) {
    Write-Host ((U '\u9519\u8bef\uff1ajava \u547d\u4ee4\u672a\u89e3\u6790\u5230\u9884\u671f\u8def\u5f84\uff1a') + $javaExe) -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "java -version:"
& java -version
if ($LASTEXITCODE -ne 0) {
    Write-Host (U '\u9519\u8bef\uff1ajava -version \u6267\u884c\u5931\u8d25\uff0c\u5df2\u505c\u6b62\u542f\u52a8\u3002') -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host (U '\u5df2\u521b\u5efa\u7684 Android \u6a21\u62df\u5668\u5217\u8868\uff1a')
& $emulatorExe -list-avds

Write-Host ""
Write-Host (U '\u5f53\u524d\u8fde\u63a5\u7684 Android \u8bbe\u5907\uff1a')
& $adbExe devices

Write-Host ""
Write-Host (U 'Gradle Java \u73af\u5883\u68c0\u67e5\uff1a')
$androidProject = Join-Path $ProjectRoot "src-tauri\gen\android"
$gradleWrapper = Join-Path $androidProject "gradlew.bat"
Test-RequiredPath $gradleWrapper "gradlew.bat"
Push-Location $androidProject
try {
    $gradleVersionOutput = & $gradleWrapper -version 2>&1
    $gradleExitCode = $LASTEXITCODE
} finally {
    Pop-Location
}
$gradleVersionOutput | ForEach-Object { Write-Host $_ }
if ($gradleExitCode -ne 0) {
    Write-Host (U '\u9519\u8bef\uff1aGradle Java \u73af\u5883\u68c0\u67e5\u5931\u8d25\uff0c\u5df2\u505c\u6b62\u542f\u52a8\u3002') -ForegroundColor Red
    exit $gradleExitCode
}
if (($gradleVersionOutput -join "`n") -notmatch [regex]::Escape($env:JAVA_HOME)) {
    Write-Host ((U '\u9519\u8bef\uff1aGradle \u672a\u4f7f\u7528\u9884\u671f JDK\uff1a') + $env:JAVA_HOME) -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host (U '\u542f\u52a8 Tauri Android Debug\uff1a')
npm run tauri android dev
exit $LASTEXITCODE
