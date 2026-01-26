# GO - Universal Project & Agent Launcher

**When user says "go" or "@GO.md", run this workflow:**

---

## Step 1: Detect Current Location

Check current working directory to see if already in a project:

```
pwd
```

If in a known project directory, skip to Step 3.

---

## Step 2: Daily Check-In or Project Selection

Present this menu:

```
🚀 How would you like to start?

0. Personal Assistant ← RECOMMENDED
   Daily: Reviews commitments, declares focus, keeps you accountable
   Weekly: Say "ops" for cross-project planning & process review

OnlyiGaming Projects:
1. Content Pipeline - Universal content generation system
2. News Section - News aggregation platform
3. SEO - SEO strategy and implementation
4. Other OnlyiGaming project (specify)

Other:
5. Browse to a different directory
6. Stay in current directory

Type 0-6 or project name:
```

**If user selects 0**: Spawn the personal-assistant agent immediately. It will handle project selection after focus declaration.

**If user selects 1-6**: Proceed to Step 3 as normal, but after loading context, suggest:
```
💡 Tip: Consider running personal-assistant first to declare today's focus and check commitments.
   (Say "pa" to invoke it now, or continue without accountability check)
```

---

## Step 3: Load Project Context

Once project is selected/detected:

1. **Navigate** to project directory (if needed)
2. **Read** these files in order:
   - `QUICKSTART.md` (if exists) - Fast overview
   - `CLAUDE.md` or `AGENTS.md` - Full context
   - Check `GLOBAL_AGENT_INSTRUCTIONS.md` - Universal policies

3. **Summarize** to user:
   ```
   📂 Project: [Name]
   📊 Current Phase: [Phase]
   🎯 Priority Task: [What's next]
   🚧 Blockers: [Any blockers]
   ```

---

## Step 4: Ask About Agent Selection

```
🤖 How would you like to proceed?

0. Personal Assistant (accountability + focus)
1. Continue with me (Sonnet 4.5) - Good for straightforward coding
2. Use Opus 4.5 - Better for complex debugging, visual analysis
3. Spawn specialized agent:
   - project-context-manager (update docs)
   - strategic-thinker (high-level decisions)
   - brutal-critic (code review)
   - content-writer (documentation/content)
   - research-expert (gather information)

4. Just show me the status (don't start work yet)

Choose 0-4:
```

---

## Step 5: Execute Choice

Based on user's selection:

- **Option 1**: Continue normal conversation
- **Option 2**: Spawn Opus 4.5 agent with Task tool
- **Option 3**: Spawn selected specialized agent
- **Option 4**: Show status and wait for instructions

---

## Example Usage

**User**: `go`

**Claude**:
```
🚀 Which project would you like to work on?
[shows menu]
```

**User**: `1`

**Claude**:
```
📂 Project: Content Pipeline
📊 Current Phase: Application Development
🎯 Priority Task: Build Express API server + BullMQ workers
🚧 Blockers: None - infrastructure operational

🤖 How would you like to proceed?
[shows agent menu]
```

**User**: `1`

**Claude**:
```
Great! I'll help you build the Express API server.
Let me start by checking what's already in place...
[begins work]
```

---

## Configuration

**Known Projects** (update this list as you add projects):

```
Content-Pipeline: /Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/Content-Pipeline
News-Section: /Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/News-Section
SEO: /Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/SEO
```

**Required Files** (projects should have these):
- `QUICKSTART.md` or `CLAUDE.md` - Project context
- Reference to `GLOBAL_AGENT_INSTRUCTIONS.md` - Universal standards

---

*This file makes project switching and agent selection interactive and consistent*
