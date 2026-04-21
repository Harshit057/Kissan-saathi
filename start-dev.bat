@echo off
REM Quick Start Script for KisanSathi & आपनGaon - Windows Version
REM Starts all services needed for local development

echo.
echo 🌾 KisanSathi ^& आपनGaon - Dev Environment Setup
echo ==================================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python 3 is not installed or not in PATH
    pause
    exit /b 1
)
echo ✓ Python3 found

REM Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    pause
    exit /b 1
)
echo ✓ Node.js found

REM Check pnpm or npm
pnpm --version >nul 2>&1
if errorlevel 1 (
    npm --version >nul 2>&1
    if errorlevel 1 (
        echo ❌ npm or pnpm is not installed
        pause
        exit /b 1
    )
    set PKG_MANAGER=npm
) else (
    set PKG_MANAGER=pnpm
)
echo ✓ Package manager found: %PKG_MANAGER%

echo.
echo Setting up backend...
cd backend

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing backend dependencies...
pip install -q -r requirements.txt >nul 2>&1

if not exist ".env" (
    echo Creating .env from .env.example...
    copy .env.example .env >nul
    echo.
    echo ⚠️  Please update backend\.env with your database credentials
    echo.
)

cd ..

echo ✓ Backend setup complete

echo.
echo Setting up frontend...

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call %PKG_MANAGER% install -q
)

if not exist ".env.local" (
    echo Creating .env.local from .env.example...
    copy .env.example .env.local >nul
)

echo ✓ Frontend setup complete

echo.
echo ✓ All services ready!
echo ================================================
echo.
echo Starting services in new windows...
echo.
echo Press any key to continue or Ctrl+C to cancel
pause

REM Start backend in new window
echo Starting backend server (localhost:8000)...
start "KisanSathi Backend" cmd /k "cd backend && venv\Scripts\activate.bat && uvicorn app.main:app --reload --port 8000"

REM Wait a bit for backend to start
timeout /t 2 /nobreak

REM Start frontend in new window
echo Starting frontend dev server (localhost:3000)...
start "KisanSathi Frontend" cmd /k "%PKG_MANAGER% run dev"

echo.
echo ✓ Services started!
echo.
echo 📱 Frontend:  http://localhost:3000
echo 🔌 Backend:   http://localhost:8000
echo 📚 API Docs:  http://localhost:8000/docs
echo.
echo The services are running in separate windows.
echo Close the windows to stop the services.
echo.

pause
