# Nodebase VPS Deployment Guide

This directory contains the configuration files needed to set up your dedicated VPS for:
1.  **WhatsApp Integration (WAHA)**: Hosting the WhatsApp HTTP API.
2.  **Vibecoding Execution Environment**: Offloading heavy code execution from Vercel.

## 1. Prerequisites

You will need an SSH client (like PuTTY or Terminal).
- **IP**: `103.194.228.66`
- **User**: `root`

## 2. Connect to VPS

Open your terminal and run:
```bash
ssh root@103.194.228.66
# Enter your VPS password when prompted
```

## 3. Upload Files

You need to copy the `deploy/vps` folder to your server. Run this from your **local machine** (where this project is):

```bash
# If using SCP (Linux/Mac/Windows PowerShell)
scp -r deploy/vps root@103.194.228.66:/root/nodebase-vps
```

*Alternatively, you can create the files manually on the server using `nano` or `vim`.*

## 4. Deploy Services

On the VPS, run:

```bash
cd /root/nodebase-vps

# Create .env file for secrets
echo "VPS_API_KEY=your-secure-random-key-here" > .env
echo "WAHA_API_KEY=your-secure-waha-key-here" >> .env

# Start services
# Install Docker Compose plugin if missing (Ubuntu 22.04)
apt-get update
apt-get install -y docker-compose-plugin

docker compose up -d --build
```

## 5. Verify Deployment

- **WAHA**: Open `http://103.194.228.66:3000/dashboard` in your browser.
- **Vibecoding**: Test health check `curl http://103.194.228.66:8000/health`

## 6. Update Vercel Environment Variables

Go to your Vercel Project Settings > Environment Variables and add/update:

1.  **WAHA_SERVER_URL**: `http://103.194.228.66:3000`
2.  **WAHA_API_KEY** (optional): If you set `WAHA_API_KEY` in the VPS compose env, set the same value on Vercel.
3.  **VPS_API_URL**: `http://103.194.228.66:8000`
4.  **VPS_API_KEY**: The key you set in step 4.

---

**Security Note**:
For production, you should:
1.  Set up a reverse proxy (Nginx/Caddy) with SSL (HTTPS).
2.  Configure firewall (UFW) to only allow port 80/443 and restrict 3000/8000 to Vercel IPs if possible.
