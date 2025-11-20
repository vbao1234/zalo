# Railway Auto Deploy Script
# For Zalo Account Manager Backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RAILWAY AUTO DEPLOY SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$RAILWAY_TOKEN = "2f6e7a8f-65e3-4ac6-9ddb-0a79073062ff"
$PROJECT_NAME = "zalo-account-manager"
$BACKEND_PATH = ".\backend"

# Step 1: Check if Railway CLI is installed
Write-Host "Step 1: Checking Railway CLI..." -ForegroundColor Yellow
$railwayInstalled = Get-Command railway -ErrorAction SilentlyContinue

if (-not $railwayInstalled) {
    Write-Host "  Railway CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g @railway/cli
    Write-Host "  Railway CLI installed" -ForegroundColor Green
} else {
    Write-Host "  Railway CLI already installed" -ForegroundColor Green
}
Write-Host ""

# Step 2: Set Railway token
Write-Host "Step 2: Setting Railway token..." -ForegroundColor Yellow
$env:RAILWAY_TOKEN = $RAILWAY_TOKEN
Write-Host "  Token set" -ForegroundColor Green
Write-Host ""

# Step 3: Link to Railway (or create new project)
Write-Host "Step 3: Initializing Railway project..." -ForegroundColor Yellow
Write-Host "  This will create a new project on Railway" -ForegroundColor Gray
Write-Host ""

# Note: Railway CLI requires interactive input for project creation
# We'll guide the user through this
Write-Host "IMPORTANT: Railway will ask you some questions:" -ForegroundColor Yellow
Write-Host "  1. 'Create a new project?' -> Press Enter (Yes)" -ForegroundColor Cyan
Write-Host "  2. 'Project name?' -> Type: $PROJECT_NAME or press Enter" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

railway init

Write-Host ""
Write-Host "  Project initialized" -ForegroundColor Green
Write-Host ""

# Step 4: Add PostgreSQL
Write-Host "Step 4: Adding PostgreSQL database..." -ForegroundColor Yellow
railway add --database postgres

Write-Host "  PostgreSQL added" -ForegroundColor Green
Write-Host ""

# Step 5: Deploy Backend
Write-Host "Step 5: Deploying backend..." -ForegroundColor Yellow
Write-Host "  This may take 5-10 minutes..." -ForegroundColor Gray
Write-Host ""

Set-Location $BACKEND_PATH
railway up --detach

Write-Host "  Backend deployed" -ForegroundColor Green
Write-Host ""

# Step 6: Generate domain
Write-Host "Step 6: Generating public domain..." -ForegroundColor Yellow
railway domain

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "  1. Copy the URL shown above" -ForegroundColor Yellow
Write-Host "  2. Send the URL to me" -ForegroundColor Yellow
Write-Host "  3. I will update mobile app with this URL" -ForegroundColor Yellow
Write-Host "  4. Then we can build APK" -ForegroundColor Yellow
Write-Host ""
Write-Host "To view logs: railway logs" -ForegroundColor Gray
Write-Host "To check status: railway status" -ForegroundColor Gray
Write-Host ""
