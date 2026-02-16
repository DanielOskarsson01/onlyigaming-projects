# Content-Pipeline Developer Workflow

**For:** Solo developer + AI coding assistants
**Goal:** Minimize context loss, infrastructure confusion, and debugging dead-ends
**Last Updated:** 2026-02-03

---

## The 10-Second Rule

**Before any work, run the 10-second infrastructure check.**
If it fails, follow recovery procedures. Don't guess.

---

## Pre-Work: Kill Zombie Processes

**Before starting development, clean up any stale processes:**

```bash
# Kill any zombie node/vite processes from previous sessions
pkill -f "content-pipeline" 2>/dev/null
pkill -f "vite" 2>/dev/null
lsof -i :3000 -i :5173 2>/dev/null | grep LISTEN  # Should be empty now
```

Then start fresh with the unified dev command:
```bash
cd ~/Dropbox/content-pipeline
npm run dev
```

---

## Pre-Work Infrastructure Check

Copy-paste this into your terminal at session start:

```bash
# Local: Check Vite dev server
curl -s http://localhost:5173 > /dev/null && echo "✓ Local Vite running" || echo "✗ Local Vite DOWN"

# Hetzner: Check API + Redis
ssh hetzner "curl -s http://localhost:3000/health > /dev/null && echo '✓ API up' || echo '✗ API down'; redis-cli -a Danne2025 ping > /dev/null 2>&1 && echo '✓ Redis up' || echo '✗ Redis down'"

# Supabase: Check connection
curl -s -H "apikey: $(grep SUPABASE_KEY .env | cut -d '=' -f2)" https://fevxvwqjhndetktujeuu.supabase.co/rest/v1/ > /dev/null && echo "✓ Supabase reachable" || echo "✗ Supabase unreachable"
```

**Expected output:**
```
✓ Local Vite running
✓ API up
✓ Redis up
✓ Supabase reachable
```

**If anything shows ✗, STOP and run recovery procedures below.**

---

## Holistic Implementation Checklist

**Problem:** Claude codes too narrow-minded, forgetting layers needed to complete a feature.

**Before implementing ANY feature, check all affected layers:**

```
IMPLEMENTATION SCOPE CHECK

Feature: [What we're building]

Layers affected:
[ ] Database (Supabase) - New tables? New columns? Queries?
[ ] API (Express on Hetzner) - New endpoints? Modified routes?
[ ] Workers (BullMQ on Hetzner) - New jobs? Modified handlers?
[ ] Cache (Redis on Hetzner) - New keys? Queue names?
[ ] Frontend (React local) - New components? State changes?
[ ] Deployment - Need to rsync? Restart PM2?

If a layer is checked, implementation is NOT DONE until that layer is coded.
```

**Common narrow-minded mistakes:**
- Adding frontend button but no API endpoint
- Adding API endpoint but no database query
- Adding worker job but no way to trigger it
- Adding feature but forgetting to deploy

---

## What Runs Where (Truth Table)

| Component | Location | Port | How to Check |
|-----------|----------|------|--------------|
| **React Dev Server** | Local (your machine) | 5173 | `curl localhost:5173` |
| **Express API** | Hetzner (188.245.110.34) | 3000 | `ssh hetzner "curl localhost:3000/health"` |
| **BullMQ Workers** | Hetzner (188.245.110.34) | N/A | `ssh hetzner "pm2 list"` |
| **Redis** | Hetzner (188.245.110.34) | 6379 | `ssh hetzner "redis-cli -a Danne2025 ping"` |
| **PostgreSQL** | Supabase (cloud) | 443 | `curl -I https://fevxvwqjhndetktujeuu.supabase.co` |

**Code locations:**
- Local edits: `/Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/content-pipeline/`
- Deployed code: `/opt/content-pipeline/` on Hetzner
- React client: `/client` subdirectory (local only, not deployed yet)

