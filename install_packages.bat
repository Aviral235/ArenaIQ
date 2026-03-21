@echo off
title ArenaIQ Installer

echo.
echo   ===================================
echo   ArenaIQ v2 Package Installer
echo   Python 3.10 - 3.13 Compatible
echo   ===================================
echo.

echo [1/6] Upgrading pip...
python -m pip install --upgrade pip setuptools wheel --quiet
echo [OK] pip upgraded

echo [2/6] FastAPI + server...
python -m pip install --prefer-binary fastapi "uvicorn[standard]" sqlalchemy pydantic pydantic-settings python-dotenv python-multipart httpx --quiet
echo [OK]

echo [3/6] ML packages (no version pins)...
python -m pip install --prefer-binary numpy pandas lightgbm scikit-learn --quiet
echo [OK]

echo [4/6] NLP helpers...
python -m pip install --prefer-binary textstat vaderSentiment --quiet
echo [OK]

echo [5/6] LLM API clients...
python -m pip install --prefer-binary google-generativeai openai groq --quiet
echo [OK]

echo [6/6] Frontend (Vite)...
cd frontend
call npm install
cd ..
echo [OK]

echo.
echo [Verifying Python packages...]
python -c "import fastapi, lightgbm, sklearn, numpy, pandas, google.generativeai, openai, groq; print('[OK] All packages verified successfully')"
if errorlevel 1 (
    echo [WARN] Some packages missing - check errors above
) else (
    echo.
    echo   ===================================
    echo   Installation complete!
    echo   Now run: start.bat
    echo   ===================================
)
echo.
pause
