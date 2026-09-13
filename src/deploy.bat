@echo off
REM ============================================
REM Sanjari Prints - Google Cloud Deployment Script
REM ============================================
REM This script deploys the application to Google Cloud Run

echo.
echo ============================================
echo  Sanjari Prints - Google Cloud Deployment
echo ============================================
echo.

REM Load environment variables from .env file
if exist .env (
    echo Loading environment variables from .env file...
    for /f "tokens=*" %%a in ('type .env ^| findstr /v "^#"') do (
        set %%a
    )
) else (
    echo ERROR: .env file not found!
    echo Please copy .env.example to .env and configure your settings.
    pause
    exit /b 1
)

REM Validate required environment variables
if "%GCP_PROJECT_ID%"=="" (
    echo ERROR: GCP_PROJECT_ID not set in .env file
    pause
    exit /b 1
)

if "%GCP_REGION%"=="" (
    set GCP_REGION=asia-south1
    echo Using default region: %GCP_REGION%
)

if "%GCP_SERVICE_NAME%"=="" (
    set GCP_SERVICE_NAME=sanjari-prints
)

if "%DOCKER_IMAGE_TAG%"=="" (
    set DOCKER_IMAGE_TAG=latest
)

set IMAGE_NAME=gcr.io/%GCP_PROJECT_ID%/sanjari-prints:%DOCKER_IMAGE_TAG%

echo.
echo Configuration:
echo   Project ID: %GCP_PROJECT_ID%
echo   Region: %GCP_REGION%
echo   Service Name: %GCP_SERVICE_NAME%
echo   Image: %IMAGE_NAME%
echo.

REM Step 1: Build the Docker image
echo ============================================
echo Step 1: Building Docker image...
echo ============================================
echo.
docker build -t %IMAGE_NAME% .
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker build failed!
    pause
    exit /b 1
)

REM Step 2: Configure Docker to use gcloud as credential helper
echo.
echo ============================================
echo Step 2: Configuring Docker authentication...
echo ============================================
echo.
gcloud auth configure-docker
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker authentication failed!
    echo Please run setup-gcloud.bat first.
    pause
    exit /b 1
)

REM Step 3: Push the image to Google Container Registry
echo.
echo ============================================
echo Step 3: Pushing image to Google Container Registry...
echo ============================================
echo.
docker push %IMAGE_NAME%
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker push failed!
    pause
    exit /b 1
)

REM Step 4: Deploy to Cloud Run
echo.
echo ============================================
echo Step 4: Deploying to Google Cloud Run...
echo ============================================
echo.
gcloud run deploy %GCP_SERVICE_NAME% ^
    --image %IMAGE_NAME% ^
    --platform managed ^
    --region %GCP_REGION% ^
    --allow-unauthenticated ^
    --port 80 ^
    --memory 512Mi ^
    --cpu 1 ^
    --min-instances 0 ^
    --max-instances 10 ^
    --set-env-vars "VITE_SUPABASE_URL=%VITE_SUPABASE_URL%,VITE_SUPABASE_ANON_KEY=%VITE_SUPABASE_ANON_KEY%,VITE_RAZORPAY_KEY_ID=%VITE_RAZORPAY_KEY_ID%,VITE_PHONEPE_MERCHANT_ID=%VITE_PHONEPE_MERCHANT_ID%,VITE_APP_URL=%VITE_APP_URL%,ALLOWED_HOSTS=*,DJANGO_SECRET_KEY=%DJANGO_SECRET_KEY%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo  Deployment Successful!
    echo ============================================
    echo.
    echo Your application is now deployed to Google Cloud Run.
    echo.
    echo To view your service:
    echo gcloud run services describe %GCP_SERVICE_NAME% --region %GCP_REGION%
    echo.
    echo To get the service URL:
    echo gcloud run services describe %GCP_SERVICE_NAME% --region %GCP_REGION% --format="value(status.url)"
    echo.
) else (
    echo.
    echo ============================================
    echo  Deployment Failed!
    echo ============================================
    echo.
    echo Please check the error messages above.
    echo.
)

pause
