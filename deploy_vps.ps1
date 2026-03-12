# Nodebase VPS Deployment Script

$defaultIp = "103.194.228.66"
$VPS_IP = Read-Host "VPS IP [$defaultIp]"
if ([string]::IsNullOrWhiteSpace($VPS_IP)) { $VPS_IP = $defaultIp }

$defaultUser = "root"
$VPS_USER = Read-Host "VPS user [$defaultUser]"
if ([string]::IsNullOrWhiteSpace($VPS_USER)) { $VPS_USER = $defaultUser }

$VPS_DIR = "/root/nodebase-vps"
$LOCAL_DIR = "deploy/vps"

$VPS_API_KEY = Read-Host "Set VPS_API_KEY (used by Nodebase to call your VPS)"
if ([string]::IsNullOrWhiteSpace($VPS_API_KEY)) {
    Write-Error "VPS_API_KEY cannot be empty."
    exit 1
}

$WAHA_API_KEY = Read-Host "Set WAHA_API_KEY (optional, secures WAHA API)"

$escapedApiKey = $VPS_API_KEY.Replace("'", "'\\''")
$escapedWahaKey = $WAHA_API_KEY.Replace("'", "'\\''")

Write-Host "Deploying to VPS ($VPS_IP)..." -ForegroundColor Cyan
Write-Host "You will be prompted for the VPS password multiple times (SSH/SCP)." -ForegroundColor Yellow

# 1. Create remote directory
Write-Host "`n[1/3] Creating remote directory..." -ForegroundColor Green
ssh "${VPS_USER}@${VPS_IP}" "mkdir -p ${VPS_DIR}"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to connect or create directory. Please check credentials."
    exit 1
}

# 2. Copy files (using scp with -r for recursive)
# We copy the *contents* of deploy/vps to /root/nodebase-vps
Write-Host "`n[2/3] Uploading configuration files..." -ForegroundColor Green
# Using explicit string interpolation to fix PowerShell parsing error with colon
scp -r "${LOCAL_DIR}/*" "${VPS_USER}@${VPS_IP}:${VPS_DIR}"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to upload files."
    exit 1
}

# 3. Configure and Start Services
Write-Host "`n[3/3] Configuring and starting services..." -ForegroundColor Green
# Ensure docker + compose exists (Ubuntu 22.04 usually supports docker-compose-plugin)
# Then start services from /root/nodebase-vps
$remote_command = "set -e; cd ${VPS_DIR}; { printf 'VPS_API_KEY=%s\n' '${escapedApiKey}'; if [ -n '${escapedWahaKey}' ]; then printf 'WAHA_API_KEY=%s\n' '${escapedWahaKey}'; fi; } > .env; if ! command -v docker >/dev/null 2>&1; then echo 'Docker not found. Install Docker first.'; exit 1; fi; if ! docker compose version >/dev/null 2>&1; then apt-get update -y >/dev/null 2>&1 || true; apt-get install -y docker-compose-plugin >/dev/null 2>&1 || true; fi; if docker compose version >/dev/null 2>&1; then docker compose down || true; docker compose up -d --build; else echo 'Docker Compose not available (docker compose). Please install docker-compose-plugin.'; exit 1; fi"

ssh "${VPS_USER}@${VPS_IP}" $remote_command

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to start services."
    exit 1
}

Write-Host "`nDeployment Complete!" -ForegroundColor Cyan
Write-Host "WAHA Dashboard: http://${VPS_IP}:3000/dashboard"
Write-Host "Vibecoder Health: http://${VPS_IP}:8000/health"
