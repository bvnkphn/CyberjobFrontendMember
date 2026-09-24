param(
  [string]$OutputPath = "d:\CyberJob_\FRONTEND-HOSTINGER.zip"
)

$ErrorActionPreference = "Stop"

$repoDir = "d:\CyberJob_\frontend"
$stageDir = Join-Path $env:TEMP ("hostinger-frontend-" + [System.Guid]::NewGuid().ToString())

Write-Host "Creating staging directory: $stageDir"
New-Item -ItemType Directory -Path $stageDir | Out-Null

Copy-Item -Recurse (Join-Path $repoDir "src") (Join-Path $stageDir "src")
if (Test-Path (Join-Path $repoDir "public")) {
  Copy-Item -Recurse (Join-Path $repoDir "public") (Join-Path $stageDir "public")
}
if (Test-Path (Join-Path $repoDir ".next")) {
  Write-Host "Copying .next build directory (excluding cache)..."
  $destNext = Join-Path $stageDir ".next"
  New-Item -ItemType Directory -Path $destNext | Out-Null
  robocopy (Join-Path $repoDir ".next") $destNext /E /XD "cache" /NFL /NDL /NJH /NJS /nc /ns /np
  if ($LASTEXITCODE -ge 8) {
    throw "Robocopy failed with code $LASTEXITCODE"
  }
}

$files = @(
  "package.json",
  "package-lock.json",
  "next.config.mjs",
  "tsconfig.json",
  "postcss.config.mjs",
  "tailwind.config.ts",
  "server.js",
  "server.cjs"
)

foreach ($f in $files) {
  $srcFile = Join-Path $repoDir $f
  if (Test-Path $srcFile) {
    Copy-Item $srcFile (Join-Path $stageDir $f)
  }
}

if (Test-Path $OutputPath) {
  Remove-Item -Force $OutputPath
}

Write-Host "Compressing to $OutputPath..."
Compress-Archive -Path "$stageDir\*" -DestinationPath $OutputPath -CompressionLevel Optimal

Remove-Item -Recurse -Force $stageDir
Write-Host "Done: $OutputPath"
