# Hetzner Server Operations

**CRITICAL: Read this BEFORE attempting any Hetzner troubleshooting**

## Server Details

| Property | Value |
|----------|-------|
| IP Address | 188.245.110.34 |
| SSH Alias | `ssh hetzner` |
| User | root |
| SSH Key | ~/.ssh/id_ed25519 |
| App Location | /opt/content-pipeline |
| Process Manager | PM2 |

## Golden Rule

**NEVER troubleshoot SSH via Hetzner console.** The console:
- Cannot paste text
- Drops characters when typing
- Makes SSH key entry nearly impossible

**ALWAYS diagnose locally first.**

## SSH Not Working? Follow This Checklist

### Step 1: Check if key is in agent (90% of issues)
```bash
ssh-add -l
```

If your key isn't listed:
```bash
ssh-add ~/.ssh/id_ed25519
```
Enter passphrase when prompted. **This fixes most issues.**

### Step 2: Verify IP address
Go to Hetzner Cloud Console → Servers → Check the IP matches 188.245.110.34

If IP changed, update SSH config:
```bash
nano ~/.ssh/config
# Update the HostName under "Host hetzner"
```

### Step 3: Test with verbose output
```bash
ssh -v hetzner "echo test"
```

Look for:
- "Offering public key" → key is being tried
- "Server accepts key" → key is correct, check passphrase
- "Permission denied" after accept → passphrase issue, run ssh-add

### Step 4: Check SSH config exists
```bash
cat ~/.ssh/config | grep -A5 "Host hetzner"
```

Should show:
```
Host hetzner
  HostName 188.245.110.34
  User root
  IdentityFile ~/.ssh/id_ed25519
  IdentitiesOnly yes
```

## Deployment Commands

Once SSH works:

```bash
# Deploy code
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.env' \
  ~/Dropbox/content-pipeline/ hetzner:/opt/content-pipeline/

# Restart app
ssh hetzner "pm2 restart all"

# Check status
ssh hetzner "pm2 status"

# View logs
ssh hetzner "pm2 logs --lines 50"
```

## If All Else Fails

1. **Reset root password** via Hetzner Console (not SSH)
2. **Enable password auth** temporarily (requires console, last resort)
3. **Recreate server** with SSH key added during creation

## Future Improvement: GitHub Actions

To eliminate SSH deployment entirely, set up GitHub Actions:
- Push to main → auto-deploys to Hetzner
- No SSH required for routine deployments
- See: `.github/workflows/deploy.yml` (to be created)

---

**Last updated:** 2026-01-30
**Lesson learned from:** 2+ hours debugging SSH when fix was `ssh-add`
