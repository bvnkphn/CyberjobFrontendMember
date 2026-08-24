param([switch]$SkipInstall)

$ErrorActionPreference = "Stop"
$frontendPath = $PSScriptRoot
$backendPath = Join-Path (Split-Path $PSScriptRoot -Parent) "CyberJobBackendMember"
$composeFile = Join-Path $backendPath "compose.yaml"

function Require-Command([string]$name, [string]$help) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) { throw "Missing $name - $help" }
}

function Test-DockerEngine {
  $stdout = [System.IO.Path]::GetTempFileName()
  $stderr = [System.IO.Path]::GetTempFileName()
  try {
    $process = Start-Process -FilePath "docker" -ArgumentList @("info", "--format", "{{.ServerVersion}}") -NoNewWindow -PassThru -RedirectStandardOutput $stdout -RedirectStandardError $stderr
    if (-not $process.WaitForExit(4000)) {
      $process.Kill()
      $process.WaitForExit()
      return $false
    }
    return $process.ExitCode -eq 0
  } catch {
    return $false
  } finally {
    Remove-Item -LiteralPath $stdout, $stderr -Force -ErrorAction SilentlyContinue
  }
}

function Start-DockerEngine {
  if (Test-DockerEngine) { return }

  $dockerDesktop = Join-Path $env:ProgramFiles "Docker\Docker\Docker Desktop.exe"
  if (-not (Test-Path -LiteralPath $dockerDesktop)) {
    throw "Docker Desktop is installed but its application was not found. Reinstall Docker Desktop, then run npm run dev:setup"
  }

  Write-Host "Docker Engine is not running. Starting Docker Desktop..." -ForegroundColor Yellow
  $dockerService = Get-Service -Name "com.docker.service" -ErrorAction SilentlyContinue
  if ($dockerService -and $dockerService.Status -ne "Running") {
    try {
      Start-Service -Name "com.docker.service" -ErrorAction Stop
      Write-Host "Docker service started." -ForegroundColor DarkGray
    } catch {
      Write-Host "Docker service needs Administrator permission. Confirm the Windows prompt once." -ForegroundColor DarkYellow
      try {
        $adminProcess = Start-Process -FilePath "powershell.exe" -Verb RunAs -Wait -PassThru -ArgumentList '-NoProfile -Command "Start-Service -Name com.docker.service -ErrorAction Stop"'
        if ($adminProcess.ExitCode -eq 0) { Write-Host "Docker service started." -ForegroundColor DarkGray }
      } catch {
        Write-Host "Administrator permission was not granted. Docker Desktop may not be able to start." -ForegroundColor DarkYellow
      }
    }
  }
  Start-Process -FilePath $dockerDesktop

  $deadline = (Get-Date).AddSeconds(120)
  $nextMessage = 10
  while ((Get-Date) -lt $deadline) {
    if (Test-DockerEngine) {
      Write-Host "Docker Engine is ready." -ForegroundColor Green
      return
    }
    $elapsed = [Math]::Floor(120 - ($deadline - (Get-Date)).TotalSeconds)
    if ($elapsed -ge $nextMessage) {
      Write-Host "Waiting for Docker Engine... ($elapsed s)" -ForegroundColor DarkGray
      $nextMessage += 10
    }
    Start-Sleep -Seconds 2
  }

  throw "Docker Desktop did not become ready. Open Docker Desktop once and complete its WSL 2 setup. If Windows reports WSL access denied, restart Windows or run 'wsl --update' in an Administrator PowerShell, then run npm run dev again"
}

Require-Command "node" "install Node.js LTS first"
Require-Command "npm" "install npm first"
Require-Command "docker" "install Docker Desktop first"
if (-not (Test-Path -LiteralPath $backendPath)) { throw "Frontend and Backend must be in the same parent directory" }

Start-DockerEngine

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
"@ | Set-Content -LiteralPath $backendEnv -Encoding ascii
}

$frontendEnv = Join-Path $frontendPath ".env.local"
if (-not (Test-Path -LiteralPath $frontendEnv)) {
  "NEXT_PUBLIC_API_URL=http://localhost:3003/api/v1" | Set-Content -LiteralPath $frontendEnv -Encoding ascii
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
  throw "Backend was not ready within 60 seconds. Review the logs above"
}

docker compose -f $composeFile --project-directory $backendPath exec -T api ./node_modules/.bin/typeorm migration:run -d dist/typeorm.config.js
Write-Host "Ready: http://localhost:3000 (Demo account is automatic until Logout)" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop Frontend; Docker services remain running"
Set-Location -LiteralPath $frontendPath
npm run dev:frontend
