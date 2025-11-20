# Android Command Line Tools Setup Script
# For Windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ANDROID COMMAND LINE TOOLS SETUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$androidHome = "C:\Android"
$cmdlineToolsUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
$downloadPath = "$env:TEMP\android-cmdline-tools.zip"

Write-Host "Android will be installed at: $androidHome" -ForegroundColor Green
Write-Host ""

# Step 1: Create Android directory
Write-Host "Step 1: Creating installation directory..." -ForegroundColor Yellow
if (Test-Path $androidHome) {
    Write-Host "  Directory $androidHome already exists" -ForegroundColor Yellow
    $confirm = Read-Host "  Delete and reinstall? (y/n)"
    if ($confirm -eq 'y') {
        Remove-Item -Path $androidHome -Recurse -Force
        Write-Host "  Deleted old directory" -ForegroundColor Green
    }
}

New-Item -ItemType Directory -Path $androidHome -Force | Out-Null
Write-Host "  Created directory $androidHome" -ForegroundColor Green
Write-Host ""

# Step 2: Download Command Line Tools
Write-Host "Step 2: Downloading Android Command Line Tools (~150MB)..." -ForegroundColor Yellow
Write-Host "  URL: $cmdlineToolsUrl" -ForegroundColor Gray

try {
    Invoke-WebRequest -Uri $cmdlineToolsUrl -OutFile $downloadPath -UseBasicParsing
    Write-Host "  Download complete: $downloadPath" -ForegroundColor Green
} catch {
    Write-Host "  Download failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download manually from:" -ForegroundColor Yellow
    Write-Host "  https://developer.android.com/studio#command-line-tools-only" -ForegroundColor Cyan
    exit 1
}
Write-Host ""

# Step 3: Extract
Write-Host "Step 3: Extracting Command Line Tools..." -ForegroundColor Yellow
try {
    Expand-Archive -Path $downloadPath -DestinationPath $androidHome -Force
    Write-Host "  Extraction complete" -ForegroundColor Green
} catch {
    Write-Host "  Extraction failed: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Restructure directories
Write-Host "Step 4: Restructuring directories..." -ForegroundColor Yellow

$cmdlineToolsPath = "$androidHome\cmdline-tools"
$tempPath = "$androidHome\temp-cmdline-tools"

if (Test-Path "$androidHome\cmdline-tools") {
    Move-Item -Path "$androidHome\cmdline-tools" -Destination $tempPath -Force
    New-Item -ItemType Directory -Path "$cmdlineToolsPath\latest" -Force | Out-Null
    Get-ChildItem -Path $tempPath | Move-Item -Destination "$cmdlineToolsPath\latest" -Force
    Remove-Item -Path $tempPath -Recurse -Force
    Write-Host "  Directory structure correct: $cmdlineToolsPath\latest" -ForegroundColor Green
}
Write-Host ""

# Step 5: Set Environment Variables
Write-Host "Step 5: Setting environment variables..." -ForegroundColor Yellow

[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidHome, [System.EnvironmentVariableTarget]::User)
Write-Host "  ANDROID_HOME = $androidHome" -ForegroundColor Green

$currentPath = [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::User)
$pathsToAdd = @(
    "$androidHome\cmdline-tools\latest\bin",
    "$androidHome\platform-tools",
    "$androidHome\emulator"
)

foreach ($pathToAdd in $pathsToAdd) {
    if ($currentPath -notlike "*$pathToAdd*") {
        $currentPath = "$currentPath;$pathToAdd"
        Write-Host "  Added to PATH: $pathToAdd" -ForegroundColor Green
    } else {
        Write-Host "  Already in PATH: $pathToAdd" -ForegroundColor Yellow
    }
}

[System.Environment]::SetEnvironmentVariable("Path", $currentPath, [System.EnvironmentVariableTarget]::User)
Write-Host ""

# Step 6: Refresh environment
Write-Host "Step 6: Refreshing environment variables..." -ForegroundColor Yellow
$env:ANDROID_HOME = $androidHome
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::User) + ";" + [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::Machine)
Write-Host "  Environment refreshed" -ForegroundColor Green
Write-Host ""

# Step 7: Cleanup
Write-Host "Step 7: Cleaning up temporary files..." -ForegroundColor Yellow
if (Test-Path $downloadPath) {
    Remove-Item -Path $downloadPath -Force
    Write-Host "  Temporary files deleted" -ForegroundColor Green
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "INSTALLATION COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "  1. OPEN A NEW Command Prompt or PowerShell" -ForegroundColor Yellow
Write-Host "  2. Run: .\setup-android-sdk.ps1" -ForegroundColor Yellow
Write-Host "  3. Install Android SDK packages" -ForegroundColor Yellow
Write-Host ""
