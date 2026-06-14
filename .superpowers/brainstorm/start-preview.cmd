@echo off
chcp 65001 >nul
set "BRAINSTORM_DIR=E:\czy\工程\EasyMarkdown\.superpowers\brainstorm\manual-20260614-1425"
set "BRAINSTORM_HOST=127.0.0.1"
set "BRAINSTORM_URL_HOST=localhost"
set "BRAINSTORM_PORT=58424"
echo launcher-started > "%TEMP%\easymarkdown-preview-vbs.log"
"C:\Program Files\nodejs\node.exe" "C:\Users\CZY\.codex\plugins\cache\openai-curated\superpowers\c6ea566d\skills\brainstorming\scripts\server.cjs" >> "%TEMP%\easymarkdown-preview-vbs.log" 2>&1
