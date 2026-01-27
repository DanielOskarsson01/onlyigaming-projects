# Research: Supabase MCP Server Setup for Claude Code

**Date**: 2026-01-24
**Research Scope**: Complete setup guide for integrating Supabase MCP server with Claude Code CLI tool, including configuration formats, authentication methods, and troubleshooting

## Key Takeaways

1. **Use Remote MCP Server**: Supabase now provides a hosted remote MCP server at `https://mcp.supabase.com/mcp` which is the recommended approach for most users, offering OAuth 2.1 authentication and broader client compatibility.

2. **No Manual Access Token Required**: The authentication flow has been modernized - OAuth-based automatic login via browser has replaced manual personal access token generation.

3. **Two Configuration Options**: Claude Code supports both HTTP-based (remote) and stdio-based (local npx) MCP server configurations via `.mcp.json` files.

4. **Development Only**: Supabase MCP is designed exclusively for development/testing environments - never connect to production databases.

5. **Security Features Available**: The MCP server supports `--read-only` mode and `--project-ref` scoping to limit access and prevent accidental data modification.

## Executive Summary

Supabase provides an official MCP (Model Context Protocol) server that enables AI assistants like Claude Code to interact directly with Supabase projects. The integration allows Claude to manage databases, design schemas, execute queries, generate TypeScript types, deploy Edge Functions, and access logs - all through natural language.

As of January 2026, Supabase offers two primary deployment options: a hosted remote MCP server at `https://mcp.supabase.com/mcp` (recommended) and a local npx-based server `@supabase/mcp-server-supabase`. The remote server uses OAuth 2.1 for streamlined authentication, while the local server can use environment variables or OAuth. Both options provide access to 20+ tools for comprehensive Supabase management.

Configuration is straightforward for Claude Code users via `.mcp.json` files at the project root, with automatic OAuth flows handling authentication in most cases. Critical security considerations include using development-only projects, enabling read-only mode when possible, and scoping access to specific projects.

## Detailed Findings

### Official Supabase MCP Server Package

**Package Name**: `@supabase/mcp-server-supabase`

**Repository**: The official implementation is maintained at [github.com/supabase-community/supabase-mcp](https://github.com/supabase-community/supabase-mcp)

**Deployment Options**:
1. **Remote/HTTP Server** (Recommended): `https://mcp.supabase.com/mcp`
2. **Local/NPX Server**: `npx -y @supabase/mcp-server-supabase@latest`

**Capabilities**:
- Project creation and management
- Schema design and migrations
- SQL query execution and reporting
- TypeScript type generation
- Edge Function deployment
- Log retrieval for debugging
- Access to 20+ specialized tools

### Claude Code Configuration Format

Claude Code uses `.mcp.json` files for MCP server configuration. These can be placed at:
- **Project scope**: `.mcp.json` at project root (shareable with team, version-controlled)
- **User scope**: `~/.claude.json` (available across all projects)
- **System scope**: `/Library/Application Support/ClaudeCode/managed-mcp.json` (macOS, admin-managed)

**Standard JSON Structure**:
```json
{
  "mcpServers": {
    "server-name": {
      "type": "http|stdio",
      // ... server-specific configuration
    }
  }
}
```

### Configuration Option 1: Remote MCP Server (Recommended)

The remote MCP server is the modern, recommended approach for most users.

**Configuration for Your Supabase Instance**:
```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp"
    }
  }
}
```

**With Project Scoping** (recommended for security):
```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=fevxvwqjhndetktujeuu"
    }
  }
}
```

**Authentication Flow**:
1. Claude Code automatically initiates OAuth flow when connecting
2. Browser window opens for Supabase login
3. User grants organization access to MCP client
4. Tokens are automatically managed by Claude Code
5. May need to use `/mcp` command in Claude Code to trigger authentication

**Benefits**:
- No manual token management
- Works with web-based AI agents
- Simpler setup process
- Automatic token refresh
- Broader client compatibility

### Configuration Option 2: Local NPX Server

For users who prefer running the MCP server locally or need more control.

**Basic Configuration**:
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase",
        "--access-token",
        "<personal-access-token>"
      ]
    }
  }
}
```

**Recommended Secure Configuration**:
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase",
        "--read-only",
        "--project-ref=fevxvwqjhndetktujeuu"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "<personal-access-token>"
      }
    }
  }
}
```

**Windows Users**:
```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase",
        "--read-only",
        "--project-ref=fevxvwqjhndetktujeuu"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "<personal-access-token>"
      }
    }
  }
}
```

