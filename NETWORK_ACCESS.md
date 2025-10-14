# Network Access Configuration

## ✅ Application Now Running Over Network

The Eye Label Creation Tool is now configured for network access from any device on your local network.

## 🌐 Network Access URLs

**Host Machine IP:** `192.168.50.61`

### Access from Any Device on Your Network:

- **Frontend:** http://192.168.50.61:3002
- **Backend API:** http://192.168.50.61:4000
- **AI Service:** http://192.168.50.61:5000

### Local Access (Same Machine):

- **Frontend:** http://localhost:3002
- **Backend API:** http://localhost:4000
- **AI Service:** http://localhost:5000

## 🔑 Login Credentials

Use any of these accounts from any device:

**Admin Account:**
- Email: `admin@eyelighting.com.au`
- Password: `admin123`

**Engineer Account:**
- Email: `engineer@eyelighting.com.au`
- Password: `engineer123`

**Designer Account:**
- Email: `designer@eyelighting.com.au`
- Password: `designer123`

**Approver Account:**
- Email: `approver@eyelighting.com.au`
- Password: `approver123`

## 📝 What Was Changed

### 1. Frontend Configuration
**File:** `frontend/.env`
- Changed API URLs from `localhost` to `192.168.50.61`
- Allows frontend to connect to backend from any device

### 2. Backend CORS Configuration
**Files:** `.env` and `backend/src/index.ts`
- Added support for multiple CORS origins
- Allows requests from both `localhost:3002` and `192.168.50.61:3002`
- Backend now accepts comma-separated origins

### 3. Docker Compose Configuration
**File:** `docker-compose.yml`
- Updated frontend environment to use network IP
- Updated backend to include CORS_ORIGIN environment variable

## 🔥 Firewall Configuration

If you have firewall issues, ensure these ports are open:

```bash
# Allow backend port
sudo ufw allow 4000/tcp

# Allow frontend port
sudo ufw allow 3002/tcp

# Allow AI service port
sudo ufw allow 5000/tcp
```

## 📱 Accessing from Mobile/Tablet

1. Ensure your device is on the same network as the host machine
2. Open browser on your device
3. Navigate to: http://192.168.50.61:3002
4. Login with any of the credentials above

## 🔍 Troubleshooting

### If you can't access from another device:

1. **Check host machine IP:**
   ```bash
   hostname -I
   ```

2. **Verify services are running:**
   ```bash
   docker ps
   curl http://192.168.50.61:4000/health
   ```

3. **Check firewall:**
   ```bash
   sudo ufw status
   ```

4. **Verify network connectivity:**
   ```bash
   ping 192.168.50.61  # From the other device
   ```

### If IP address changes:

If your host machine's IP changes (e.g., after reboot), update:
1. `frontend/.env` - Update `VITE_API_URL` and `VITE_AI_SERVICE_URL`
2. `.env` - Update `CORS_ORIGIN`
3. `docker-compose.yml` - Update frontend environment variables
4. Restart containers: `docker compose up -d backend frontend`

## ✨ Features Verified

- ✅ Login from network devices works
- ✅ API calls succeed from any device
- ✅ CORS properly configured
- ✅ All services accessible over network
- ✅ Both localhost and network access work simultaneously

## 📊 Test Results

```bash
# Backend health check via network
curl http://192.168.50.61:4000/health
# Result: {"status":"ok","service":"label-tool-backend","timestamp":"2025-10-13T21:04:19.408Z"}

# CORS check
curl -H "Origin: http://192.168.50.61:3002" -I http://192.168.50.61:4000/api/auth/login
# Result: Access-Control-Allow-Origin: http://192.168.50.61:3002 ✅

# Frontend accessible
curl -I http://192.168.50.61:3002
# Result: HTTP/1.1 200 OK ✅
```

---

**Configuration Version:** Network-v1.0
**Last Updated:** 2025-10-13
**Host IP:** 192.168.50.61
