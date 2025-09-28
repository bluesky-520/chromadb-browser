# ChromaDB Browser - AWS EC2 Deployment Guide

## Quick Fix for Current Issues

The JavaScript chunk loading errors you're experiencing are caused by incorrect Next.js configuration for production deployment. Here's how to fix them:

### 1. Rebuild and Redeploy

After the configuration changes, you need to rebuild and redeploy:

```bash
# Stop the current application
sudo pkill -f "next start"

# Remove old build files
rm -rf .next
rm -rf node_modules

# Install dependencies
npm ci

# Build the application
npm run build

# Start the application
npm run start:prod
```

### 2. Docker Deployment (Recommended)

```bash
# Build the Docker image
docker build -t chromadb-browser .

# Run the container
docker run -d -p 3001:3001 --name chromadb-browser chromadb-browser
```

### 3. Environment Variables

Create a `.env.production` file on your EC2 instance:

```bash
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3001
HOSTNAME=0.0.0.0
```

### 4. Nginx Configuration (Optional)

If you want to use Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. Systemd Service (Optional)

Create `/etc/systemd/system/chromadb-browser.service`:

```ini
[Unit]
Description=ChromaDB Browser
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/path/to/your/app
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Then enable and start the service:

```bash
sudo systemctl enable chromadb-browser
sudo systemctl start chromadb-browser
```

## Troubleshooting

### If you still see chunk loading errors:

1. Clear browser cache completely
2. Check that the application is running on the correct port
3. Verify that all static files are being served correctly
4. Check the browser's Network tab to see which files are failing to load

### Common Issues:

- **Port conflicts**: Make sure port 3001 is not being used by another process
- **Firewall**: Ensure your EC2 security group allows traffic on port 3001
- **File permissions**: Make sure the application has proper read permissions

## Monitoring

To monitor your application:

```bash
# Check if the application is running
ps aux | grep next

# Check logs
tail -f /var/log/chromadb-browser.log

# Check port usage
netstat -tlnp | grep 3001
```