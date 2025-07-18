# Start MCP Server for Estimate Service
Write-Host "Starting MCP Server for Estimate Service..." -ForegroundColor Green

# Check if node is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js is not installed!" -ForegroundColor Red
    exit 1
}

# Build MCP server if dist-simple doesn't exist
if (-not (Test-Path "mcp-server\dist-simple\index-http.js")) {
    Write-Host "Building MCP server..." -ForegroundColor Yellow
    Push-Location mcp-server
    npm install
    npx tsc src/index-local-simple.ts src/index-http.ts --outDir dist-simple --target ES2022 --module node16 --moduleResolution node16 --allowSyntheticDefaultImports --esModuleInterop --skipLibCheck --forceConsistentCasingInFileNames --resolveJsonModule
    Pop-Location
}

# Start HTTP server
Write-Host "Starting MCP HTTP server on port 3456..." -ForegroundColor Cyan
node mcp-server/dist-simple/index-http.js
