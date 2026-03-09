param(
  [string]$ImagePath = "D:\sit_here\test_image\a02eaa95791da37ffb5fdee829c50f04.jpg",
  [string]$OutputRoot = "D:\sit_here\api_generated_images",
  [string]$BaseUrl = "https://api.hiyo.top",
  [string]$ApiKey = "sk-rxRthcrOx2WrZf3aJXJEtO5hch2Eta35DzsXJf85hVUsJ4qc",
  [string]$Model = "gemini-3.1-flash-image",
  [int]$Threshold = 128,
  [double]$Feather = 2
)

$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Path $OutputRoot -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $OutputRoot "raw") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $OutputRoot "gray") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $OutputRoot "alpha") -Force | Out-Null

$ts = Get-Date -Format "yyyyMMdd_HHmmss"
$rawPath = Join-Path $OutputRoot ("raw\\mask_raw_" + $ts + ".png")
$grayPath = Join-Path $OutputRoot ("gray\\mask_gray_" + $ts + ".png")
$alphaPath = Join-Path $OutputRoot ("alpha\\mask_alpha_" + $ts + ".png")

python "D:\sit_here\pc_l2d_demo\tools\generate_mask_via_gen_api.py" `
  --image $ImagePath `
  --out-raw $rawPath `
  --out-gray $grayPath `
  --out-alpha $alphaPath `
  --base-url $BaseUrl `
  --api-key $ApiKey `
  --model $Model `
  --mode chat `
  --threshold $Threshold `
  --feather $Feather

Write-Output ""
Write-Output "Saved files:"
Write-Output "RAW:   $rawPath"
Write-Output "GRAY:  $grayPath"
Write-Output "ALPHA: $alphaPath"
