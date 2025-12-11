# BullMQ Architecture Implementation - Company Profile Pipeline

**Last Updated**: September 21, 2025  
**Status**: Infrastructure Complete, Web Interface Ready for Implementation  
**Current Phase**: Express API + Frontend Development with Claude Code

## Project Evolution & Architecture Decision

### Original Challenge
The company profile creation pipeline required robust orchestration for 11 complex steps including:
- URL discovery and content scraping
- LLM-based profile generation  
- Multi-format output packaging
- Quality assurance and routing logic
- Human review integration

### Architectural Solution: BullMQ + Web Control System

**Core Decision**: Build a web-managed, dynamically extensible content creation platform using BullMQ for orchestration rather than traditional workflow tools.

**Key Requirements Met**:
- **Modular Design**: Each pipeline step as independent, testable job
- **Scalability**: Process multiple companies simultaneously
- **Reliability**: Built-in retry logic and error handling
- **Extensibility**: Add new workflow steps without system rebuilds
- **Web Management**: Full pipeline control through browser interface
- **Future-Proof**: Adaptable to different content types and industries

## Infrastructure Architecture

### Server Infrastructure
- **Provider**: Hetzner Cloud VPS
- **Server**: CX22 (2 vCPU, 4GB RAM, 40GB disk)
- **IP**: 188.245.110.34
- **OS**: Ubuntu 22.04 LTS
- **SSH Access**: ED25519 key authentication

### Core Technology Stack
- **Orchestration**: BullMQ (Redis-based job queue)
- **Backend**: Node.js 20 + Express.js API server
- **Database**: Supabase (existing schema preserved)
- **Queue Storage**: Redis 7.x (localhost, password-protected)
- **Frontend**: Dynamic HTML interface with WebSocket real-time updates

### Redis Configuration
```bash
# /etc/redis/redis.conf
bind 127.0.0.1
requirepass Danne2025
save 900 1
```

### Project Structure
```
/opt/company-pipeline/
├── server.js           # Express API + WebSocket server
├── workers.js          # BullMQ worker definitions
├── pipeline.js         # Flow orchestration logic
├── routes/
│   ├── companies.js    # Company management endpoints
│   ├── workflows.js    # Pipeline control endpoints
│   └── functions.js    # Dynamic function management
├── public/
│   ├── index.html      # Main dashboard interface
│   ├── workflow.html   # Pipeline designer
│   └── assets/         # CSS, JS, images
├── workflows/          # Dynamic workflow definitions
└── functions/          # User-added processing functions
```

## Pipeline Architecture: BullMQ Integration

### Queue Design
```javascript
const queues = {
  discovery: new Queue('url-discovery', { connection }),
  scraping: new Queue('content-scraping', { connection }),
  generation: new Queue('profile-generation', { connection }),
  qa: new Queue('quality-assurance', { connection }),
  routing: new Queue('automated-routing', { connection }),
  packaging: new Queue('output-packaging', { connection }),
  export: new Queue('distribution', { connection }),
  review: new Queue('human-review', { connection })
};
```

### Flow Orchestration
Uses BullMQ Flow Producer for complex dependency management:
- **Parallel Processing**: Multiple companies simultaneously
- **Conditional Routing**: QA failures loop back to appropriate steps
- **Dynamic Dependencies**: Steps can be added/removed without rebuild
- **Progress Tracking**: Real-time status updates via WebSocket

### Integration with Existing Schema
**Preserves current Supabase tables**:
- `companies` - Company seed data
- `discovery_links` - URL discovery results  
- `content_raw` - Scraped content
- `content_json_draft` - Generated profiles

**Adds BullMQ tracking**:
- Job status and progress stored in Redis
- Audit logs maintained in Supabase `workflow_events`
- Real-time updates pushed via WebSocket

## Web-Based Control System

