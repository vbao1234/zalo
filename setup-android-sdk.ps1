# Android SDK Packages Setup Script
# Run after setup-android-tools.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ANDROID SDK PACKAGES SETUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check ANDROID_HOME
if (-not $env:ANDROID_HOME) {
    Write-Host "ANDROID_HOME is not set!" -ForegroundColor Red
    Write-Host "  Please run setup-android-tools.ps1 first" -ForegroundColor Yellow
    exit 1
}

Write-Host "ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor Green
Write-Host ""

# Check sdkmanager
$sdkmanagerPath = "$env:ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager.bat"
if (-not (Test-Path $sdkmanagerPath)) {
    Write-Host "sdkmanager not found at: $sdkmanagerPath" -ForegroundColor Red
    Write-Host "  Please run setup-android-tools.ps1 first" -ForegroundColor Yellow
    exit 1
}

Write-Host "Found sdkmanager" -ForegroundColor Green
Write-Host ""

# Packages to install
$packages = @(
    "platform-tools",
    "platforms;android-33",
    "build-tools;33.0.0",
    "platforms;android-31",
    "build-tools;31.0.0"
)

Write-Host "PACKAGES TO BE INSTALLED:" -ForegroundColor Cyan
foreach ($pkg in $packages) {
    Write-Host "  - $pkg" -ForegroundColor Gray
}
Write-Host ""
Write-Host "Size: ~2-3 GB" -ForegroundColor Yellow
Write-Host "Time: 10-20 minutes (depends on network)" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "Cancelled" -ForegroundColor Red
    exit 0
}
Write-Host ""

# Install packages
$totalPackages = $packages.Count
$currentPackage = 0

foreach ($pkg in $packages) {
    $currentPackage++
    Write-Host "[$currentPackage/$totalPackages] Installing: $pkg" -ForegroundColor Yellow

    try {
        & $sdkmanagerPath $pkg
        Write-Host "  Installed: $pkg" -ForegroundColor Green
    } catch {
        Write-Host "  Failed to install $pkg : $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Accept licenses
Write-Host "Accepting Android SDK licenses..." -ForegroundColor Yellow
Write-Host "  (Press 'y' and Enter multiple times to accept all licenses)" -ForegroundColor Gray
Write-Host ""

try {
    & $sdkmanagerPath --licenses
    Write-Host "  Licenses accepted" -ForegroundColor Green
} catch {
    Write-Host "  May need to accept licenses manually" -ForegroundColor Yellow
}
Write-Host ""

# Verify
Write-Host "Verifying installation..." -ForegroundColor Yellow
$adbPath = "$env:ANDROID_HOME\platform-tools\adb.exe"
if (Test-Path $adbPath) {
    Write-Host "  ADB installed: $adbPath" -ForegroundColor Green

    try {
        $adbVersion = & $adbPath version
        Write-Host "  ADB version: $($adbVersion[0])" -ForegroundColor Green
    } catch {
        Write-Host "  Cannot run adb" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ADB not installed!" -ForegroundColor Red
}
Write-Host ""

# List installed packages
Write-Host "Installed packages:" -ForegroundColor Yellow
& $sdkmanagerPath --list_installed
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "SDK INSTALLATION COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "VERIFY:" -ForegroundColor Cyan
Write-Host "  Open a NEW Command Prompt and run:" -ForegroundColor Yellow
Write-Host "  adb version" -ForegroundColor White
Write-Host ""
