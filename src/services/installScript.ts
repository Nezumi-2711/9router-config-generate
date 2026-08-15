import type { ToolMeta, ConnectionConfig, Model } from '../types.ts'

export type ScriptOS = 'unix' | 'windows'

export interface BuildInstallScriptOptions {
  keySource?: 'embedded' | 'runtime-env'
}

export interface GeneratedScript {
  filename: string
  language: 'bash' | 'powershell'
  content: string
  runCommand: string
}

export function buildInstallScript(
  tool: ToolMeta,
  connection: ConnectionConfig,
  selectedModels: Model[],
  os: ScriptOS,
  options?: BuildInstallScriptOptions
): GeneratedScript | null {
  if (!tool.installTargets) {
    return null
  }

  const keySource = options?.keySource || 'embedded'
  const effectiveConnection: ConnectionConfig =
    keySource === 'runtime-env'
      ? { ...connection, apiKey: '__NINEROUTER_API_KEY__' }
      : connection

  const configContent = tool.sampleTemplate(effectiveConnection, selectedModels)
  const apiKeyHint = connection.apiKey || 'YOUR_API_KEY'

  if (os === 'unix') {
    const filename = `install-9router-${tool.id}.sh`
    const { writeConfigSection, postInstallNotes } =
      keySource === 'runtime-env'
        ? {
            writeConfigSection: `API_KEY="\${NINEROUTER_API_KEY:-}"
if [[ -z "$API_KEY" ]]; then
  read -rsp "Enter your 9router API key: " API_KEY
  echo
fi

CONFIG=$(cat <<'EOF'
${configContent}
EOF
)

API_KEY_PLACEHOLDER='__NINEROUTER_API_KEY__'
json_escape() {
  local string="$1"
  local output=""
  local char
  local i

  for ((i = 0; i < \${#string}; i++)); do
    char="\${string:i:1}"
    case "$char" in
      '"') output+='\\"' ;;
      '\\') output+='\\\\' ;;
      $'\b') output+='\\b' ;;
      $'\f') output+='\\f' ;;
      $'\n') output+='\\n' ;;
      $'\r') output+='\\r' ;;
      $'\t') output+='\\t' ;;
      *) output+="$char" ;;
    esac
  done

  printf '%s' "$output"
}

replace_api_key_placeholder() {
  local replacement="$1"
  local prefix
  local suffix

  while [[ "$CONFIG" == *"$API_KEY_PLACEHOLDER"* ]]; do
    prefix="\${CONFIG%%"$API_KEY_PLACEHOLDER"*}"
    suffix="\${CONFIG#*"$API_KEY_PLACEHOLDER"}"
    CONFIG="\${prefix}\${replacement}\${suffix}"
  done
}

if [[ -n "$API_KEY" ]]; then
  replace_api_key_placeholder "$(json_escape "$API_KEY")"
else
  replace_api_key_placeholder '\${input:9router-api-key}'
fi

printf '%s\\n' "$CONFIG" > "$TARGET_FILE"`
            ,
            postInstallNotes: `echo ""
echo "✅ Configuration successfully written to $TARGET_FILE"
echo ""
echo "👉 Next step in VS Code:"
echo "   1. Reload VS Code (Ctrl+Shift+P or Cmd+Shift+P → Developer: Reload Window)."
echo "   2. Open GitHub Copilot Chat and start coding!"`
          }
        : {
            writeConfigSection: `cat <<'EOF' > "$TARGET_FILE"
${configContent}
EOF`,
            postInstallNotes: `echo ""
echo "✅ Configuration successfully written to $TARGET_FILE"
echo ""
echo "👉 Next step in VS Code:"
echo "   1. Reload VS Code or open GitHub Copilot Chat."
echo "   2. When prompted for '9router-api-key', paste your key:"
echo "      ${apiKeyHint}"`
          }

    const content = `#!/usr/bin/env bash
# 9router Install Script for ${tool.name}
# Automatically generates and installs ${tool.targetFilename}

set -euo pipefail

# Determine configuration directory based on OS (macOS vs Linux)
if [[ "$(uname)" == "Darwin" ]]; then
  TARGET_DIR="$HOME/Library/Application Support/Code/User"
else
  TARGET_DIR="\${XDG_CONFIG_HOME:-$HOME/.config}/Code/User"
fi

TARGET_FILE="$TARGET_DIR/${tool.targetFilename}"

echo "🔧 Installing 9router config for ${tool.name}..."
echo "📍 Target: $TARGET_FILE"

# Create destination folder if not present
mkdir -p "$TARGET_DIR"

# Backup existing configuration if present
if [[ -f "$TARGET_FILE" ]]; then
  BACKUP_FILE="$TARGET_FILE.backup.$(date +%Y%m%d%H%M%S)"
  echo "⚠️  Existing configuration found. Backing up to:"
  echo "   $BACKUP_FILE"
  cp "$TARGET_FILE" "$BACKUP_FILE"
fi

# Write configuration
${writeConfigSection}
${postInstallNotes}
`
    return {
      filename,
      language: 'bash',
      content,
      runCommand: `bash ${filename}`,
    }
  }

  // Windows PowerShell
  const filename = `install-9router-${tool.id}.ps1`
  const { psWriteConfigSection, psPostInstallNotes } =
    keySource === 'runtime-env'
      ? {
          psWriteConfigSection: `$apiKey = $env:NINEROUTER_API_KEY
if (-not $apiKey) {
    $secureApiKey = Read-Host "Enter your 9router API key" -AsSecureString
    $apiKey = [System.Net.NetworkCredential]::new('', $secureApiKey).Password
}

$config = @'
${configContent}
'@

if ($apiKey) {
  $jsonApiKey = ConvertTo-Json -InputObject $apiKey -Compress
  $config = $config.Replace('"__NINEROUTER_API_KEY__"', $jsonApiKey)
} else {
  $config = $config.Replace('"__NINEROUTER_API_KEY__"', '"\${input:9router-api-key}"')
}

Set-Content -Path $targetFile -Value $config -Encoding UTF8`,
          psPostInstallNotes: `Write-Host ""
Write-Host "✅ Configuration successfully written to $targetFile" -ForegroundColor Green
Write-Host ""
Write-Host "👉 Next step in VS Code:" -ForegroundColor Cyan
Write-Host "   1. Reload VS Code (Ctrl+Shift+P -> Developer: Reload Window)."
Write-Host "   2. Open GitHub Copilot Chat and start coding!" -ForegroundColor Green`
        }
      : {
          psWriteConfigSection: `@'
${configContent}
'@ | Set-Content -Path $targetFile -Encoding UTF8`,
          psPostInstallNotes: `Write-Host ""
Write-Host "✅ Configuration successfully written to $targetFile" -ForegroundColor Green
Write-Host ""
Write-Host "👉 Next step in VS Code:" -ForegroundColor Cyan
Write-Host "   1. Reload VS Code or open GitHub Copilot Chat."
Write-Host "   2. When prompted for '9router-api-key', paste your key:"
Write-Host "      ${apiKeyHint}" -ForegroundColor Yellow`
        }

  const content = `# 9router Install Script for ${tool.name}
# Automatically generates and installs ${tool.targetFilename}

$ErrorActionPreference = "Stop"

$targetDir = Join-Path $env:APPDATA "Code\\User"
$targetFile = Join-Path $targetDir "${tool.targetFilename}"

Write-Host "🔧 Installing 9router config for ${tool.name}..." -ForegroundColor Cyan
Write-Host "📍 Target: $targetFile"

# Ensure directory exists
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

# Backup existing file if present
if (Test-Path $targetFile) {
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $backupFile = "$targetFile.backup.$timestamp"
    Write-Host "⚠️  Existing configuration found. Backing up to:" -ForegroundColor Yellow
    Write-Host "   $backupFile"
    Copy-Item $targetFile $backupFile
}

# Write configuration file with UTF8 encoding
${psWriteConfigSection}
${psPostInstallNotes}
`

  return {
    filename,
    language: 'powershell',
    content,
    runCommand: `powershell -ExecutionPolicy Bypass -File .\\${filename}`,
  }
}