### API Endpoints
```javascript
// Company Management
POST   /api/companies/upload     # Bulk CSV upload
GET    /api/companies           # List with status
POST   /api/companies/:id/start # Start pipeline

// Workflow Control  
GET    /api/workflows           # Available workflows
POST   /api/workflows/run       # Execute workflow
GET    /api/workflows/status    # Pipeline status
POST   /api/workflows/pause     # Pause/resume

// Dynamic Functions
GET    /api/functions           # List available functions
POST   /api/functions           # Add new function
PUT    /api/functions/:id       # Update function
DELETE /api/functions/:id       # Remove function

// Real-time Updates
WS     /ws                      # WebSocket for live updates
```

### Frontend Capabilities
**Dashboard Interface**:
- Company upload and management
- Pipeline execution controls
- Real-time job monitoring
- Results viewing and download
- Error handling and retry controls

**Workflow Designer** (Future Enhancement):
- Drag-and-drop step arrangement
- Function library browser
- Parameter configuration
- Custom workflow creation

**Function Management**:
- Upload new processing functions
- Configure step dependencies
- Test functions before deployment
- Version control for modifications

## Dynamic Extensibility Features

### Plugin Architecture
```javascript
// Example: Add new enrichment step
POST /api/functions
{
  "name": "linkedin-enrichment",
  "code": "async function(job) { /* enrichment logic */ }",
  "dependencies": ["content-scraping"],
  "outputs": ["enriched-profile"],
  "config": { "timeout": 30000, "retries": 3 }
}
```

### Workflow Modification
- **Runtime Changes**: Add/remove steps without server restart
- **Parameter Tuning**: Adjust timeouts, retry logic, batch sizes
- **A/B Testing**: Run different workflows on subsets of companies
- **Conditional Logic**: Route based on company characteristics

### Multi-Industry Adaptation
**Current**: iGaming company profiles
**Extensible to**:
- E-commerce product descriptions
- SaaS feature documentation  
- News article generation
- Review and comparison content

## Integration Points

### Supabase Connection
```javascript
// Environment configuration
SUPABASE_URL=https://fevxvwqjhndetktujeuu.supabase.co
SUPABASE_SERVICE_KEY=<service_key>
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=Danne2025
```

### External APIs
- **OpenAI/Anthropic**: Profile generation (Step 6)
- **Cheerio/Playwright**: Content scraping (Step 4)  
- **Google APIs**: Document export (Step 10)
- **Webhook Support**: Third-party integrations

## Current Status & Next Steps

### Infrastructure: Complete ✅
- Hetzner server provisioned and configured
- Redis installed and secured
- BullMQ dependencies installed and tested
- Basic job queue functionality verified

### Ready for Implementation
**Phase 1**: Express API Server
- REST endpoints for pipeline control
- WebSocket integration for real-time updates
- Basic authentication and security

**Phase 2**: Web Frontend  
- Company management interface
- Pipeline monitoring dashboard
- Results viewing and download

**Phase 3**: Dynamic Extensions
- Function upload and management
- Workflow designer interface
- Multi-industry template system

### Claude Code Integration
The system is designed for iterative enhancement by Claude Code:
- **Modular architecture** enables focused development
- **API-first design** allows frontend/backend separation
- **Configuration-driven** reduces hardcoded dependencies
- **Web-based management** eliminates terminal requirements

## Success Metrics

### Immediate Goals
- ✅ Infrastructure operational
- 🎯 Web interface functional (next phase)
- 🎯 Current 4-step pipeline replicated in BullMQ
- 🎯 Step 6 (profile generation) implemented

### Long-term Vision
- Multi-company parallel processing
- Sub-10-minute profile generation
- 99.9% pipeline reliability
- Zero-downtime function deployment
- Multi-industry template library

## Technical Debt & Considerations

### Security
- Redis password authentication implemented
- SSH key-based server access
- API authentication required for production
- Input validation on all endpoints

### Monitoring
- BullMQ job status tracking
- Error logging and alerting
- Performance metrics collection
- Resource usage monitoring

### Backup & Recovery
- Supabase handles database backups
- Redis persistence configured
- Code repository backup strategy needed
- Configuration backup automation

---

**Next Action**: Hand this specification to Claude Code for Express API server implementation, starting with basic company upload and pipeline execution endpoints.