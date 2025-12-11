# Universal Content Pipeline - Complete Architecture & Implementation Guide

**Project Status**: Infrastructure Complete, Ready for Application Development  
**Last Updated**: October 2024  
**Document Version**: 2.0

## Executive Summary

This document outlines the complete architecture and implementation plan for a **Universal Content Pipeline** - a modular, database-mediated content processing platform. Starting with company profiles for the iGaming industry, the system is designed to expand to any content type (podcasts, events, consultants, news) through its flexible, module-based architecture.

**Current Status**: 
- ✅ Hetzner server infrastructure deployed
- ✅ Redis and BullMQ installed and tested
- ✅ Database schema designed
- ✅ Basic pipeline tested
- 🎯 Next: Build operations modules and web interface

## Table of Contents

1. [System Overview](#system-overview)
2. [Current Progress](#current-progress)
3. [Architecture Design](#architecture-design)
4. [Implementation Roadmap](#implementation-roadmap)
5. [Technical Specifications](#technical-specifications)
6. [Operational Guide](#operational-guide)
7. [Cost Analysis](#cost-analysis)
8. [Risk Assessment](#risk-assessment)

---

## System Overview

### Vision
Build a content operations platform that can process any input type (companies, podcasts, events, people) into any output format (profiles, articles, summaries, bios) through configurable pipeline stages with human-in-the-loop optimization.

### Core Principles

1. **Database-Mediated Architecture**: Every operation reads from and writes to the database. No direct connections between operations.

2. **Modular Operations**: Each processing step is an independent module that can be added, removed, or replaced without affecting others.

3. **Human-in-the-Loop Optimization**: Review and refine at each stage based on real results, not abstract quality sliders.

4. **Progressive Enhancement**: Start with company profiles, expand to other content types using the same framework.

### Why Not Use Existing Tools?

- **n8n**: Too rigid for dynamic pipeline modification
- **Zapier**: Generic automation, not optimized for content
- **Make.com**: Limited by visual workflow constraints
- **Custom is Better**: Full control, no vendor lock-in, infinitely extensible

---

## Current Progress

### ✅ Completed Infrastructure

#### Hetzner Server Setup
- **Server**: CX22 VPS (2 vCPU, 4GB RAM, 40GB disk)
- **IP**: 188.245.110.34
- **OS**: Ubuntu 22.04 LTS
- **Access**: SSH with ED25519 key authentication
- **Status**: Fully operational

#### Software Stack Installed
```
- Node.js 20.x (latest LTS)
- Redis 7.x (password: Danne2025)
- npm with package management
- BullMQ dependencies
- Basic test script verified
```

#### Database Configuration
- **Supabase URL**: https://fevxvwqjhndetktujeuu.supabase.co
- **Schema**: Existing tables preserved
- **New tables**: Ready for pipeline data

### 🔧 Existing Rudimentary Flow

You have already built:
1. **Basic Pipeline Logic**: URL discovery → Scraping → Generation
2. **HTML Interface**: index.html dashboard (needs backend connection)
3. **Database Schema**: Company and content tables
4. **Test Results**: Successfully scraped and generated profiles

### ❌ Current Blockers

1. **Frontend-Backend Disconnect**: HTML interface exists but can't control pipeline
2. **No Operation Modules**: Pipeline steps aren't modularized yet
3. **Missing Orchestrator**: No system to coordinate operations
4. **Limited Flexibility**: Can't modify pipeline without code changes

---

## Architecture Design

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Web Interface                         │
│  (Control Panel, Monitoring, Configuration)              │
└────────────────┬────────────────────────────────────────┘
                 │ HTTP/WebSocket
┌────────────────▼────────────────────────────────────────┐
│                 Express.js API Server                    │
│  (REST Endpoints, WebSocket Server, Authentication)      │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│                    Orchestrator                          │
│  (Pipeline Controller, Job Router, State Manager)        │
└──┬──────────────────────────────────────────────────┬───┘
   │                                                  │
┌──▼──────────────────┐                    ┌─────────▼───┐
│   BullMQ Queues     │                    │   Supabase  │
│  (Job Management)   │◄───────────────────►  (Database) │
└──┬──────────────────┘                    └─────────────┘
   │
┌──▼──────────────────────────────────────────────────────┐
│                 Operation Modules                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │Discovery │ │Scraping  │ │Generation│ │Quality   │  │
│  │Module    │ │Module    │ │Module    │ │Module    │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Database Schema Design

```sql
-- Generic pipeline tables (work for any content type)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'company_profile', 'podcast', 'event'
  config JSONB NOT NULL, -- Pipeline configuration
  status TEXT DEFAULT 'created',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  stage_name TEXT NOT NULL, -- 'discovery', 'scraping', 'generation'
  stage_index INTEGER NOT NULL,
  input_data JSONB,
  output_data JSONB,
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error JSONB,
  metadata JSONB
);

CREATE TABLE operation_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL, -- 'google-search', 'cheerio-scrape'
  type TEXT NOT NULL, -- 'discovery', 'collection', 'generation'
  config JSONB NOT NULL, -- API keys, parameters
  cost_per_use DECIMAL,
  average_duration INTEGER, -- milliseconds
  success_rate DECIMAL,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE pipeline_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  stage_name TEXT,
  operation_name TEXT,
  status TEXT,
  message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Operation Module Structure

Each operation is a standalone Node.js module:

```javascript
// modules/operations/google-search.js
module.exports = {
  name: 'google-search',
  type: 'discovery',
  
  // Configuration schema
  config: {
    apiKey: process.env.GOOGLE_API_KEY,
    maxResults: 50,
    searchType: 'web'
  },
  
  // Main execution function
  async execute(input, config) {
    // Read input from database
    const { searchTerms, filters } = input;
    
    // Perform operation
    const results = await googleSearch(searchTerms, config);
    
    // Return output for database
    return {
      urls: results.map(r => ({
        url: r.link,
        title: r.title,
        snippet: r.snippet
      })),
      metadata: {
        totalResults: results.length,
        searchTerms: searchTerms
      }
    };
  },
  
  // Cost calculation
  calculateCost(input) {
    return 0.01; // $0.01 per search
  }
};
```

### Orchestrator Logic

```javascript
// orchestrator.js
class PipelineOrchestrator {
  async runPipeline(projectId) {
    // 1. Load project configuration
    const project = await db.getProject(projectId);
    const pipeline = project.config.pipeline;
    
    // 2. For each stage in pipeline
    for (const stage of pipeline) {
      // Check if prerequisites met
      const canRun = await this.checkPrerequisites(projectId, stage);
      if (!canRun) continue;
      
      // Queue the operation
      await this.queueOperation(projectId, stage);
      
      // Wait for completion or timeout
      await this.waitForStage(projectId, stage);
      
      // Check for routing rules (loops, conditions)
      const routing = await this.evaluateRouting(projectId, stage);
      if (routing.action === 'loop') {
        // Go back to specified stage
        continue;
      }
    }
  }
}
```

---

## Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1)
**Goal**: Get basic pipeline working end-to-end

#### Day 1-2: Operation Modules
- [ ] Create google-search module
- [ ] Create cheerio-scrape module  
- [ ] Create gpt-generate module
- [ ] Test each module independently

#### Day 3-4: Orchestrator
- [ ] Build basic orchestrator
- [ ] Implement BullMQ job queuing
- [ ] Add database state management
- [ ] Test full pipeline flow

#### Day 5-7: API Server
- [ ] Set up Express.js server
- [ ] Create REST endpoints
- [ ] Add WebSocket for real-time updates
- [ ] Connect to existing index.html

### Phase 2: Web Interface (Week 2)
**Goal**: Full web control of pipeline

#### Day 8-10: Frontend Connection
- [ ] Connect index.html to API
- [ ] Add pipeline start/stop controls
- [ ] Display real-time progress
- [ ] Show stage outputs

#### Day 11-12: Configuration UI
- [ ] Add operation selection
- [ ] Parameter modification interface
- [ ] Pipeline designer (basic)
- [ ] Results viewer

#### Day 13-14: Testing & Polish
- [ ] End-to-end testing
- [ ] Error handling
- [ ] Performance optimization
- [ ] Documentation

### Phase 3: Advanced Features (Week 3-4)
**Goal**: Production-ready system

- [ ] Additional operations (Playwright, Claude, etc.)
- [ ] Quality checking modules
- [ ] Routing logic (loops, conditions)
- [ ] Cost tracking
- [ ] Advanced monitoring
- [ ] Backup and recovery

### Phase 4: Content Type Expansion (Month 2)
**Goal**: Prove universality with second content type

- [ ] Podcast pipeline
- [ ] Event coverage pipeline
- [ ] Consultant bio pipeline
- [ ] Template system
- [ ] Multi-pipeline management

---

## Technical Specifications

### Development Environment

```bash
# Server access
ssh -i ~/.ssh/hetzner_ed25519 root@188.245.110.34

# Project location
cd /opt/company-pipeline

# Environment variables
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=Danne2025
SUPABASE_URL=https://fevxvwqjhndetktujeuu.supabase.co
SUPABASE_SERVICE_KEY=[your-key]
OPENAI_API_KEY=[your-key]
ANTHROPIC_API_KEY=[your-key]
```

### Project Structure

```
/opt/company-pipeline/
├── .env                      # Environment variables
├── package.json              # Dependencies
├── server.js                 # Express API server
├── orchestrator.js           # Pipeline controller
├── modules/
│   ├── operations/          # Operation modules
│   │   ├── google-search.js
│   │   ├── cheerio-scrape.js
│   │   ├── gpt-generate.js
│   │   └── ...
│   └── utils/               # Shared utilities
│       ├── database.js
│       ├── redis.js
│       └── logger.js
├── routes/
│   ├── projects.js          # Project management
│   ├── pipeline.js          # Pipeline control
│   └── operations.js        # Operation management
├── public/
│   ├── index.html           # Main dashboard
│   ├── css/
│   └── js/
└── logs/                    # Application logs
```

### API Endpoints

```
# Project Management
POST   /api/projects                 # Create new project
GET    /api/projects                 # List all projects
GET    /api/projects/:id             # Get project details
PUT    /api/projects/:id             # Update project
DELETE /api/projects/:id             # Delete project

# Pipeline Control
POST   /api/pipeline/:id/start       # Start pipeline
POST   /api/pipeline/:id/stop        # Stop pipeline
GET    /api/pipeline/:id/status      # Get pipeline status
GET    /api/pipeline/:id/stages      # Get stage results

# Operation Management  
GET    /api/operations                # List available operations
POST   /api/operations                # Add new operation
PUT    /api/operations/:name         # Update operation
DELETE /api/operations/:name         # Remove operation

# Real-time Updates
WS     /ws                           # WebSocket connection
```

### Security Considerations

1. **API Authentication**: JWT tokens for API access
2. **Input Validation**: Sanitize all user inputs
3. **Rate Limiting**: Prevent API abuse
4. **Secret Management**: Use environment variables
5. **Database Security**: Use service role key carefully
6. **SSH Security**: Key-only authentication

---

## Operational Guide

### Starting the System

```bash
# SSH into server
ssh -i ~/.ssh/hetzner_ed25519 root@188.245.110.34

# Navigate to project
cd /opt/company-pipeline

# Install dependencies (first time)
npm install

# Start services
npm run start:redis     # Start Redis
npm run start:api       # Start API server
npm run start:workers   # Start worker processes
```

### Adding New Operations

1. Create new module in `/modules/operations/`
2. Register in operation registry
3. Restart workers
4. Operation available in UI

### Monitoring

- **BullMQ Dashboard**: http://188.245.110.34:3000/admin/queues
- **API Health**: http://188.245.110.34:3000/health
- **Logs**: `/opt/company-pipeline/logs/`

### Troubleshooting

**Pipeline Stuck**: 
- Check Redis connection
- Review logs for errors
- Restart workers if needed

**Operations Failing**:
- Verify API keys
- Check rate limits
- Review operation logs

**Database Issues**:
- Check Supabase status
- Verify connection string
- Review query performance

---

## Cost Analysis

### Infrastructure Costs (Monthly)

| Service | Cost | Notes |
|---------|------|-------|
| Hetzner Server | €5.39 | CX22 instance |
| Supabase | $25 | Pro tier (optional) |
| **Total Infrastructure** | **~$30** | |

### API Costs (Per 100 Operations)

| Service | Cost | Usage |
|---------|------|-------|
| Google Search API | $5.00 | Discovery |
| OpenAI GPT-3.5 | $2.00 | Drafts |
| OpenAI GPT-4 | $30.00 | Final content |
| Anthropic Claude | $15.00 | Alternative |
| **Estimated per Profile** | **$0.50-$2.00** | Depending on quality |

### Scale Economics

- **100 profiles/day**: ~$50-200 API costs
- **1000 profiles/day**: ~$500-2000 API costs (with volume discounts)
- **Break-even**: 50 profiles to justify infrastructure

---

## Risk Assessment

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Server failure | High | Daily backups, quick rebuild script |
| API rate limits | Medium | Multiple API keys, request queuing |
| Database overload | Medium | Indexing, archival strategy |
| Cost overrun | Medium | Budget limits, cost monitoring |

### Business Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Quality issues | High | Human review, quality gates |
| Scaling challenges | Medium | Gradual growth, monitoring |
| API dependency | Medium | Multiple providers, fallbacks |

---

## Next Steps

### Immediate Actions (This Week)

1. **Start Development**:
   ```bash
   ssh -i ~/.ssh/hetzner_ed25519 root@188.245.110.34
   cd /opt/company-pipeline
   npm init
   npm install express bullmq redis dotenv
   ```

2. **Create First Operation Module**:
   - Start with simplest (cheerio-scrape)
   - Test independently
   - Verify database read/write

3. **Build Minimal Orchestrator**:
   - Queue jobs with BullMQ
   - Read pipeline configuration
   - Execute single operation

4. **Connect Frontend**:
   - Basic API endpoints
   - Connect existing index.html
   - Test end-to-end

### Success Criteria (Week 1)

- [ ] One complete pipeline run (discovery → scraping → generation)
- [ ] Results visible in web interface
- [ ] Can modify parameters and re-run
- [ ] All data persisted in database

### Getting Help

- **Architecture Questions**: Refer to this document
- **Implementation Details**: Use Claude Code for development
- **Debugging**: Check logs first, then system status
- **Scaling Issues**: Start simple, optimize later

---

## Appendix: Quick Reference

### SSH Commands
```bash
# Connect to server
ssh -i ~/.ssh/hetzner_ed25519 root@188.245.110.34

# Check Redis
redis-cli -a Danne2025 ping

# View logs
tail -f /opt/company-pipeline/logs/app.log

# Restart services
systemctl restart redis
pm2 restart all
```

### Database Queries
```sql
-- Check pipeline status
SELECT * FROM pipeline_stages 
WHERE project_id = '...' 
ORDER BY stage_index;

-- View operation performance
SELECT name, success_rate, average_duration 
FROM operation_registry 
ORDER BY success_rate DESC;

-- Recent errors
SELECT * FROM pipeline_logs 
WHERE status = 'error' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Environment Setup
```bash
# .env file template
NODE_ENV=development
PORT=3000

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=Danne2025

# Database
SUPABASE_URL=https://fevxvwqjhndetktujeuu.supabase.co
SUPABASE_SERVICE_KEY=your-key-here

# APIs
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
```

---

## Document Version History

- **v2.0** (Current): Complete architecture with implementation guide
- **v1.0**: Initial BullMQ architecture proposal

---

**END OF DOCUMENT**

*This document provides the complete blueprint for building your Universal Content Pipeline. Start with Phase 1 and iterate based on results. The architecture supports infinite expansion while maintaining simplicity.*