# Company Profile Pipeline - Project Memory (Updated)

**Last Updated**: September 21, 2025  
**Status**: Infrastructure Complete, Web Interface Implementation Ready  
**Next Phase**: Express API + Frontend Development with Claude Code

## Project Overview
Automated pipeline to generate comprehensive company profiles for iGaming/gambling industry companies. The system uses BullMQ for orchestration, Supabase for data storage, and provides a web-based control interface for complete pipeline management.

## Current Tech Stack
- **Server**: Hetzner CX22 VPS (IP: 188.245.110.34)
- **Database**: Supabase PostgreSQL (`https://fevxvwqjhndetktujeuu.supabase.co`)
- **Orchestration**: BullMQ with Redis backend
- **Backend**: Node.js 20 + Express.js (ready for implementation)
- **Frontend**: Web-based dashboard (ready for implementation)
- **Development**: Claude Code for autonomous development

## Infrastructure Status: Complete ✅

### Server Environment
- **Hetzner CX22**: 2 vCPU, 4GB RAM, 40GB disk, Ubuntu 22.04
- **SSH Access**: ED25519 key authentication working
- **Redis**: Installed, configured, password-protected (Danne2025)
- **Node.js 20**: Installed with npm
- **BullMQ Dependencies**: Installed and tested successfully

### Verified Functionality
- SSH connection: `ssh -i ~/.ssh/hetzner_ed25519 root@188.245.110.34`
- Redis authentication and PING/PONG test successful
- BullMQ job queue test completed successfully
- Basic pipeline architecture proven

## Pipeline Architecture: BullMQ-Based

### Core Design Principles
- **Web-Controlled**: All operations through browser interface
- **Modular**: Each step as independent BullMQ job
- **Extensible**: Dynamic function addition without rebuild
- **Scalable**: Parallel processing of multiple companies
- **Reliable**: Built-in retry logic and error handling

### Queue Structure
```javascript
// Primary pipeline queues
- url-discovery      // Step 2: Find company URLs
- content-scraping   // Step 4: Extract content 
- profile-generation // Step 6: LLM-based profile creation
- quality-assurance  // Step 7: Validation and QA
- automated-routing  // Step 8: Pass/fail routing
- output-packaging   // Step 9: Multi-format export
- distribution       // Step 10: External handoff
- human-review       // Step 11: Manual review workflow
```

### Integration with Existing Schema
**Preserved Supabase Tables**:
- `companies` - Company seed data and metadata
- `discovery_links` - URL discovery results  
- `content_raw` - Scraped HTML and text content
- `content_json_draft` - Generated profile drafts

**BullMQ Integration**:
- Job state managed in Redis
- Progress tracking via WebSocket
- Audit trail in `workflow_events` table

## Development Progress

### Completed Phases ✅
- **Infrastructure Setup**: Server, Redis, BullMQ installed and tested
- **Architecture Design**: Web-controlled pipeline system specified
- **Database Schema**: Existing Supabase integration preserved
- **Foundation Testing**: Basic job queue functionality verified

### Current Status: Ready for Implementation
**Next Development Phase**: Express API + Frontend
- **API Server**: REST endpoints for pipeline control
- **WebSocket**: Real-time job monitoring
- **Web Dashboard**: Company upload and pipeline management
- **Dynamic Functions**: Add/modify workflow steps via UI

### Pipeline Steps Status
- ✅ **Step 1**: Company upload (working via existing interface)
- ✅ **Step 2**: URL discovery (proven working, needs BullMQ integration)  
- ✅ **Step 4**: Content scraping (proven working, needs BullMQ integration)
- 🎯 **Step 6**: Profile generation (ready for LLM integration)
- 🎯 **Steps 7-11**: QA, routing, packaging, export, review (architecture ready)

## File Structure (Ready for Implementation)
```
/opt/company-pipeline/
├── .env                    # Environment configuration
├── package.json           # Node.js dependencies
├── test-bullmq.js         # Working BullMQ test (verified)
└── [Ready for:]
    ├── server.js           # Express API server
    ├── workers.js          # BullMQ worker definitions  
    ├── routes/             # API endpoint modules
    ├── public/             # Web interface files
    └── workflows/          # Dynamic workflow definitions
```

## Environment Configuration
```bash
# /opt/company-pipeline/.env
REDIS_HOST=127.0.0.1
REDIS_PORT=6379  
REDIS_PASSWORD=Danne2025
SUPABASE_URL=https://fevxvwqjhndetktujeuu.supabase.co
SUPABASE_SERVICE_KEY=[configured]
```

## Key Architectural Advantages

### Web-First Design
- **No Terminal Required**: All operations through browser
- **Real-time Monitoring**: Live job progress and status
- **Decision Points**: Approve/reject profiles via UI
- **Dynamic Configuration**: Modify workflows without restart

### Extensibility Features  
- **Plugin Architecture**: Upload new processing functions
- **Multi-Industry Support**: Adaptable beyond iGaming
- **A/B Testing**: Run different workflows simultaneously
- **API Integration**: Connect external services easily

### Production Readiness
- **Horizontal Scaling**: Add more worker processes
- **Error Handling**: Automatic retries and failure routing
- **Audit Trail**: Complete processing history
- **Security**: Authentication and input validation

## Integration Points

### Existing Systems
- **Supabase**: Preserves current data and schema
- **LLM APIs**: OpenAI/Anthropic for profile generation
- **Google APIs**: Document export and sheets integration

### Development Workflow
- **Claude Code**: Autonomous feature development
- **Git Repository**: Version control and deployment
- **Web Interface**: Primary interaction method
- **API Endpoints**: Programmatic access for extensions

## Success Criteria

### Immediate Goals (Next Phase)
- 🎯 Express API server operational
- 🎯 Web dashboard functional for company upload
- 🎯 Real-time job monitoring working
- 🎯 Basic pipeline (Steps 2→4→6) operational

### Long-term Vision
- Multi-company parallel processing
- Sub-10-minute profile generation end-to-end
- 99.9% pipeline reliability with retry logic
- Dynamic workflow modification without downtime
- Multi-industry template system

## Next Actions for Claude Code

### Phase 1: Core API Development
1. **Express Server**: REST API with pipeline control endpoints
2. **WebSocket Integration**: Real-time job status updates
3. **Company Management**: Upload, list, status tracking APIs
4. **Basic Authentication**: Secure API access

### Phase 2: Web Interface
1. **Dashboard**: Company upload and pipeline control
2. **Monitoring**: Real-time job progress visualization  
3. **Results Viewer**: Generated profiles display and download
4. **Error Handling**: Retry controls and failure investigation

### Phase 3: Advanced Features  
1. **Function Management**: Dynamic workflow step addition
2. **Workflow Designer**: Visual pipeline configuration
3. **Multi-Industry Templates**: Adaptable content creation
4. **Performance Optimization**: Parallel processing and scaling

## Historical Context

### Evolution from Previous Approaches
This architecture evolved from recognizing the need for:
- **Better Orchestration**: More robust than traditional workflow tools
- **Web Management**: Eliminate terminal-based operations
- **Extensibility**: Support future content types and industries
- **Developer Experience**: Enable Claude Code to enhance iteratively

### Proven Components
The pipeline logic is based on working implementations of:
- Company upload and validation
- Real URL discovery (not fake URL generation)
- Content scraping with 98.1% success rate
- Supabase data integration

---

**Status**: Infrastructure complete and ready for Claude Code to implement the Express API server and web interface. The foundation supports the complete vision of a web-managed, dynamically extensible content creation platform.