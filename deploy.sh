#!/bin/bash

################################################################################
# EarlyPath SaaS Production Deployment Script
# 
# This script automates the deployment process on DigitalOcean production server.
# Run this script after pushing code changes to your Git repository.
#
# Usage: ./deploy.sh
# Or with git pull: ./deploy.sh production
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/sistemsaas"  # Change to your project path
BRANCH=${1:-main}  # Default branch is 'main'
BACKUP_DIR="/var/backups/sistemsaas"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

################################################################################
# Functions
################################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

################################################################################
# Main Deployment Process
################################################################################

log_info "Starting deployment process..."
log_info "Project Directory: $PROJECT_DIR"
log_info "Branch: $BRANCH"
log_info "Timestamp: $TIMESTAMP"

# 1. Create backup
log_info "Step 1/10: Creating backup..."
mkdir -p $BACKUP_DIR
if [ -d "$PROJECT_DIR/.env" ]; then
    cp "$PROJECT_DIR/.env" "$BACKUP_DIR/.env.backup_$TIMESTAMP"
    log_success "Environment file backed up"
fi

# 2. Navigate to project
log_info "Step 2/10: Navigating to project directory..."
cd $PROJECT_DIR || { log_error "Project directory not found!"; exit 1; }
log_success "In project directory: $(pwd)"

# 3. Pull latest changes
log_info "Step 3/10: Pulling latest changes from Git (branch: $BRANCH)..."
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH
log_success "Git pull completed"

# 4. Backend: Install/update PHP dependencies
log_info "Step 4/10: Installing backend dependencies (Composer)..."
cd backend
composer install --no-dev --optimize-autoloader
log_success "Composer dependencies installed"

# 5. Frontend: Install/update Node dependencies
log_info "Step 5/10: Installing frontend dependencies (npm)..."
cd ../frontend
npm ci  # Use 'npm ci' instead of 'npm install' for production
log_success "NPM dependencies installed"

# 6. Frontend: Build production assets
log_info "Step 6/10: Building frontend production assets (Vite)..."
npm run build
log_success "Frontend build completed"

# 7. Backend: Laravel setup
log_info "Step 7/10: Setting up Laravel..."
cd ../backend

# Generate APP_KEY if missing
if [ -z "$(grep 'APP_KEY=' .env | grep -v '^#')" ]; then
    log_warning "APP_KEY not set, generating..."
    php artisan key:generate --force
fi

# 8. Database migrations
log_info "Step 8/10: Running database migrations..."
php artisan migrate --force
log_success "Migrations completed"

# 9. Clear and rebuild caches
log_info "Step 9/10: Clearing and rebuilding caches..."
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
php artisan optimize:clear  # If using event caching
log_success "Caches cleared and rebuilt"

# 10. Fix permissions
log_info "Step 10/10: Fixing file permissions..."
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
log_success "Permissions fixed"

################################################################################
# Post-Deployment
################################################################################

log_success "========================================"
log_success "Deployment completed successfully!"
log_success "========================================"
log_info "Summary:"
log_info "  - Code updated from branch: $BRANCH"
log_info "  - Backend dependencies installed"
log_info "  - Frontend built and deployed"
log_info "  - Database migrations applied"
log_info "  - Caches cleared and rebuilt"
log_info "  - File permissions updated"
log_info ""
log_info "Next steps:"
log_info "  1. Verify the website is working: https://yourdomain.com"
log_info "  2. Check Laravel logs: tail -f storage/logs/laravel.log"
log_info "  3. Monitor server: htop or top"
log_info ""
log_warning "If issues occur, restore backup from: $BACKUP_DIR/.env.backup_$TIMESTAMP"

exit 0
