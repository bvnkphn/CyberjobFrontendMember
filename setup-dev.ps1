param([switch]$SkipInstall)

$ErrorActionPreference = "Stop"
$frontendPath = $PSScriptRoot
$backendPath = Join-Path (Split-Path $PSScriptRoot -Parent) "CyberJobBackendMember"
$composeFile = Join-Path $backendPath "compose.yaml"

function Require-Command([string]$name, [string]$help) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) { throw "ไม่พบ $name - $help" }
}

Require-Command "node" "ติดตั้ง Node.js LTS ก่อนรันสคริปต์"
Require-Command "npm" "ติดตั้ง npm ก่อนรันสคริปต์"
Require-Command "docker" "ติดตั้งและเปิด Docker Desktop ก่อนรันสคริปต์"
if (-not (Test-Path -LiteralPath $backendPath)) { throw "กรุณาวาง Frontend และ Backend ไว้ในโฟลเดอร์แม่เดียวกัน" }

docker info *> $null
if ($LASTEXITCODE -ne 0) { throw "Docker Desktop ยังไม่พร้อม กรุณาเปิด Docker Desktop แล้วลองใหม่" }

$backendEnv = Join-Path $backendPath ".env"
if (-not (Test-Path -LiteralPath $backendEnv)) {
  @"
NODE_ENV=development
PORT=3003
DATABASE_URL=postgresql://cyberjob:change-me@postgres:5432/cyberjob_member
DB_SSL=false
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=cyberjob-development-secret-change-before-production
JWT_EXPIRES_IN_SECONDS=86400
DEMO_ACCOUNT_ENABLED=true
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
OAUTH_CALLBACK_URL=http://localhost:3003/api/v1/auth/oauth/callback
"@ | Set-Content -LiteralPath $backendEnv -Encoding utf8
}

$frontendEnv = Join-Path $frontendPath ".env.local"
if (-not (Test-Path -LiteralPath $frontendEnv)) {
  "NEXT_PUBLIC_API_URL=http://localhost:3003/api/v1" | Set-Content -LiteralPath $frontendEnv -Encoding utf8
}

if (-not $SkipInstall) {
  npm ci --prefix $backendPath
  npm ci --prefix $frontendPath
}

Write-Host "Starting PostgreSQL and Backend..." -ForegroundColor Cyan
docker compose -f $composeFile --project-directory $backendPath up --build -d

$healthUrl = "http://localhost:3003/api/v1/health"
$backendReady = $false
for ($attempt = 1; $attempt -le 30; $attempt++) {
  try { Invoke-RestMethod -Uri $healthUrl -TimeoutSec 2 | Out-Null; $backendReady = $true; break }
  catch { Start-Sleep -Seconds 2 }
}
if (-not $backendReady) {
  docker compose -f $composeFile --project-directory $backendPath logs api --tail 80
  throw "Backend ไม่พร้อมภายใน 60 วินาที กรุณาตรวจ log ด้านบน"
}

docker compose -f $composeFile --project-directory $backendPath exec -T api npm run migration:run
Write-Host "Ready: http://localhost:3000 (Demo account is automatic until Logout)" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop Frontend; Docker services remain running"
Set-Location -LiteralPath $frontendPath
npm run dev
