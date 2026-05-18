@echo off
title Styles Fashion - Local Server
color 0A
echo.
echo  ================================================
echo    STYLES FASHION CATALOG - Starting Server
echo  ================================================
echo.
echo  Opening at: http://localhost:3000
echo  Admin panel: http://localhost:3000/admin
echo.
echo  Press CTRL+C to stop the server.
echo  ================================================
echo.
cd /d "%~dp0"
npm run dev
pause
