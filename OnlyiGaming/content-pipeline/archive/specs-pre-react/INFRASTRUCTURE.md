# Content-Pipeline Infrastructure

**Single source of truth for all running services, ports, and state.**

---

## Quick Reference

| Service | Location | Port | Check Command |
|---------|----------|------|---------------|
| **Express API** | Hetzner | 3000 | `curl http://188.245.110.34:3000/health` |
| **Redis** | Hetzner | 6379 | `ssh hetzner "redis-cli ping"` |
| **BullMQ Workers** | Hetzner | — | `ssh hetzner "pm2 list"` |
| **React Dev** | Local | 5173 | `curl http://localhost:5173` |
| **Supabase** | Cloud | — | Dashboard or `psql` |

---

## Service Locations

### Hetzner Server (188.245.110.34)

```
SSH: ssh hetzner  (uses ~/.ssh/hetzner_key)
Path: /opt/content-pipeline/
PM2 processes: content-pipeline-api, content-pipeline-worker
```

**To check everything on Hetzner:**
```bash
ssh hetzner "pm2 list && redis-cli ping && curl -s localhost:3000/health"
```

### Local Development

**Unified command:** `npm run dev` (starts API + React together)

```
cd ~/Dropbox/content-pipeline
npm run dev
```

| Service | Port | Notes |
|---------|------|-------|
| Express API | 3000 | Backend API only (no UI) |
| React Dev | 5173 | **USE THIS** - has hot reload, proxies /api to 3000 |

**Important:** Access the app at `http://localhost:5173`, not port 3000.

*Old Alpine.js dashboard removed (was in `/public/`)*

### Cloud Services

```
Supabase: https://fevxvwqjhndetktujeuu.supabase.co
  Dashboard: https://supabase.com/dashboard/project/fevxvwqjhndetktujeuu

GitHub: (repos not yet created - see pending actions)
```

---

## State Checklist

**Run this at session start or when confused:**

```bash
# 1. Check git state (local)
cd ~/Dropbox/content-pipeline && git status

# 2. Check Hetzner services
ssh hetzner "pm2 list"

# 3. Check Redis
ssh hetzner "redis-cli ping"

# 4. Check API health
curl -s http://188.245.110.34:3000/health

# 5. Check what's running locally
lsof -i :5173 -i :3000 -i :3001 2>/dev/null | grep LISTEN
```

---

## Common Issues & Where to Fix Them

| Symptom | NOT Here | Fix Here |
|---------|----------|----------|
| SSH connection fails | Hetzner console | Local: `ssh-add ~/.ssh/id_ed25519` |
| API returns 500 | Hetzner console | SSH + `pm2 logs content-pipeline-api` |
| React not loading | Hetzner | Local: `cd client && npm run dev` |
| Database errors | Hetzner | Supabase dashboard |
| Code not deployed | GitHub | Local: `git status` then deploy |
| Redis connection refused | Hetzner console | SSH + `sudo systemctl status redis` |

**RULE: Never use Hetzner web console. Always SSH.**

---

## Deployment

### Deploy code to Hetzner

```bash
# From local
cd ~/Dropbox/content-pipeline
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'client' . hetzner:/opt/content-pipeline/

# On Hetzner
ssh hetzner "cd /opt/content-pipeline && npm install && pm2 restart all"
```

### Deploy React client (when ready for production)

```bash
cd ~/Dropbox/content-pipeline/client
npm run build
rsync -avz dist/ hetzner:/opt/content-pipeline/public/
```

---

## Port Registry

| Port | Service | Where |
|------|---------|-------|
| 3000 | Express API | Hetzner |
| 5173 | Vite dev server | Local |
| 6379 | Redis | Hetzner (localhost only) |
| 5432 | PostgreSQL | Supabase (cloud) |

**If you see a different port number, something is wrong.**

---

## Credentials Location

| Service | Credential Location |
|---------|---------------------|
| Hetzner SSH | `~/.ssh/hetzner_key` |
| Redis password | `Danne2025` (in Hetzner .env) |
| Supabase | `~/Dropbox/content-pipeline/.env` |

---

## Pending Infrastructure Tasks

- [ ] Create GitHub repos and push
- [ ] Set up GitHub Actions CI/CD
- [ ] Add health check endpoint to API
- [ ] Configure PM2 ecosystem file

---

*Last updated: 2026-02-04*
