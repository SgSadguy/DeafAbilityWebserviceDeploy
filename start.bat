@echo off
echo ========================================
echo   DeafAbility - Start All Services
echo ========================================
echo.


echo.
echo Starting Backend (Django)...
start "Django Backend" cmd /k "cd deafability && python manage.py runserver"

echo.
echo Waiting for Backend to start...
timeout /t 3 /nobreak > nul

echo.
echo  Starting Frontend (React)...
start "React Frontend" cmd /k "cd deafability-frontend && npm start"

echo.
echo  Both services are starting...
echo.
echo  Services:
echo    - Backend:  http://localhost:8000
echo    - Frontend: http://localhost:3000
echo.
echo  Press any key to close this window...
pause > nul