**Key principle:** Code changes happen locally, then deploy to Hetzner via rsync (not live editing on server).

---

## Recovery Procedures

### Redis Down on Hetzner
```bash
ssh hetzner "sudo systemctl status redis && sudo systemctl start redis"
```

### API Down on Hetzner
```bash
# Check PM2 status
ssh hetzner "pm2 list"

# Restart if crashed
ssh hetzner "pm2 restart content-pipeline-api"

# View recent logs
ssh hetzner "pm2 logs content-pipeline-api --lines 30 --nostream"
```

### Vite Dev Server Not Running Locally
```bash
# Check if running
lsof -i :5173 | grep LISTEN

# If not running, start it:
cd ~/Dropbox/content-pipeline/client && npm run dev

# Or from the Projects folder:
cd ~/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/content-pipeline/client
npm run dev
```

**Note:** Vite dev server must be running for React frontend testing. If testing API-only changes, Vite is optional.

### SSH to Hetzner Not Working
**DO NOT use Hetzner web console. Fix locally.**

90% of SSH issues are solved by:
```bash
ssh-add ~/.ssh/id_ed25519
# Enter passphrase when prompted
```

See `HETZNER_OPS.md` for full SSH troubleshooting (IP change, key issues, etc.).

---

## The 3-Strike Debugging Rule

**Problem:** Agents waste time trying the same fix repeatedly.

**Rule:** If 3 fix attempts fail, STOP and invoke CTO analysis mode.

### Fix Mode (Strikes 1-3)
- Attempt specific fixes based on error messages
- Try obvious solutions first (restart service, check env vars)
- Each attempt = 1 strike
- **Count your strikes explicitly:** "Strike 1: Tried X, failed because Y"

### Analysis Mode (After 3 Strikes) - CTO Takes Over

**STOP trying fixes. Invoke CTO agent for analysis:**

```
3 STRIKES REACHED - CTO ANALYSIS MODE

Strikes taken:
1. [What was tried] → [Why it failed]
2. [What was tried] → [Why it failed]
3. [What was tried] → [Why it failed]

Invoking CTO agent for root cause analysis...
```

**CTO Analysis Checklist:**
1. **What's the actual error?** (not symptoms, the root error)
2. **When did it last work?** (git log, session notes)
3. **What changed since then?** (code, config, dependencies)
4. **Is this a known issue?** (check PROJECT_STATUS.md, HETZNER_OPS.md, WORKFLOW.md)
5. **Are we in the wrong layer?** (local vs Hetzner confusion)
6. **Have we seen this before?** (check Connection Lessons below)

**CTO Output (Required):**
```
CTO DIAGNOSIS

Symptom: [What fails]
Root cause: [Why - NOT "unknown"]
Evidence: [Log lines, status checks]
Layer: [Local / Hetzner / Supabase / Redis]
Fix strategy: [One clear path]
If that fails: [Plan B]
```

**Do NOT resume fix mode until CTO diagnosis is complete.**

---

## Testing Workflow (The Coworker Pattern)

**Problem:** Agents try to implement and test simultaneously, leading to confusion.

**Solution:** Treat testing as a separate "coworker" task with Chrome access.

### Before Asking User to Test: Infrastructure Check FIRST

**ALWAYS run infrastructure check BEFORE asking user to test anything.**

```
BEFORE TESTING REQUEST

Running infrastructure check...
[Run the 10-second check here]

If all ✓: Proceed to testing request
If any ✗: Fix infrastructure first, THEN request testing
```

**Do NOT waste user's time testing against broken infrastructure.**

### Implementation Phase
1. Make code changes
2. **Think holistically:** Does this change need:
   - [ ] Database changes? (Supabase migration/query)
   - [ ] API endpoint changes? (Express route)
   - [ ] Worker changes? (BullMQ job handler)
   - [ ] Redis changes? (cache keys, queue names)
   - [ ] Frontend changes? (React component)
   - [ ] Deployment? (rsync to Hetzner)
