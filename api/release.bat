@echo off
if "%~1"=="" (
    echo Usage: release.bat ^<version^>
    echo Example: release.bat 1.0.12
    exit /b 1
)
set VERSION=%~1

cd /d "%~dp0..\app"
echo Building app...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed.
    exit /b 1
)
echo Copying to wwwroot...
if exist "..\api\wwwroot" rmdir /s /q "..\api\wwwroot"
mkdir "..\api\wwwroot"
xcopy ".\build" "..\api\wwwroot" /s /e /i /q

cd /d "%~dp0"
dotnet publish --os linux --arch x64 -p:PublishProfile=DefaultContainer
docker tag todo-application:latest michfiala/todo-application:%VERSION%
docker push michfiala/todo-application:%VERSION%

echo Done. Tagged as michfiala/todo-application:%VERSION%
