#!/bin/bash

# Travel Assistant - Automated Deployment Script
# This script automates the deployment of the Travel Assistant app on Ubuntu 24.04 LTS
# Usage: ./deploy.sh --domain your-domain.com --email your-email@domain.com --gemini-key your_api_key

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
DOMAIN=""
EMAIL=""
GEMINI_KEY=""
REPO_URL="https://github.com/SenZmaKi/travel-assistant-app.git"
APP_DIR="/opt/travel-assistant-app"

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
Travel Assistant - Automated Deployment Script

Usage: $0 [OPTIONS]

Required Options:
    --domain DOMAIN         Your domain name (e.g., travel-app.example.com)
    --email EMAIL          Email address for SSL certificate registration
    --gemini-key KEY       Google Gemini API key

Optional Options:
    --repo-url URL         Git repository URL (default: https://github.com/SenZmaKi/travel-assistant-app.git)
    --app-dir DIR          Application directory (default: /opt/travel-assistant-app)
    --help                 Show this help message

Example:
    $0 --domain travel-app.example.com --email admin@example.com --gemini-key AIza...

EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --domain)
                DOMAIN="$2"
                shift 2
                ;;
            --email)
                EMAIL="$2"
                shift 2
                ;;
            --gemini-key)
                GEMINI_KEY="$2"
                shift 2
                ;;
            --repo-url)
                REPO_URL="$2"
                shift 2
                ;;
            --app-dir)
                APP_DIR="$2"
                shift 2
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                error "Unknown option $1"
                ;;
        esac
    done

    # Validate required arguments
    if [[ -z "$DOMAIN" ]]; then
        error "Domain is required. Use --domain your-domain.com"
    fi

    if [[ -z "$EMAIL" ]]; then
        error "Email is required. Use --email your-email@domain.com"
    fi

    if [[ -z "$GEMINI_KEY" ]]; then
        error "Gemini API key is required. Use --gemini-key your_api_key"
    fi
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root. Use: sudo $0 [options]"
    fi
}

# Check OS compatibility
check_os() {
    if [[ ! -f /etc/lsb-release ]] || ! grep -q "Ubuntu" /etc/lsb-release; then
        warn "This script is designed for Ubuntu. Other distributions may not work correctly."
    fi
}

# Update system packages
update_system() {
    log "Updating system packages..."
    apt update -qq
    apt upgrade -y -qq
    log "System packages updated successfully"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    apt install -y -qq \
        python3-pip \
        python3-venv \
        nodejs \
        npm \
        nginx \
        certbot \
        python3-certbot-nginx \
        git \
        curl
    log "Dependencies installed successfully"
}

# Clone repository
clone_repository() {
    log "Cloning repository..."
    if [[ -d "$APP_DIR" ]]; then
        warn "Application directory already exists. Removing..."
        rm -rf "$APP_DIR"
    fi
    
    mkdir -p "$(dirname "$APP_DIR")"
    git clone "$REPO_URL" "$APP_DIR"
    log "Repository cloned successfully"
}

# Setup backend
setup_backend() {
    log "Setting up backend..."
    cd "$APP_DIR/backend"
    
    # Create virtual environment
    python3 -m venv venv
    source venv/bin/activate
    
    # Install Python dependencies
    pip install -r requirements.txt -q
    
    # Create environment file
    cat > .env << EOF
GEMINI_API_KEY=$GEMINI_KEY
CORS_ORIGINS=https://$DOMAIN
EOF

    log "Backend setup completed"
}

# Setup frontend
setup_frontend() {
    log "Setting up frontend..."
    cd "$APP_DIR/frontend"
    
    # Install Node.js dependencies
    npm install --silent
    
    # Update Next.js configuration for static export
    cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
EOF

    # Create production environment file
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://$DOMAIN
EOF

    # Build for production
    npm run build --silent
    
    log "Frontend setup completed"
}

