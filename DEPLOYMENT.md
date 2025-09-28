# ChromaDB Browser - AWS EC2 Deployment Guide

## Prerequisites

- AWS EC2 instance with Ubuntu 20.04+ or Amazon Linux 2
- Docker installed (if using Docker deployment)
- Node.js 20+ (if using direct deployment)
- Git installed

## Deployment Options

### Option 1: Docker Deployment (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd chromadb-browser
   ```

2. **Build the Docker image:**
   ```bash
   docker build -t chromadb-browser .
   ```

3. **Run the container:**
   ```bash
   docker run -d \
     --name chromadb-browser \
     -p 3001:3001 \
     -e NODE_ENV=production \
     -e CHROMA_SERVER_HOST=your-chromadb-host \
     -e CHROMA_SERVER_HTTP_PORT=8000 \
     chromadb-browser
   ```

### Option 2: Direct Node.js Deployment

1. **Install Node.js 20+:**
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Amazon Linux 2
   curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
   sudo yum install -y nodejs
   ```

2. **Clone and setup:**
   ```bash
   git clone <your-repo-url>
   cd chromadb-browser
   npm ci --only=production
   ```

3. **Build and start:**
   ```bash
   npm run build
   npm run start:prod
   ```

## Environment Configuration

Create a `.env.production` file with the following variables:

```env
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3001
HOSTNAME=0.0.0.0

# ChromaDB Configuration
CHROMA_SERVER_HOST=localhost
CHROMA_SERVER_HTTP_PORT=8000
CHROMA_SERVER_AUTHN_PROVIDER=
CHROMA_SERVER_AUTHN_CREDENTIALS=
CHROMA_AUTH_TOKEN_TRANSPORT_HEADER=
```

## Security Configuration

1. **Configure Security Groups:**
   - Allow inbound traffic on port 3001 from your IP
   - Allow inbound traffic on port 8000 for ChromaDB (if running on same instance)

2. **Set up SSL (Optional):**
   - Use a reverse proxy like Nginx with SSL certificates
   - Configure Let's Encrypt for free SSL certificates

## Troubleshooting

### Common Issues:

1. **JavaScript chunks failing to load (400 errors):**
   - Ensure `NODE_ENV=production` is set
   - Check that the build was successful
   - Verify the Next.js configuration

2. **Application not starting:**
   - Check if port 3001 is available
   - Verify all environment variables are set
   - Check application logs

3. **ChromaDB connection issues:**
   - Verify ChromaDB is running and accessible
   - Check connection string and authentication settings
   - Ensure network connectivity between services

### Logs and Monitoring:

```bash
# Docker logs
docker logs chromadb-browser

# System logs
journalctl -u your-service-name

# Application logs
tail -f /var/log/chromadb-browser.log
```

## Performance Optimization

1. **Enable gzip compression**
2. **Set up caching headers**
3. **Use a CDN for static assets**
4. **Monitor memory and CPU usage**

## Backup and Recovery

1. **Regular backups of ChromaDB data**
2. **Application configuration backup**
3. **Database backup scripts**

## Scaling

For high-traffic deployments:
- Use a load balancer
- Deploy multiple application instances
- Use a managed database service
- Implement caching strategies
