#!/bin/bash

# ============================================
# Customer Assistant Agent - Setup Script
# ============================================

set -e

echo "🚀 Customer Assistant Agent Setup"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Docker
echo "🔍 Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo "Please install Docker Compose first: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker is installed${NC}"
echo ""

# Check if .env file exists
if [ ! -f backend/.env ]; then
    echo "📝 Creating .env file from example..."
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}⚠️  Please review backend/.env and update credentials if needed${NC}"
fi

# Create Qdrant collection
echo "📊 Preparing Qdrant vector database..."
echo "Note: Qdrant will be initialized when containers start"
echo ""

# Build and start services
echo "🏗️  Building Docker images..."
echo "This may take several minutes..."
echo ""

# Use docker compose (new) or docker-compose (old)
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

$DOCKER_COMPOSE build

echo ""
echo "🚢 Starting services..."
echo ""

$DOCKER_COMPOSE up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo ""
echo "🏥 Checking service health..."

services=("postgres" "mongodb" "qdrant" "backend" "n8n")
for service in "${services[@]}"; do
    if $DOCKER_COMPOSE ps | grep -q "$service.*running"; then
        echo -e "${GREEN}✅ $service is running${NC}"
    else
        echo -e "${RED}❌ $service is not running${NC}"
    fi
done

echo ""
echo "🎉 Setup complete!"
echo ""
echo "================================"
echo "📍 Service URLs:"
echo "================================"
echo "🌐 Main Portal:            http://localhost"
echo "📦 Product Management:     http://localhost/products"
echo "💬 Chat Monitor:           http://localhost/chat"
echo "🔧 Backend API:            http://localhost:3000"
echo "⚙️  N8N Workflows:          http://localhost:5678"
echo "   └─ Username: admin"
echo "   └─ Password: n8n_admin_2024"
echo "🗄️  PostgreSQL:            localhost:5432"
echo "   └─ Database: chat_database"
echo "   └─ User: chat_user"
echo "   └─ Password: chat_password_2024"
echo "📊 MongoDB:                localhost:27017"
echo "   └─ Database: product_catalog"
echo "   └─ User: admin"
echo "   └─ Password: mongo_password_2024"
echo "🔍 Qdrant:                 http://localhost:6333"
echo ""
echo "================================"
echo "📚 Next Steps:"
echo "================================"
echo "1. Import N8N workflows from ./n8n/workflows/"
echo "2. Configure N8N credentials:"
echo "   - Google Gemini API (for embeddings)"
echo "   - MongoDB connection"
echo "   - PostgreSQL connection"
echo "3. Run the data ingestion workflow to populate Qdrant"
echo "4. Start chatting!"
echo ""
echo "🔧 Useful commands:"
echo "  View logs:          $DOCKER_COMPOSE logs -f [service]"
echo "  Stop services:      $DOCKER_COMPOSE stop"
echo "  Start services:     $DOCKER_COMPOSE start"
echo "  Restart services:   $DOCKER_COMPOSE restart"
echo "  Remove everything:  $DOCKER_COMPOSE down -v"
echo ""
echo -e "${GREEN}✨ Happy coding!${NC}"
