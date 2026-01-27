#!/bin/bash
# Project Launcher - Quick access to projects with context

# Usage: source this file in your .zshrc or .bash_profile
# Then use: work-on content-pipeline

work-on() {
    local project=$1

    case $project in
        "content-pipeline"|"cp")
            cd "/Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/Content-Pipeline"
            echo "📂 Content Pipeline Project"
            echo "📋 Reading CLAUDE.md..."
            cat CLAUDE.md | head -20
            echo ""
            echo "🤖 Suggested agents:"
            echo "  - General development: Use Claude Code normally"
            echo "  - Complex debugging: Request Opus 4.5"
            echo "  - Project updates: spawn project-context-manager"
            echo ""
            echo "💡 Quick commands:"
            echo "  ssh-server : Connect to Hetzner (ssh -i ~/.ssh/hetzner_key root@188.245.110.34)"
            ;;

        "news"|"news-section")
            cd "/Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/News-Section"
            echo "📰 News Section Project"
            cat CLAUDE.md 2>/dev/null | head -20 || echo "No CLAUDE.md found"
            ;;

        "seo")
            cd "/Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming/SEO"
            echo "🔍 SEO Project"
            cat CLAUDE.md 2>/dev/null | head -20 || echo "No CLAUDE.md found"
            ;;

        *)
            echo "❌ Unknown project: $project"
            echo ""
            echo "Available projects:"
            echo "  content-pipeline (cp) - Universal Content Pipeline"
            echo "  news (news-section)   - News Section"
            echo "  seo                   - SEO Strategy"
            echo ""
            echo "Usage: work-on <project-name>"
            ;;
    esac
}

# Alias for SSH to content pipeline server
alias ssh-cp-server='ssh -i ~/.ssh/hetzner_key root@188.245.110.34'

# Quick project status check
project-status() {
    local project_dir=$(pwd)
    if [[ -f "CLAUDE.md" ]]; then
        echo "📊 Project Status:"
        grep "^## Current Status" -A 5 CLAUDE.md
        echo ""
        echo "🚧 Blockers:"
        grep "^## Current Blockers" -A 5 CLAUDE.md
    else
        echo "Not in a project directory (no CLAUDE.md found)"
    fi
}

# Personal Assistant - accountability check-in
pa() {
    echo "🎯 Personal Assistant - Accountability Mode"
    echo ""
    local state_file="/Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/PA_STATE.md"
    if [[ -f "$state_file" ]]; then
        echo "📊 Last Session:"
        grep "^### " "$state_file" | head -1
        echo ""
        echo "📋 Open Commitments:"
        grep "| .* | OPEN |" "$state_file" 2>/dev/null || echo "  None tracked yet"
        echo ""
        echo "🔥 Streak:"
        grep "^\*\*Focused Sessions" "$state_file"
    else
        echo "⚠️  No PA_STATE.md found. First session - will be created."
    fi
    echo ""
    echo "💡 Invoke the personal-assistant agent in Claude Code to begin check-in."
}

# Quick commitment check without full PA session
commitments() {
    local state_file="/Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/PA_STATE.md"
    if [[ -f "$state_file" ]]; then
        echo "📋 Open Commitments:"
        echo ""
        grep "| .* | OPEN |" "$state_file" 2>/dev/null || echo "  No open commitments"
        echo ""
        echo "📊 Current Streak:"
        grep "^\*\*Focused Sessions" "$state_file"
    else
        echo "No PA_STATE.md found. Run 'pa' to initialize."
    fi
}

# Cross-project status pulse
pulse() {
    echo "======================================"
    echo "PROJECT PULSE"
    echo "======================================"
    echo ""

    local base="/Users/danieloskarsson/Library/CloudStorage/Dropbox/Projects/OnlyiGaming"

    echo "Content-Pipeline:"
    grep -i "phase\|status\|priority" "$base/Content-Pipeline/CLAUDE.md" 2>/dev/null | head -2
    echo ""

    echo "News-Section:"
    grep -i "phase\|status\|priority" "$base/News-Section/CLAUDE.md" 2>/dev/null | head -2
    echo ""

    echo "SEO:"
    grep -i "phase\|status\|priority" "$base/SEO/CLAUDE.md" 2>/dev/null | head -2
    echo ""
    echo "======================================"
    echo "💡 For full accountability check-in, run 'pa'"
}

# List available agents
list-agents() {
    echo "🤖 Available Custom Agents:"
    echo ""
    ls -1 /Users/danieloskarsson/Dropbox/Projects/.agents/ | sed 's/.md$//' | while read agent; do
        echo "  - $agent"
    done
    echo ""
    echo "💡 Use Task tool to spawn these agents"
    echo "📚 See GLOBAL_AGENT_INSTRUCTIONS.md for usage guidelines"
}
