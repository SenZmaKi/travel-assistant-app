#!/bin/bash

# Travel Assistant - Update Script
# This script handles updates for the deployed application
# Usage: ./update.sh [--backend-only] [--frontend-only]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

APP_DIR="/opt/travel-assistant-app"
UPDATE_BACKEND=true
UPDATE_FRONTEND=true

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Help function
show_help() {
    cat << EOF
Travel Assistant - Update Script

Usage: $0 [OPTIONS]

Options:
    --backend-only      Update only the backend
    --frontend-only     Update only the frontend
    --help             Show this help message

Default behavior: Updates both backend and frontend

Example:
    $0                  # Update both backend and frontend
    $0 --backend-only   # Update only backend
    $0 --frontend-only  # Update only frontend

EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --backend-only)
                UPDATE_BACKEND=true
                UPDATE_FRONTEND=false
                shift
                ;;
            --frontend-only)
                UPDATE_BACKEND=false
                UPDATE_FRONTEND=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                error "Unknown option $1. Use --help for usage information."
                ;;
        esac
    done
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root. Use: sudo $0 [options]"
    fi
}

# Backup current version
backup_current() {
    log "Creating backup..."
    BACKUP_DIR="/opt/backup/travel-assistant-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    if [[ -d "$APP_DIR" ]]; then
        cp -r "$APP_DIR" "$BACKUP_DIR/"
        log "Backup created at $BACKUP_DIR"
    else
        warn "No existing installation found to backup"
    fi
}

# Update repository
update_repository() {
    log "Updating repository..."
    cd "$APP_DIR"
    
    # Stash any local changes (shouldn't be any in production)
    git stash push -m "Auto-stash before update $(date)"
    
    # Pull latest changes
    git fetch origin
    git reset --hard origin/main
    
    log "Repository updated successfully"
}

# Update backend
update_backend() {
    if [[ "$UPDATE_BACKEND" != "true" ]]; then
        return 0
    fi
    
    log "Updating backend..."
    cd "$APP_DIR/backend"
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Update Python dependencies
    pip install -r requirements.txt -q --upgrade
    
    # Restart backend service
    systemctl restart travel-assistant-backend
    
    # Wait for service to start
    sleep 3
    
    # Check if service is running
    if ! systemctl is-active --quiet travel-assistant-backend; then
        error "Backend service failed to start after update"
    fi
    
    log "Backend updated successfully"
}

# Update frontend
update_frontend() {
    if [[ "$UPDATE_FRONTEND" != "true" ]]; then
        return 0
    fi
    
    log "Updating frontend..."
    cd "$APP_DIR/frontend"
    
    # Update Node.js dependencies
    npm install --silent
    
    # Rebuild for production
    npm run build --silent
    
    # No need to restart anything - nginx serves static files
    log "Frontend updated successfully"
}

# Verify update
verify_update() {
    log "Verifying update..."
    
    # Wait for services to stabilize
    sleep 5
    
    # Get domain from nginx config
    DOMAIN=$(grep -o 'server_name [^;]*' /etc/nginx/sites-available/travel-assistant-app | awk '{print $2}' | head -1)
    
    if [[ -z "$DOMAIN" ]]; then
        warn "Could not determine domain from nginx config. Skipping endpoint tests."
        return 0
    fi
    
    # Test health endpoint
    if curl -s -f "https://$DOMAIN/health" > /dev/null; then
        log "✅ Health endpoint is working"
    else
        error "❌ Health endpoint is not accessible"
    fi
    
    # Test docs endpoint if backend was updated
    if [[ "$UPDATE_BACKEND" == "true" ]]; then
        if curl -s -f -I "https://$DOMAIN/docs" > /dev/null; then
            log "✅ API docs are working"
        else
            error "❌ API docs are not accessible"
        fi
    fi
    
    # Test frontend if frontend was updated
    if [[ "$UPDATE_FRONTEND" == "true" ]]; then
        if curl -s -f -I "https://$DOMAIN/" > /dev/null; then
            log "✅ Frontend is working"
        else
            error "❌ Frontend is not accessible"
        fi
    fi
    
    log "All endpoints are accessible"
}

# Print update summary
print_summary() {
    # Get domain and version info
    DOMAIN=$(grep -o 'server_name [^;]*' /etc/nginx/sites-available/travel-assistant-app | awk '{print $2}' | head -1)
    COMMIT_HASH=$(cd "$APP_DIR" && git rev-parse --short HEAD)
    
    cat << EOF

${GREEN}🎉 Update completed successfully!${NC}

${YELLOW}Updated Components:${NC}
EOF

    if [[ "$UPDATE_BACKEND" == "true" ]]; then
        echo "✅ Backend (FastAPI service restarted)"
    fi
    
    if [[ "$UPDATE_FRONTEND" == "true" ]]; then
        echo "✅ Frontend (Static files rebuilt)"
    fi

    cat << EOF

${YELLOW}Current Status:${NC}
📦 Version: $COMMIT_HASH
🌐 Application: https://$DOMAIN
📚 API Docs: https://$DOMAIN/docs
❤️  Health: https://$DOMAIN/health

${YELLOW}Service Status:${NC}
EOF

    # Show service statuses
    if systemctl is-active --quiet nginx; then
        echo "✅ Nginx: Active"
    else
        echo "❌ Nginx: Inactive"
    fi
    
    if systemctl is-active --quiet travel-assistant-backend; then
        echo "✅ Backend: Active"
    else
        echo "❌ Backend: Inactive"
    fi

    cat << EOF

${YELLOW}Logs:${NC}
- Backend logs: journalctl -u travel-assistant-backend -f
- Nginx access: tail -f /var/log/nginx/access.log
- Nginx error: tail -f /var/log/nginx/error.log

EOF
}

# Rollback function (for emergencies)
rollback() {
    error "Update failed. To rollback manually:"
    echo "1. Find your backup in /opt/backup/"
    echo "2. Stop services: systemctl stop travel-assistant-backend"
    echo "3. Restore backup: cp -r /opt/backup/travel-assistant-YYYYMMDD-HHMMSS/travel-assistant-app /opt/"
    echo "4. Start services: systemctl start travel-assistant-backend"
}

# Main execution with error handling
main() {
    log "Starting Travel Assistant update..."
    
    # Set up error trap
    trap rollback ERR
    
    check_root
    backup_current
    update_repository
    update_backend
    update_frontend
    verify_update
    
    # Remove error trap on success
    trap - ERR
    
    print_summary
    log "Update completed successfully!"
}

# Parse arguments and run main function
parse_args "$@"
main