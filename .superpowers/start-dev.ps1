Set-Location "E:\czy\工程\EasyMarkdown"
"starting from $(Get-Location)" | Out-File "$env:TEMP\easymarkdown-dev-5173.log"
& "C:\nvm4w\nodejs\npm.cmd" run dev -- --host 127.0.0.1 --port 5173 *>> "$env:TEMP\easymarkdown-dev-5173.log"
