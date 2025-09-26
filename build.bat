@echo off
echo Building frontend...
cd frontend
call npm install
call npm run build
cd ..

echo Copying frontend build to backend static directory...
if not exist fastapibackend\static mkdir fastapibackend\static
xcopy /E /I frontend\dist\* fastapibackend\static\

echo Build complete!
pause
