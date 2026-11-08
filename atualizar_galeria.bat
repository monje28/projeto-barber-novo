@echo off
chcp 65001 >nul
echo Atualizando fotos e videos da galeria...
python "%~dp0atualizar_galeria.py"
echo.
pause
