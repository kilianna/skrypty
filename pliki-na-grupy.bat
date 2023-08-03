@echo off
"%~dp0\deno.exe" run --allow-write --allow-read "%~dpn0.mjs" %*
pause
