# 🚀 Start Development với Ngrok
# Script này sẽ start backend và ngrok đồng thời

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ZALO ACCOUNT MANAGER - DEV MODE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if backend is already running
Write-Host "Step 1: Checking backend..." -ForegroundColor Yellow
$backendRunning = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*backend*" }

if ($backendRunning) {
    Write-Host "  Backend already running on port 3000" -ForegroundColor Green
} else {
    Write-Host "  Starting backend..." -ForegroundColor Yellow

    # Start backend in new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run start:dev"

    Write-Host "  Backend started in new window" -ForegroundColor Green
    Write-Host "  Waiting 5 seconds for backend to initialize..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
}

Write-Host ""

# Step 2: Check if ngrok is installed
Write-Host "Step 2: Checking ngrok..." -ForegroundColor Yellow
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue

if (-not $ngrokInstalled) {
    Write-Host "  Ngrok not found! Installing..." -ForegroundColor Yellow
    npm install -g ngrok
    Write-Host "  Ngrok installed" -ForegroundColor Green
} else {
    Write-Host "  Ngrok already installed" -ForegroundColor Green
}

Write-Host ""

# Step 3: Configure ngrok authtoken (if not configured)
Write-Host "Step 3: Configuring ngrok..." -ForegroundColor Yellow
$authtoken = "2jtEAhW5i31190yXPSke6BWSO92_7vPpueF7ak4wBtHUUcMtC"

Write-Host "  Setting authtoken..." -ForegroundColor Gray
ngrok config add-authtoken $authtoken 2>&1 | Out-Null

Write-Host "  Authtoken configured" -ForegroundColor Green
Write-Host ""

# Step 4: Start ngrok
Write-Host "Step 4: Starting ngrok tunnel..." -ForegroundColor Yellow
Write-Host "  Opening ngrok in new window..." -ForegroundColor Gray
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'NGROK TUNNEL' -ForegroundColor Cyan; Write-Host ''; ngrok http 3000"

Write-Host "  Ngrok started!" -ForegroundColor Green
Write-Host ""

# Step 5: Instructions
Write-Host "========================================" -ForegroundColor Green
Write-Host "DEVELOPMENT ENVIRONMENT READY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Check NGROK window for your public URL" -ForegroundColor White
Write-Host "   Example: https://xxxx-yyyy.ngrok-free.app" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Copy the HTTPS URL from ngrok" -ForegroundColor White
Write-Host ""
Write-Host "3. Update mobile/src/config/api.config.ts:" -ForegroundColor White
Write-Host "   PRODUCTION_API_URL: 'https://your-ngrok-url.ngrok-free.app'" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Build APK with Android Studio or gradlew" -ForegroundColor White
Write-Host ""
Write-Host "5. Test app on your phone!" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Enter to open ngrok dashboard in browser..." -ForegroundColor Yellow
Read-Host

# Open ngrok dashboard
Start-Process "http://127.0.0.1:4040"

Write-Host ""
Write-Host "Happy Development! 🚀" -ForegroundColor Green