# Configure nginx
configure_nginx() {
    log "Configuring nginx..."
    
    cat > /etc/nginx/sites-available/travel-assistant-app << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend - served statically by nginx
    location / {
        root $APP_DIR/frontend/out;
        index index.html;
        try_files \$uri \$uri.html \$uri/index.html /index.html;
        
        # Cache static assets
        location ~* \\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API routes - proxy to backend
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        
        # CORS headers for API
        add_header Access-Control-Allow-Origin "https://$DOMAIN" always;
        add_header Access-Control-Allow-Methods "GET, POST, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Swagger docs endpoint
    location /docs {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # OpenAPI JSON endpoint
    location /openapi.json {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    # Enable site and remove default
    ln -sf /etc/nginx/sites-available/travel-assistant-app /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test configuration
    nginx -t
    
    # Start and enable nginx
    systemctl start nginx
    systemctl enable nginx
    
    log "Nginx configured successfully"
}

# Setup SSL certificate
setup_ssl() {
    log "Setting up SSL certificate..."
    
    # Install SSL certificate using certbot
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "$EMAIL"
    
    # Enable automatic renewal
    systemctl enable certbot.timer
    
    log "SSL certificate installed successfully"
}

# Create systemd service
create_service() {
    log "Creating systemd service..."
    
    cat > /etc/systemd/system/travel-assistant-backend.service << EOF
[Unit]
Description=Travel Assistant Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR/backend
Environment=PATH=$APP_DIR/backend/venv/bin
ExecStart=$APP_DIR/backend/venv/bin/python main.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

    # Reload systemd and start service
    systemctl daemon-reload
    systemctl enable travel-assistant-backend
    systemctl start travel-assistant-backend
    
    log "Backend service created and started"
}

# Verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    # Wait for services to start
    sleep 5
    
    # Check service status
    if ! systemctl is-active --quiet nginx; then
        error "Nginx is not running"
    fi
    
    if ! systemctl is-active --quiet travel-assistant-backend; then
        error "Backend service is not running"
    fi
    
    # Test endpoints
    log "Testing endpoints..."
    
    # Test health endpoint
    if ! curl -s -f "https://$DOMAIN/health" > /dev/null; then
        error "Health endpoint is not accessible"
    fi
    
    # Test docs endpoint
    if ! curl -s -f -I "https://$DOMAIN/docs" > /dev/null; then
        error "Docs endpoint is not accessible"
    fi
    
    # Test frontend
    if ! curl -s -f -I "https://$DOMAIN/" > /dev/null; then
        error "Frontend is not accessible"
    fi
    
    log "All endpoints are accessible"
}

# Print deployment summary
print_summary() {
    cat << EOF

${GREEN}🎉 Deployment completed successfully!${NC}

Your Travel Assistant app is now live at:
${YELLOW}🌐 Frontend:${NC} https://$DOMAIN
${YELLOW}📚 API Docs:${NC} https://$DOMAIN/docs
${YELLOW}❤️  Health:${NC} https://$DOMAIN/health

${YELLOW}Service Management:${NC}
- Backend: systemctl [start|stop|restart] travel-assistant-backend
- Nginx: systemctl [start|stop|restart] nginx
- View logs: journalctl -u travel-assistant-backend -f

${YELLOW}Files Locations:${NC}
- App directory: $APP_DIR
- Nginx config: /etc/nginx/sites-available/travel-assistant-app
- SSL certificates: /etc/letsencrypt/live/$DOMAIN/
- Backend service: /etc/systemd/system/travel-assistant-backend.service

${YELLOW}Next Steps:${NC}
1. Test the application thoroughly
2. Set up monitoring and backups
3. Configure firewall if needed
4. Consider setting up log rotation

For troubleshooting, check the deployment README at:
$APP_DIR/deployment/README.md

EOF
}

# Main execution
main() {
    log "Starting Travel Assistant deployment..."
    
    check_root
    check_os
    update_system
    install_dependencies
    clone_repository
    setup_backend
    setup_frontend
    configure_nginx
    setup_ssl
    create_service
    verify_deployment
    print_summary
    
    log "Deployment completed successfully!"
}

# Parse arguments and run main function
parse_args "$@"
main