# Travel Assistant - Production Deployment Guide

This guide provides step-by-step instructions for deploying the Travel Assistant app on a production server (tested on Ubuntu 24.04 LTS).

## Prerequisites

- Ubuntu 24.04 LTS server with root access
- Domain name pointed to your server's IP address
- Valid email address for SSL certificate registration
- Google Gemini API key

## Manual Deployment Instructions

### 1. Initial Server Setup

Update the system and install dependencies:

```bash
# Update system packages
apt update && apt upgrade -y

# Install required packages
apt install -y python3-pip python3-venv nodejs npm nginx certbot python3-certbot-nginx git
```

### 2. Clone Repository

```bash
# Clone to /opt directory
cd /opt
git clone https://github.com/SenZmaKi/travel-assistant-app.git
cd travel-assistant-app
```

### 3. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create environment file
cat > .env << 'EOF'
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGINS=https://your-domain.com
EOF
```

**Important:** Replace `your_gemini_api_key_here` with your actual Gemini API key and `your-domain.com` with your domain.

### 4. Frontend Setup

```bash
cd ../frontend

# Install Node.js dependencies
npm install

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
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://your-domain.com
EOF

# Build for production
npm run build
```

**Important:** Replace `your-domain.com` with your actual domain.

### 5. Nginx Configuration

Create nginx configuration file:

```bash
cat > /etc/nginx/sites-available/travel-assistant-app << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend - served statically by nginx
    location / {
        root /opt/travel-assistant-app/frontend/out;
        index index.html;
        try_files $uri $uri.html $uri/index.html /index.html;
        
        # Cache static assets
        location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API routes - proxy to backend
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        
        # CORS headers for API
        add_header Access-Control-Allow-Origin "https://your-domain.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Swagger docs endpoint
    location /docs {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # OpenAPI JSON endpoint
    location /openapi.json {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
```

**Important:** Replace all instances of `your-domain.com` with your actual domain.

Enable the site:

```bash
# Enable site and remove default
ln -sf /etc/nginx/sites-available/travel-assistant-app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Start and enable nginx
systemctl start nginx
systemctl enable nginx
```

### 6. SSL Certificate Setup

```bash
# Install SSL certificate using certbot
certbot --nginx -d your-domain.com --non-interactive --agree-tos --email your-email@domain.com

# Enable automatic renewal
systemctl enable certbot.timer
```

**Important:** Replace `your-domain.com` with your domain and `your-email@domain.com` with your email.

### 7. Backend Service Setup

Create systemd service for the backend:

```bash
cat > /etc/systemd/system/travel-assistant-backend.service << 'EOF'
[Unit]
Description=Travel Assistant Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/travel-assistant-app/backend
Environment=PATH=/opt/travel-assistant-app/backend/venv/bin
ExecStart=/opt/travel-assistant-app/backend/venv/bin/python main.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start service
systemctl daemon-reload
systemctl enable travel-assistant-backend
systemctl start travel-assistant-backend
```

### 8. Verification

Check that all services are running:

```bash
# Check service status
systemctl status nginx travel-assistant-backend

# Test endpoints
curl -s https://your-domain.com/health
curl -s https://your-domain.com/docs -I

# Test API
curl -s -X POST https://your-domain.com/api/query \
  -H 'Content-Type: application/json' \
  -d '{"question":"Test query"}'
```

## Deployment Architecture

```
Internet → Cloudflare → Nginx (Port 80/443) → {
  ├── Frontend (Static files from /out directory)
  └── API Routes → FastAPI Backend (Port 8000)
}
```

## Service Management

### Backend Service Commands

```bash
# Start/stop/restart backend
systemctl start travel-assistant-backend
systemctl stop travel-assistant-backend
systemctl restart travel-assistant-backend

# View logs
journalctl -u travel-assistant-backend -f

# Check status
systemctl status travel-assistant-backend
```

### Nginx Commands

```bash
# Test configuration
nginx -t

# Reload configuration
systemctl reload nginx

# Restart nginx
systemctl restart nginx

# View logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Updating the Application

### Backend Updates

```bash
cd /opt/travel-assistant-app
git pull origin main

# Restart backend service
systemctl restart travel-assistant-backend
```

### Frontend Updates

```bash
cd /opt/travel-assistant-app
git pull origin main

cd frontend
npm install
npm run build

# No restart needed - nginx serves static files
```

## Troubleshooting

### Common Issues

1. **Backend not starting**
   ```bash
   # Check logs
   journalctl -u travel-assistant-backend -n 50
   
   # Check if port 8000 is in use
   netstat -tlnp | grep 8000
   ```

2. **SSL certificate issues**
   ```bash
   # Check certificate status
   certbot certificates
   
   # Renew certificate manually
   certbot renew --dry-run
   ```

3. **Nginx configuration errors**
   ```bash
   # Test configuration
   nginx -t
   
   # Check error logs
   tail -f /var/log/nginx/error.log
   ```

4. **Frontend not loading**
   ```bash
   # Check if build files exist
   ls -la /opt/travel-assistant-app/frontend/out/
   
   # Check nginx access logs
   tail -f /var/log/nginx/access.log
   ```

### Performance Monitoring

```bash
# Monitor system resources
htop

# Monitor nginx processes
ps aux | grep nginx

# Monitor backend processes
ps aux | grep python

# Check disk usage
df -h
```

## Security Considerations

- Keep system packages updated: `apt update && apt upgrade`
- Monitor SSL certificate expiration
- Regular backup of application data
- Firewall configuration (allow ports 80, 443, SSH)
- Consider rate limiting for API endpoints

## File Locations

- **Application**: `/opt/travel-assistant-app/`
- **Nginx config**: `/etc/nginx/sites-available/travel-assistant-app`
- **SSL certificates**: `/etc/letsencrypt/live/your-domain.com/`
- **Backend logs**: `journalctl -u travel-assistant-backend`
- **Nginx logs**: `/var/log/nginx/`
- **Systemd service**: `/etc/systemd/system/travel-assistant-backend.service`