@echo off
title ArenaIQ v2

echo.
echo   ==========================================
echo      ArenaIQ v2 ^| Human Preference Platform
echo   ==========================================
echo.

python --version >nul 2>&1
if errorlevel 1 (echo [ERROR] Python not found. Install from https://python.org & pause & exit /b 1)
for /f "tokens=*" %%v in ('python --version') do echo [OK] %%v

node --version >nul 2>&1
if errorlevel 1 (echo [ERROR] Node.js not found. Install from https://nodejs.org & pause & exit /b 1)
for /f "tokens=*" %%v in ('node --version') do echo [OK] Node %%v

findstr /c:"your_gemini_api_key_here" backend\.env >nul 2>&1
if not errorlevel 1 (
    echo.
    echo [WARN] API keys not set in backend\.env
    echo.
    echo        GEMINI FREE ^(15 RPM^): https://aistudio.google.com/app/apikey
    echo        GROQ   FREE ^(14400 RPD^): https://console.groq.com/keys
    echo.
    echo        Open backend\.env in Notepad and replace:
    echo          your_gemini_api_key_here  ^<-- with your Gemini key
    echo          your_groq_api_key_here    ^<-- with your Groq key
    echo.
    set /p CONT="Continue without API keys? (y/n): "
    if /i not "%CONT%"=="y" exit /b 0
)

echo.
echo [INFO] Upgrading pip...
python -m pip install --upgrade pip --quiet

echo [INFO] Installing backend packages (Python 3.13 safe)...
python -m pip install --prefer-binary ^
    fastapi ^
    "uvicorn[standard]" ^
    sqlalchemy ^
    pydantic ^
    pydantic-settings ^
    python-dotenv ^
    python-multipart ^
    httpx ^
    lightgbm ^
    scikit-learn ^
    numpy ^
    pandas ^
    textstat ^
    vaderSentiment ^
    google-generativeai ^
    openai ^
    groq

if errorlevel 1 (
    echo [ERROR] Backend install failed.
    echo         Try: cd backend ^&^& pip install --prefer-binary -r requirements.txt
    pause & exit /b 1
)
echo [OK] Backend packages ready

echo [INFO] Installing frontend packages (Vite)...
cd frontend
if exist node_modules (
    echo [INFO] node_modules found, skipping npm install
) else (
    call npm install
    if errorlevel 1 (echo [ERROR] npm install failed & pause & exit /b 1)
)
echo [OK] Frontend packages ready
cd ..

echo.
echo [INFO] Starting backend  ^-^>  http://localhost:8000
start "ArenaIQ Backend" cmd /k "cd backend && python main.py"
echo [INFO] Waiting for backend to boot...
timeout /t 5 /nobreak >nul

echo [INFO] Starting frontend ^-^>  http://localhost:3000
start "ArenaIQ Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo   ==========================================
echo   [OK] ArenaIQ is running!
echo   ==========================================
echo.
echo   App:      http://localhost:3000
echo   API Docs: http://localhost:8000/docs
echo.
echo   Vite starts in ~3 seconds.
echo   The browser will open automatically.
echo.
pause
