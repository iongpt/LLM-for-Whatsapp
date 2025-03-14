@echo off
echo Setting up WhatsApp LLM Assistant...

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
    
    :: Refresh PATH
    call RefreshEnv.cmd || (
        echo RefreshEnv.cmd not found. Please restart this script in a new command prompt.
        pause
        exit /b 1
    )
    
    echo Node.js installed successfully.
) else (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo Node.js is already installed: %NODE_VERSION%
)

:: Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo npm is not installed. It should have been installed with Node.js.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
    echo npm is already installed: %NPM_VERSION%
)

:: Get the directory where the script is located
set SCRIPT_DIR=%~dp0
cd %SCRIPT_DIR%

:: Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

:: Start the application
echo Starting WhatsApp LLM Assistant...
call npm run start

pause
exit /b 0