3. Commit locally (don't push yet)
4. Deploy if needed: `rsync -avz --exclude 'node_modules' --exclude '.git' ... hetzner:/opt/content-pipeline/`
5. Restart services: `ssh hetzner "pm2 restart all"`

**Implementation is done. Stop here.**

### Testing Phase (Coworker with Chrome)

When you need error codes, console output, or UI testing, give user this exact prompt:

```
TESTING NEEDED - COWORKER PROMPT

Please open a new Claude Code chat (coworker) and paste this:

---
You are a testing coworker. The USER will do the clicking (faster). You observe and report.

**Task:** Test [SPECIFIC FEATURE]

**User actions (you guide, user clicks):**
1. User: Open Chrome to [URL - e.g., http://188.245.110.34:3000/ or http://localhost:5173]
2. User: Do [SPECIFIC ACTIONS - e.g., "Click 'Create Project', enter name 'Test', click Submit"]
3. User: Open Chrome DevTools (Cmd+Option+I) → Console tab
4. User: Share screenshot or paste any errors

**You report back:**
- Did the action succeed visually? (Yes/No)
- Any errors in Console? (Copy exact text)
- Network tab: Did API call succeed? (Status code)
- Any unexpected behavior?

**After UI test, verify database (if applicable):**
Check Supabase to confirm data was saved:
```sql
SELECT * FROM [TABLE] WHERE [CONDITION] ORDER BY created_at DESC LIMIT 5;
```

**Expected result:** [WHAT SHOULD HAPPEN]
---

Let me know what they find.
```

### Brutal Critic Review (Simultaneous with Presentation)

**Present suggestion to user FIRST, then run brutal-critic simultaneously.**

```
IMPLEMENTATION COMPLETE

Here's what I built: [SUMMARY]

Files changed:
- [file1]: [what changed]
- [file2]: [what changed]

[Meanwhile, running brutal-critic self-review...]
```

**Brutal-critic self-review (runs in parallel, doesn't block):**
```
SELF-REVIEW CHECKPOINT

1. Does it solve the actual problem?
2. Are all layers covered? (DB, API, Worker, Frontend, Deployment)
3. Are there obvious bugs or missing pieces?
4. Would this work in production or only in happy-path testing?
5. If data is saved: Will it persist correctly to database?
```

If brutal-critic finds issues → Report to user immediately, offer to fix before testing.

### Database Verification (After UI Test)

**If the feature saves data, ALWAYS verify database persistence:**

```
DATABASE VERIFICATION

After UI test passes, check Supabase:

1. Open Supabase dashboard: https://supabase.com/dashboard/project/fevxvwqjhndetktujeuu
2. Go to Table Editor → [relevant table]
3. Verify:
   - Row exists with correct data
   - Timestamps populated
   - Foreign keys valid
   - No orphan records

Or via SQL:
SELECT * FROM [table] WHERE created_at > NOW() - INTERVAL '5 minutes' ORDER BY created_at DESC;
```

**Common database issues:**
- RLS policy blocking insert/select
- Missing required fields (NOT NULL constraint)
- Foreign key doesn't exist
- Wrong column type (string vs UUID)

**Benefits:**
- Infrastructure verified before wasting user's time
- Coworker has clear, copy-paste instructions
- Brutal-critic catches obvious issues before testing
- User doesn't debug infrastructure problems during testing
- Database persistence verified, not just UI success

---

## Disposable Environment Philosophy

**Problem:** Agents spend too long debugging a broken environment.

**Solution:** Design for fast rebuild, not preservation.

### What Should Be Disposable
- Redis data (just restart)
- PM2 process states (restart, not debug)
- Local dev server (kill and rerun)
- Test database records (truncate and reseed)

### What Should Survive
- Code (in git)
- Environment variables (documented in .env.example)
- Database schema (in migrations)
- Supabase data (production data)

**Rule:** If 3 strikes exhausted and CTO recommends rebuild → Nuke and rebuild.

---

## Connection Lessons Learned (Historical Issues)

**These issues have wasted significant time in past sessions. Check them FIRST.**

### SSH to Hetzner
- **90% of issues:** SSH key not loaded. Fix: `ssh-add ~/.ssh/id_ed25519`
- **NEVER use Hetzner web console** - it cannot paste text, drops characters
- If IP changed: Check Hetzner dashboard, update `~/.ssh/config`

### Redis Connection
- Redis password is `Danne2025` (required in connection string)
- Redis only listens on localhost on Hetzner (127.0.0.1:6379)
- If "connection refused": `ssh hetzner "sudo systemctl start redis"`

### Supabase Connection
- Check `.env` has correct `SUPABASE_URL` and `SUPABASE_KEY`
- Supabase is cloud-hosted - if unreachable, check internet/VPN
- Row Level Security (RLS) can cause "no rows returned" - check policies

### BullMQ Workers
- Workers connect to Redis - if Redis down, workers fail silently
- Check with `ssh hetzner "pm2 logs content-pipeline-worker --lines 30"`
- Workers need restart after code deploy: `ssh hetzner "pm2 restart all"`

### Code Not Deployed
- **Most common issue:** Changed code locally, forgot to rsync to Hetzner
- Verify: `ssh hetzner "grep 'UNIQUE_STRING' /opt/content-pipeline/path/to/file.js"`
- After rsync, MUST restart PM2: `ssh hetzner "pm2 restart all"`

### Local vs Hetzner Confusion
- React dev server (localhost:5173) talks to Hetzner API (188.245.110.34:3000)
- Check which API URL the React app is using in `.env` or `api/client.ts`
- If testing locally-only changes, don't deploy to Hetzner

**Rebuild Hetzner API from scratch:**
```bash
ssh hetzner "cd /opt/content-pipeline && pm2 delete all && npm install && pm2 start ecosystem.config.js"
```

---

## Session Handoff Protocol

**Problem:** Next session (or next agent) forgets infrastructure state.

**Solution:** Leave a breadcrumb.

At session end, update `PROJECT_STATUS.md` with:

```markdown
### Session: YYYY-MM-DD - [Brief Title]
**Infrastructure State:**
- Redis: [up/down/restarted]
- API: [deployed version, any issues]
- Vite: [running locally: yes/no]
- Known issues: [any unresolved blockers]

**Code Changes:**
- [File]: [What changed and why]
- Deployed: [yes/no]

**Next Session Start Here:**
1. [First thing to check or do]
```

**Why:** Next agent runs infrastructure check, sees recent notes, doesn't waste 20 minutes rediscovering context.

---

## Common Pitfalls & Quick Fixes

### "Why isn't my code change working?"
**Check:** Did you deploy to Hetzner?
```bash
ssh hetzner "grep 'SOME_UNIQUE_STRING_FROM_YOUR_CHANGE' /opt/content-pipeline/path/to/file.js"
```
If empty, you didn't deploy.

### "API returns 404 but endpoint exists"
**Check:** Did you restart PM2?
```bash
ssh hetzner "pm2 restart content-pipeline-api"
```

### "Redis connection refused"
**Check:** Is Redis actually running?
```bash
ssh hetzner "redis-cli -a Danne2025 ping"
```
Should return `PONG`. If not: `ssh hetzner "sudo systemctl start redis"`

### "SSH hangs or permission denied"
**Fix:** 90% of cases:
```bash
ssh-add ~/.ssh/id_ed25519
```
See `HETZNER_OPS.md` for the other 10%.

### "Changes work locally but not on Hetzner"
**Likely causes:**
1. Forgot to deploy: `rsync -avz ...` (see deployment command above)
2. Env vars differ: Check `.env` on Hetzner vs local
3. Node version mismatch: `ssh hetzner "node -v"` (should be 20.20.0)

---

## Deployment Checklist

Before deploying code changes to Hetzner:

- [ ] Code committed locally (not pushed to GitHub yet)
- [ ] No secrets in code (API keys, passwords)
- [ ] Tested locally with Vite dev server
- [ ] Infrastructure check passed (all services up)

Deploy:
```bash
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.env' \
  ~/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/content-pipeline/ \
  hetzner:/opt/content-pipeline/

ssh hetzner "cd /opt/content-pipeline && npm install && pm2 restart all"
```

Verify:
```bash
ssh hetzner "pm2 logs --lines 20 --nostream"
curl http://188.245.110.34:3000/health
```

If logs show errors or health check fails, rollback:
```bash
ssh hetzner "cd /opt/content-pipeline && git checkout HEAD~1 && pm2 restart all"
```

---

## When Things Go Wrong: Triage Priority

1. **Check infrastructure first** (10-second check)
2. **Check deployment state** (is code actually on Hetzner?)
3. **Check logs** (PM2, Redis, browser console)
4. **Check 3-strike rule** (am I repeating failed attempts?)
5. **Check layer confusion** (am I debugging local but issue is Hetzner?)

**Do not:**
- Try random fixes without diagnosis
- Use Hetzner web console for SSH issues (fix locally)
- Spend >10 minutes on a broken environment (nuke and rebuild)
- Ignore infrastructure check failures (they cascade into bigger issues)

---

## Quick Reference

### SSH to Hetzner
```bash
ssh hetzner  # Uses ~/.ssh/config alias
```

### Deploy Code
```bash
rsync -avz --exclude 'node_modules' --exclude '.git' ~/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/content-pipeline/ hetzner:/opt/content-pipeline/
ssh hetzner "pm2 restart all"
```

### Check Service Status
```bash
ssh hetzner "pm2 list"
ssh hetzner "redis-cli -a Danne2025 ping"
ssh hetzner "curl localhost:3000/health"
```

### View Logs
```bash
ssh hetzner "pm2 logs --lines 50 --nostream"
ssh hetzner "pm2 logs content-pipeline-api --lines 100"
```

### Restart Everything
```bash
ssh hetzner "pm2 restart all && redis-cli -a Danne2025 FLUSHALL"
```

### Nuclear Option (Fresh Start)
```bash
ssh hetzner "cd /opt/content-pipeline && pm2 delete all && redis-cli -a Danne2025 FLUSHALL && npm install && pm2 start ecosystem.config.js"
```

---

## Automated Testing

**Run tests before committing or deploying.**

### API Tests (Jest)
```bash
cd ~/Dropbox/content-pipeline
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage report
```

### Client Tests (Vitest)
```bash
cd ~/Dropbox/content-pipeline/client
npm test                    # Watch mode
npm run test:run            # Single run
npm run test:coverage       # With coverage report
```

### E2E Tests (Playwright)
```bash
cd ~/Dropbox/content-pipeline
npm run test:e2e            # Run E2E tests
npm run test:e2e:ui         # Interactive UI mode
```

**Note:** E2E tests require the Vite dev server. Playwright will start it automatically.

### Docker Compose (Local Dev)
```bash
cd ~/Dropbox/content-pipeline
docker-compose up -d        # Start API, worker, Redis
docker-compose logs -f      # View logs
docker-compose down         # Stop all
```

This gives you dev/prod parity - same Redis, same services, isolated environment.

---

## Success Metrics

This workflow is working if:
- Sessions start with green checkmarks (infrastructure healthy)
- Debugging rarely exceeds 3 attempts
- Next session picks up where last left off (no "where are we?" confusion)
- Deployments are boring (rsync, restart, done)
- Testing is deliberate, not reactive

---

**Remember:** Infrastructure state is fragile. Code is permanent. Favor rebuilding over debugging. Favor documentation over memory.
