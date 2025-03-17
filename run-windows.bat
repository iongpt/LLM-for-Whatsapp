@echo off
echo Setting up WhatsApp LLM Assistant...

:: Get the directory where the script is located
set SCRIPT_DIR=%~dp0
cd %SCRIPT_DIR%

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js is not installed. Installing...
    
    :: Download Node.js installer
    echo Downloading Node.js installer...
    powershell -Command "& {Invoke-WebRequest -Uri 'https://nodejs.org/dist/v18.16.0/node-v18.16.0-x64.msi' -OutFile 'node-installer.msi'}"
    
    :: Install Node.js silently
    echo Installing Node.js...
    start /wait msiexec /i node-installer.msi /qn
    
    :: Clean up
    del node-installer.msi
    
    echo Node.js has been installed. You need to close this window and run the script again.
    echo The PATH environment variable needs to be updated before proceeding.
    pause
    exit /b 0
) else (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo Node.js is already installed: %NODE_VERSION%
)

:: Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo npm is not installed. It should have been installed with Node.js.
    echo Please close this window and run the script again.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
    echo npm is already installed: %NPM_VERSION%
)

:: Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    
    if %ERRORLEVEL% neq 0 (
        echo Failed to install dependencies. Please check your internet connection and try again.
        pause
        exit /b 1
    )
)

:: Check if electron is installed in node_modules
if not exist "node_modules\.bin\electron.cmd" (
    echo Installing electron locally...
    call npm install electron --save-dev
    
    if %ERRORLEVEL% neq 0 (
        echo Failed to install electron. Please check your internet connection and try again.
        pause
        exit /b 1
    )
)

:: Start the application using npx to ensure correct path resolution
echo Starting WhatsApp LLM Assistant...
call npx electron .

if %ERRORLEVEL% neq 0 (
    echo Failed to start the application. Please check the error message above.
    pause
    exit /b 1
)

pause
exit /b 0