**Important Flags**:
- `--read-only`: Restricts server to read-only queries (highly recommended)
- `--project-ref=<ref>`: Scopes access to specific project (highly recommended)
- `--access-token=<token>`: Provides authentication token (alternatively use env var)

### Required Credentials and Environment Variables

**For Remote MCP Server**:
- No manual credentials required
- OAuth flow handles authentication automatically
- Optionally can scope to project via URL parameter: `?project_ref=fevxvwqjhndetktujeuu`

**For Local NPX Server**:

Required environment variables depend on use case:

**Minimum Configuration**:
```bash
SUPABASE_ACCESS_TOKEN=<your-personal-access-token>
```

**Full Configuration** (for advanced usage):
```bash
# Core Authentication
SUPABASE_ACCESS_TOKEN=<personal-access-token>

# Project Connection
SUPABASE_URL=https://fevxvwqjhndetktujeuu.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# For Remote Projects
SUPABASE_PROJECT_REF=fevxvwqjhndetktujeuu
SUPABASE_DB_PASSWORD=<your-db-password>
SUPABASE_REGION=<your-region>  # Critical: must match project's actual region

# Additional (optional)
MCP_API_KEY=<if-required-by-client>
DATABASE_URL=<connection-string>
```

**How to Obtain Credentials**:

1. **Personal Access Token** (for local server):
   - Go to Supabase Dashboard → Account Settings → Access Tokens
   - Create new token with appropriate scopes
   - Note: OAuth flow is now preferred, manual tokens increasingly optional

2. **Project Reference**:
   - Found in Supabase Dashboard → Project Settings → General
   - Format: alphanumeric string (e.g., `fevxvwqjhndetktujeuu`)

3. **Supabase URL**:
   - Your project URL: `https://fevxvwqjhndetktujeuu.supabase.co`

4. **API Keys**:
   - Supabase Dashboard → Project Settings → API
   - anon/public key and service_role key available here

5. **Region**:
   - Supabase Dashboard → Project Settings → General
   - Must match exactly or authentication will fail with "Tenant or user not found"

### Authentication Methods Comparison

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| **Remote + OAuth** | Automatic, secure, no manual tokens, works everywhere | Requires browser access | Most users, production workflows |
| **Local + OAuth** | Full control, local execution | More complex setup | Power users, custom environments |
| **Local + PAT** | Simple for CLI, scriptable | Manual token management, less secure | CI/CD, automated workflows |

**Important Note**: The authentication landscape changed in late 2025/early 2026. Previously, personal access tokens (PAT) were required, but now OAuth is the default and recommended approach. Manual tokens are primarily for CI environments or clients that don't support dynamic OAuth.

## Common Issues and Troubleshooting

### Issue 1: Package Installation Fails

**Symptom**: NPX fails to install or run the package

**Solution**: Remove `@latest` from package name
```json
"args": ["-y", "@supabase/mcp-server-supabase", ...]
```

**Source**: Common fix reported in GitHub issues

### Issue 2: OAuth Discovery Failed

**Symptoms**:
- "OAuth discovery failed" error
- 403 or 404 errors on registration endpoint
- "Failed to create authentication token"

**Solutions**:
1. Restart Claude Code after initial authorization
2. Use `/mcp` command in Claude Code to trigger authentication
3. For VSCode/Cursor: May need to manually accept OAuth flow
4. Check client supports dynamic client registration

### Issue 3: "Tenant or User Not Found" Error

**Symptom**: HTTP 401 with tenant/user not found message

**Root Cause**: Incorrect region configuration

**Solution**: Verify and set correct region in environment variables
```bash
SUPABASE_REGION=us-east-1  # Replace with your actual region
```

Check actual region in Supabase Dashboard → Project Settings → General

### Issue 4: "No Access Token Provided"

**Symptom**: HTTP 401 Unauthorized with "No access token was provided in this request"

**Causes**:
- Using bearer API keys instead of OAuth flow
- Dynamic client registration failing
- Token not properly passed to server

**Solutions**:
1. Use OAuth flow (remote server) instead of manual tokens
2. For local server, verify `SUPABASE_ACCESS_TOKEN` is set correctly
3. Check token has appropriate scopes/permissions

### Issue 5: Permission Errors (403 Forbidden)

**Symptom**: "Your account does not have the necessary privileges to access this endpoint"

**Causes**:
- Insufficient organization permissions
- Wrong organization selected during OAuth
- Token lacks required scopes

