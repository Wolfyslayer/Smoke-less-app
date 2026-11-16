param(
  [Parameter(Mandatory=$true)][string]$Serial,
  [Parameter(Mandatory=$true)][string]$ApkPath,
  [Parameter(Mandatory=$true)][string]$ApkSha256,
  [Parameter(Mandatory=$true)][string]$ReportDirectory
)
$ErrorActionPreference = 'Stop'
# This runner may reset ONLY the explicitly named disposable QA emulator.
if ($Serial -notmatch '^emulator-[0-9]+$') { throw 'Only a disposable Android emulator is allowed.' }
if ($ApkSha256 -notmatch '^[a-fA-F0-9]{64}$') { throw 'A verified APK SHA-256 is required.' }
$apk = (Resolve-Path -LiteralPath $ApkPath).Path
if ([IO.Path]::GetExtension($apk) -ne '.apk') { throw 'Expected a standalone APK.' }
if ((Get-FileHash -LiteralPath $apk -Algorithm SHA256).Hash -ne $ApkSha256) { throw 'APK checksum mismatch.' }
foreach ($command in @('adb','aapt','maestro')) { Get-Command $command -ErrorAction Stop | Out-Null }
function Invoke-Adb([string[]]$Arguments) {
  $result = & adb -s $Serial @Arguments
  if ($LASTEXITCODE -ne 0) { throw 'ADB operation failed.' }
  return $result
}
$virtual = (Invoke-Adb -Arguments @('shell','getprop','ro.kernel.qemu') | Out-String).Trim()
$avd = Invoke-Adb -Arguments @('emu','avd','name')
if ($virtual -ne '1' -or -not ($avd -contains 'SmokeLess_QA')) { throw 'Expected disposable AVD SmokeLess_QA.' }
$badging = & aapt dump badging $apk
if ($LASTEXITCODE -ne 0 -or -not ($badging -match "^package: name='com\.smokeless\.app\.preview' ")) { throw 'Only the Preview package is allowed.' }
# No backend accounts or production network requests in this guest-only suite.
Invoke-Adb -Arguments @('shell','svc','wifi','disable') | Out-Null
Invoke-Adb -Arguments @('shell','svc','data','disable') | Out-Null
Invoke-Adb -Arguments @('install','-r',$apk) | Out-Null
Invoke-Adb -Arguments @('shell','pm','clear','com.smokeless.app.preview') | Out-Null
New-Item -ItemType Directory -Force -Path $ReportDirectory | Out-Null
& maestro --device $Serial test --format junit --output (Join-Path $ReportDirectory 'guest-smoke.xml') --debug-output $ReportDirectory .maestro/guest-smoke.yaml
if ($LASTEXITCODE -ne 0) { throw 'Android release smoke failed. Release remains blocked.' }
