#!/bin/bash

# ============================================
# N8N Workflow Import Script
# ============================================
# This script imports workflows from JSON files into N8N via API
# Usage: ./scripts/import-n8n-workflows.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# N8N Configuration
N8N_URL="http://localhost:5678"
N8N_USER="admin"
N8N_PASSWORD="n8n_admin_2024"
WORKFLOW_DIR="./n8n/workflows"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}N8N Workflow Import Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if N8N is running
echo -e "${YELLOW}Checking N8N availability...${NC}"
if ! curl -s -f -o /dev/null "${N8N_URL}"; then
    echo -e "${RED}Error: N8N is not accessible at ${N8N_URL}${NC}"
    echo -e "${RED}Please make sure N8N is running: docker-compose up -d n8n${NC}"
    exit 1
fi
echo -e "${GREEN}✓ N8N is running${NC}"
echo ""

# Function to import a workflow
import_workflow() {
    local workflow_file=$1
    local workflow_name=$(basename "$workflow_file" .json)

    echo -e "${YELLOW}Importing: ${workflow_name}${NC}"

    # Read the workflow JSON
    local workflow_json=$(cat "$workflow_file")

    # Import via N8N API
    # Note: N8N's import endpoint requires authentication
    response=$(curl -s -w "\n%{http_code}" -X POST "${N8N_URL}/api/v1/workflows" \
        -u "${N8N_USER}:${N8N_PASSWORD}" \
        -H "Content-Type: application/json" \
        -d "$workflow_json")

    # Extract HTTP status code
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | sed '$d')

    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo -e "${GREEN}✓ Successfully imported: ${workflow_name}${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed to import: ${workflow_name}${NC}"
        echo -e "${RED}HTTP Status: ${http_code}${NC}"
        echo -e "${RED}Response: ${response_body}${NC}"
        return 1
    fi
}

# Import all workflows
echo -e "${YELLOW}Starting workflow import...${NC}"
echo ""

success_count=0
failure_count=0

for workflow_file in "$WORKFLOW_DIR"/*.json; do
    if [ -f "$workflow_file" ]; then
        if import_workflow "$workflow_file"; then
            ((success_count++))
        else
            ((failure_count++))
        fi
        echo ""
    fi
done

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Import Summary${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Successfully imported: ${GREEN}${success_count}${NC} workflows"
if [ $failure_count -gt 0 ]; then
    echo -e "Failed to import: ${RED}${failure_count}${NC} workflows"
fi
echo ""

if [ $failure_count -eq 0 ]; then
    echo -e "${GREEN}All workflows imported successfully!${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Open N8N at: ${N8N_URL}"
    echo "2. Login with credentials (admin / n8n_admin_2024)"
    echo "3. Configure API credentials (Gemini API, PostgreSQL)"
    echo "4. Activate the workflows"
    exit 0
else
    echo -e "${YELLOW}Some workflows failed to import.${NC}"
    echo -e "${YELLOW}This might be because they already exist.${NC}"
    echo ""
    echo -e "${YELLOW}To update existing workflows:${NC}"
    echo "1. Delete old workflows from N8N UI"
    echo "2. Run this script again"
    exit 1
fi