**Solutions**:
1. Verify you have Owner privileges in the Supabase organization
2. Re-authenticate and select correct organization
3. For PAT: Regenerate token with all required scopes

### Issue 6: Tools Not Detected After Setup

**Symptom**: MCP server connects but tools aren't available

**Solution**: Restart Claude Code completely after authorization

**Note**: Different clients handle tool discovery differently; some require manual restart

### Issue 7: Project Reference DNS Issues

**Symptom**: "Project Ref Not Resolving DNS"

**Causes**:
- Invalid project reference
- Typo in project ref
- Network/connectivity issues

**Solutions**:
1. Verify project ref in Supabase Dashboard
2. Test connectivity to `https://<project-ref>.supabase.co`
3. Check DNS resolution and network access

### Issue 8: Self-Hosted Supabase Issues

**Symptoms**:
- MCP authentication stuck
- HTTP 401 errors with self-hosted instances
- Connection refused

**Root Cause**: Self-hosted Supabase has limited MCP support

**Current Limitations**:
- No OAuth 2.1 support for self-hosted (as of Jan 2026)
- By default, all connections denied
- Must protect at network level
- Not intended for Internet exposure

**Alternative**: Use community packages designed for self-hosted Supabase:
- [HenkDz/selfhosted-supabase-mcp](https://github.com/HenkDz/selfhosted-supabase-mcp)

## Security Best Practices

### 1. Never Connect to Production

Supabase MCP is explicitly designed for development and testing only. Create a separate development project for MCP usage.

**Rationale**: AI agents have broad access to database operations; mistakes could corrupt or delete production data.

### 2. Use Read-Only Mode

When possible, enable read-only mode to prevent accidental modifications:
```json
"args": ["...", "--read-only"]
```

### 3. Scope to Specific Projects

Limit MCP server access to individual projects:
```json
"args": ["...", "--project-ref=fevxvwqjhndetktujeuu"]
```

Or via URL parameter for remote server:
```json
"url": "https://mcp.supabase.com/mcp?project_ref=fevxvwqjhndetktujeuu"
```

### 4. Review Tool Calls Before Execution

Most MCP clients ask for manual approval of each tool call. **Keep this enabled** and review operations before executing, especially:
- Schema modifications
- Data deletion
- Permission changes
- Edge Function deployments

### 5. Use Environment Variables for Secrets

Never hardcode tokens in configuration files:
```json
"env": {
  "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
}
```

Store tokens in:
- `.env` files (add to `.gitignore`)
- System environment variables
- Secure secret management tools

### 6. Rotate Tokens Regularly

Personal access tokens should be:
- Rotated every 90 days minimum
- Immediately revoked if compromised
- Limited to minimum required scopes

### 7. Audit MCP Activity

Regularly review:
- Supabase logs for unexpected operations
- MCP tool call history
- Database schema changes
- Data modifications

## Recommendations

### For Your Supabase Instance (fevxvwqjhndetktujeuu.supabase.co)

**Recommended Configuration** (Remote MCP with project scoping):

Create `.mcp.json` in your project root:
```json
{
  "mcpServers": {
    "supabase-onlyigaming": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=fevxvwqjhndetktujeuu"
    }
  }
}
```

**Setup Steps**:
1. Create `.mcp.json` file in `/Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/`
2. Add the configuration above
3. Restart Claude Code
4. Use `/mcp` command to trigger OAuth authentication
5. Browser will open for Supabase login
6. Select correct organization and grant access
7. Verify connection with a simple query like "show me my database tables"

**Alternative: Local Server with Read-Only** (if remote doesn't work):

```json
{
  "mcpServers": {
    "supabase-onlyigaming": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase",
        "--read-only",
        "--project-ref=fevxvwqjhndetktujeuu"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
      }
    }
  }
}
```

Then set environment variable:
```bash
export SUPABASE_ACCESS_TOKEN="your-token-here"
```

### When to Use Which Configuration

**Use Remote MCP Server when**:
- Starting fresh with Claude Code
- Working in standard development environment
- Want simplest possible setup
- Need to share configuration with team
- Using web-based AI agents

**Use Local NPX Server when**:
- Need offline functionality
- Require specific version control
- Working in restricted network environments
- Building CI/CD integrations
- Need environment variable isolation

### Testing Your Configuration

After setup, test with these commands in Claude Code:

1. **List available tools**: "What Supabase tools do you have access to?"
2. **Check connection**: "Can you connect to my Supabase project?"
3. **Simple query**: "Show me the tables in my database"
4. **Type generation**: "Generate TypeScript types for my database schema"

### Next Steps

1. Set up development-only Supabase project (if using production currently)
2. Implement `.mcp.json` configuration
3. Test connection and authentication
4. Explore available tools with Claude
5. Integrate into development workflow
6. Document team usage guidelines

## Sources

1. [Model context protocol (MCP) | Supabase Docs](https://supabase.com/docs/guides/getting-started/mcp) - Official MCP setup documentation
2. [How to use Supabase MCP with Claude Code - Composio](https://composio.dev/blog/supabase-mcp-with-claude-code) - Detailed integration guide
3. [GitHub - supabase-community/supabase-mcp](https://github.com/supabase-community/supabase-mcp) - Official repository
4. [Claude Code + Supabase Integration: Complete Guide with Agents, Commands and MCP | Medium](https://medium.com/@dan.avila7/claude-code-supabase-integration-complete-guide-with-agents-commands-and-mcp-427613d9051e) - Comprehensive tutorial
5. [Supabase MCP Server Blog Announcement](https://supabase.com/blog/mcp-server) - Official feature announcement
6. [Connect Claude Code to tools via MCP - Claude Code Docs](https://code.claude.com/docs/en/mcp) - Claude Code MCP documentation
7. [Configuring MCP Tools in Claude Code - Scott Spence](https://scottspence.com/posts/configuring-mcp-tools-in-claude-code) - Practical configuration guide
8. [Add MCP Servers to Claude Code - MCPcat](https://mcpcat.io/guides/adding-an-mcp-server-to-claude-code/) - Setup guide
9. [Model Context Protocol (MCP) Authentication | Supabase Docs](https://supabase.com/docs/guides/auth/oauth-server/mcp-authentication) - Authentication details
10. [Announcing the Supabase Remote MCP Server](https://supabase.com/blog/remote-mcp-server) - Remote server launch announcement
11. [Enabling MCP Server Access | Supabase Docs](https://supabase.com/docs/guides/self-hosting/enable-mcp) - Self-hosting configuration
12. [Issues · supabase-community/supabase-mcp](https://github.com/supabase-community/supabase-mcp/issues) - Troubleshooting resource

## Research Notes

### Authentication Evolution

The Supabase MCP authentication mechanism underwent significant changes in late 2025/early 2026. Earlier documentation and tutorials may reference manual personal access token (PAT) generation as the primary method, but the current recommended approach is OAuth 2.1 with automatic browser-based login. This change makes setup easier but may cause confusion when following older guides.

### CLI Environment Limitations

As of January 2026, OAuth 2.1 authentication is not available for CLI environments or self-hosted Supabase installations. Users in these scenarios must still use personal access tokens and protect the MCP server at the network level. Supabase documentation indicates this limitation may be addressed in future releases.

### Community vs. Official Packages

Multiple community-built Supabase MCP servers exist (Python-based, React widget versions, self-hosted variants). While these may offer additional features or flexibility, the official `@supabase/mcp-server-supabase` package from `supabase-community` organization is the recommended and best-maintained option for most users.

### Windows Compatibility

Windows users must use `cmd /c` wrapper for npx commands in MCP configuration, which is not always clearly documented in cross-platform guides. This is a common source of setup issues for Windows-based Claude Code users.

### Project Reference Extraction

The project reference (needed for scoping) is the subdomain of your Supabase URL. For `https://fevxvwqjhndetktujeuu.supabase.co`, the project ref is `fevxvwqjhndetktujeuu`. While obvious once known, this isn't always clearly stated in documentation.

### Areas for Further Investigation

1. **Performance characteristics**: How does remote vs. local MCP server compare for latency-sensitive operations?
2. **Rate limiting**: Are there request limits for the hosted MCP server?
3. **Tool coverage**: Do remote and local servers offer identical tool sets, or are there differences?
4. **Token scopes**: What are the minimum required scopes for personal access tokens in PAT-based authentication?
5. **Enterprise features**: Are there additional MCP capabilities available for Supabase Enterprise customers?

### Conflicting Information

Some older tutorials and Stack Overflow answers reference `@modelcontextprotocol/server-supabase` as the package name, but this appears to be incorrect or outdated. The official package is `@supabase/mcp-server-supabase`. Similarly, some guides suggest the `@latest` tag is required, while GitHub issues indicate it should be omitted to avoid installation problems.
