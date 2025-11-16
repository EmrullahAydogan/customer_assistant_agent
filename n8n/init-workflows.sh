#!/bin/bash
# ============================================
# N8N Workflow Auto-Import Script
# This script runs inside the N8N container on startup
# ============================================

set -e

echo "🔄 N8N Workflow Auto-Import: Starting..."

# Wait for N8N to be fully ready
sleep 10

# N8N API endpoint
API_URL="http://localhost:5678/api/v1"
AUTH="admin:n8n_admin_2024"
WORKFLOW_DIR="/home/node/.n8n/workflows"

echo "📂 Checking workflow directory: $WORKFLOW_DIR"

# Check if workflows directory exists and has files
if [ ! -d "$WORKFLOW_DIR" ] || [ -z "$(ls -A $WORKFLOW_DIR/*.json 2>/dev/null)" ]; then
    echo "⚠️  No workflow files found in $WORKFLOW_DIR"
    exit 0
fi

echo "📋 Found workflow files:"
ls -la $WORKFLOW_DIR/*.json

# Import each workflow
for workflow_file in $WORKFLOW_DIR/*.json; do
    if [ -f "$workflow_file" ]; then
        workflow_name=$(basename "$workflow_file")
        echo "📥 Importing: $workflow_name"

        # Use n8n CLI to import workflow
        n8n import:workflow --input="$workflow_file" --separate 2>&1 || {
            echo "⚠️  Failed to import $workflow_name (might already exist)"
        }
    fi
done

echo "✅ N8N Workflow Auto-Import: Completed"
