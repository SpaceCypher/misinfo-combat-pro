#!/bin/bash

# MisInfo Combat Pro Deployment Script
# This script handles deployment to various platforms

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check environment variables
check_env_vars() {
    local required_vars=(
        "NEXT_PUBLIC_FIREBASE_API_KEY"
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    )
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            print_error "Environment variable $var is not set"
            return 1
        fi
    done
    
    print_success "All required environment variables are set"
}

# Function to run tests and checks
run_checks() {
    print_status "Running pre-deployment checks..."
    
    # Type checking
    print_status "Running TypeScript type check..."
    npm run type-check
    
    # Linting
    print_status "Running ESLint..."
    npm run lint
    
    # Build test
    print_status "Testing build process..."
    npm run build
    
    print_success "All checks passed!"
}

# Function to deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if ! command_exists vercel; then
        print_error "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    # Deploy to production
    vercel --prod --confirm
    
    print_success "Successfully deployed to Vercel!"
}

# Function to deploy to Google Cloud Platform
deploy_gcp() {
    print_status "Deploying to Google Cloud Platform..."
    
    if ! command_exists gcloud; then
        print_error "Google Cloud SDK not found. Please install it first."
        print_error "Visit: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    
    # Check if user is authenticated
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        print_error "Not authenticated with Google Cloud. Please run: gcloud auth login"
        exit 1
    fi
    
    # Deploy to App Engine
    print_status "Deploying to Google App Engine..."
    gcloud app deploy --quiet
    
    print_success "Successfully deployed to Google Cloud Platform!"
}

# Function to deploy with Docker to Google Cloud Run
deploy_cloud_run() {
    print_status "Deploying to Google Cloud Run..."
    
    if ! command_exists gcloud; then
        print_error "Google Cloud SDK not found. Please install it first."
        exit 1
    fi
    
    if ! command_exists docker; then
        print_error "Docker not found. Please install Docker first."
        exit 1
    fi
    
    # Get project ID
    PROJECT_ID=$(gcloud config get-value project)
    if [[ -z "$PROJECT_ID" ]]; then
        print_error "No Google Cloud project set. Please run: gcloud config set project YOUR_PROJECT_ID"
        exit 1
    fi
    
    # Build and push container
    print_status "Building and pushing container to Google Container Registry..."
    gcloud builds submit --tag gcr.io/$PROJECT_ID/misinfo-combat-pro
    
    # Deploy to Cloud Run
    print_status "Deploying to Cloud Run..."
    gcloud run deploy misinfo-combat-pro \
        --image gcr.io/$PROJECT_ID/misinfo-combat-pro \
        --platform managed \
        --region us-central1 \
        --allow-unauthenticated \
        --memory 1Gi \
        --cpu 1 \
        --max-instances 10 \
        --set-env-vars NODE_ENV=production
    
    print_success "Successfully deployed to Google Cloud Run!"
}

# Function to deploy using Docker
deploy_docker() {
    print_status "Building Docker image..."
    
    if ! command_exists docker; then
        print_error "Docker not found. Please install Docker first."
        exit 1
    fi
    
    # Build the image
    docker build -t misinfo-combat-pro:latest .
    
    print_success "Docker image built successfully!"
    print_status "To run the container locally:"
    print_status "docker run -p 3000:3000 misinfo-combat-pro:latest"
}

# Function to show help
show_help() {
    echo "MisInfo Combat Pro Deployment Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  vercel      Deploy to Vercel"
    echo "  gcp         Deploy to Google Cloud Platform (App Engine)"
    echo "  cloudrun    Deploy to Google Cloud Run"
    echo "  docker      Build Docker image"
    echo "  check       Run pre-deployment checks only"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 vercel"
    echo "  $0 gcp"
    echo "  $0 cloudrun"
    echo "  $0 docker"
    echo ""
}

# Main script logic
main() {
    print_status "MisInfo Combat Pro Deployment Script"
    print_status "======================================"
    
    # Check if .env.local exists
    if [[ ! -f ".env.local" ]]; then
        print_warning ".env.local file not found. Make sure to set up environment variables."
    fi
    
    case "${1:-help}" in
        "vercel")
            check_env_vars
            run_checks
            deploy_vercel
            ;;
        "gcp")
            check_env_vars
            run_checks
            deploy_gcp
            ;;
        "cloudrun")
            check_env_vars
            run_checks
            deploy_cloud_run
            ;;
        "docker")
            run_checks
            deploy_docker
            ;;
        "check")
            check_env_vars
            run_checks
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"