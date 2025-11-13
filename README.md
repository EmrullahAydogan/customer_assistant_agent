# 🤖 Customer Assistant Agent

AI-powered customer support system with N8N workflow automation, RAG (Retrieval Augmented Generation), and multi-database architecture.

## 🎯 Features

### ✨ Key Features
- **RAG System**: Semantic search with Qdrant vector database
- **Multi-Database**: PostgreSQL (chat), MongoDB (products), Qdrant (vectors)
- **N8N Workflows**: Automated data ingestion and chat endpoint
- **Multiple Web UIs**: Customer chat interface, product management, and chat monitoring dashboards
- **Docker Compose**: One-command deployment
- **AI Agent**: Powered by Google Gemini
- **Analytics**: Real-time statistics and sentiment analysis

### 📊 Databases
1. **PostgreSQL**: Chat history, conversations, analytics
2. **MongoDB**: Product catalog, brands, error codes
3. **Qdrant**: Vector embeddings, semantic search

## 🚀 Quick Start

### Requirements
- Docker 20.10+
- Docker Compose 2.0+
- 8GB+ RAM
- 10GB+ Disk space

### Installation

```bash
# 1. Run setup script
./setup.sh

# 2. Open in browser
# http://localhost
```

## 🌐 Service URLs

After installation, access these services:

- **Main Portal**: http://localhost
- **Customer Chat**: http://localhost/customer-chat (for customers)
- **Product Management**: http://localhost/products (admin)
- **Chat Monitor**: http://localhost/chat (admin)
- **Backend API**: http://localhost:3000
- **N8N**: http://localhost:5678 (admin/n8n_admin_2024)
- **PostgreSQL**: localhost:5432 (chat_user/chat_password_2024)
- **MongoDB**: localhost:27017 (admin/mongo_password_2024)
- **Qdrant**: http://localhost:6333

## 📁 Project Structure

```
customer_assistant_agent/
├── docker-compose.yml           # Main Docker configuration
├── setup.sh                     # Automated setup script
├── database/                    # DB initialization files
│   ├── postgres/init.sql
│   └── mongodb/init-mongo.js
├── backend/                     # Express.js API
│   └── src/
│       ├── server.js
│       ├── config/
│       └── routes/
├── frontend/
│   ├── customer-chat/           # Customer chat interface (standalone HTML)
│   ├── product-management/      # Product management UI (React)
│   └── chat-monitor/            # Chat monitoring UI (React)
├── n8n/workflows/               # N8N workflow files
└── nginx/nginx.conf             # Reverse proxy config
```

## 🐳 Docker Architecture

### Services Running in Docker (9 Containers)

All application components run in Docker containers:

| Service | Container Name | Purpose | Port |
|---------|---------------|---------|------|
| **postgres** | chat_postgres | PostgreSQL database for chat history | 5432 |
| **mongodb** | product_mongodb | MongoDB database for product catalog | 27017 |
| **qdrant** | qdrant_vector_db | Vector database for RAG embeddings | 6333, 6334 |
| **n8n** | n8n_workflows | Workflow automation engine | 5678 |
| **backend** | backend_api | Express.js REST API server | 3000 |
| **frontend_products** | frontend_product_management | Product Management UI (React + Nginx) | 3001 |
| **frontend_chat** | frontend_chat_monitor | Chat Monitor UI (React + Nginx) | 3002 |
| **frontend_customer_chat** | frontend_customer_chat | Customer Chat Interface (HTML + Nginx) | 3003 |
| **nginx** | nginx_proxy | Reverse proxy (main entry point) | 80 |

### Docker Volumes (Persistent Data)

Data persists across container restarts:

- `postgres_data` - PostgreSQL database files
- `mongodb_data` - MongoDB database files
- `qdrant_data` - Vector embeddings and indexes
- `n8n_data` - N8N workflows and credentials

### Docker Network

- `app_network` (bridge) - All containers communicate through this internal network
- Container-to-container communication uses service names (e.g., `postgres:5432`, `mongodb:27017`)

## 📦 What's Included vs. Manual Steps

### ✅ Fully Automated (In Docker)

Everything below starts automatically with `docker-compose up -d`:

- All 9 services (databases, backend, frontends, N8N)
- Database initialization scripts run on first start
- Network configuration and service dependencies
- Health checks and automatic restarts
- Data persistence in Docker volumes

### ⚠️ Manual Configuration Required

After running `./setup.sh`, complete these 3 steps:

#### 1. Create Qdrant Collection

```bash
curl -X PUT http://localhost:6333/collections/rag_docs_gemini_3072_metadata \
  -H "Content-Type: application/json" \
  -d '{
    "vectors": {
      "size": 768,
      "distance": "Cosine"
    }
  }'
```

#### 2. Configure N8N Credentials

Open http://localhost:5678 (admin/n8n_admin_2024) and add:

**MongoDB Credential:**
- Type: MongoDB
- Connection String: `mongodb://admin:mongo_password_2024@mongodb:27017/product_catalog?authSource=admin`

**PostgreSQL Credential:**
- Type: PostgreSQL
- Host: `postgres`
- Port: `5432`
- Database: `chat_database`
- User: `chat_user`
- Password: `chat_password_2024`

**Google Gemini API Credential:**
- Type: Google PaLM API
- API Key: [Your Gemini API Key from https://ai.google.dev]

#### 3. Import N8N Workflows

In N8N UI:
1. Click **Import** button
2. Import `n8n/workflows/01-data-ingestion-mongodb.json`
3. Import `n8n/workflows/02-chat-endpoint.json`
4. Activate both workflows

### 🔄 First-Time Setup Checklist

```bash
# 1. Start all services
./setup.sh

# 2. Wait for services to be healthy (about 30 seconds)
docker-compose ps

# 3. Create Qdrant collection
curl -X PUT http://localhost:6333/collections/rag_docs_gemini_3072_metadata \
  -H "Content-Type: application/json" \
  -d '{"vectors": {"size": 768, "distance": "Cosine"}}'

# 4. Configure N8N (via browser at http://localhost:5678)
# - Add MongoDB, PostgreSQL, and Gemini API credentials
# - Import both workflow JSON files
# - Activate workflows

# 5. Run data ingestion workflow in N8N
# - Open "Data Ingestion - MongoDB to Qdrant" workflow
# - Click "Execute Workflow"
# - Verify data loaded into Qdrant

# 6. Test the system
curl -X POST http://localhost:5678/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test User",
    "message": "Tell me about THERMOTECH heaters"
  }'

# 7. Access UIs
# - Customer Chat: http://localhost/customer-chat (for customers)
# - Product Management: http://localhost/products (admin)
# - Chat Monitor: http://localhost/chat (admin)
```

## 🔧 N8N Workflows

### 1. Data Ingestion (MongoDB → Qdrant)

Loads product data from MongoDB into Qdrant:

1. Import `n8n/workflows/01-data-ingestion-mongodb.json` in N8N UI
2. Configure credentials:
   - MongoDB: `mongodb://admin:mongo_password_2024@mongodb:27017/product_catalog?authSource=admin`
   - Google Gemini API: [API Key required]
3. Run with Execute Workflow

### 2. Chat Endpoint (Webhook)

Provides chat API endpoint:

1. Import `n8n/workflows/02-chat-endpoint.json`
2. Webhook URL: `http://localhost:5678/webhook/chat`
3. Test:

```bash
curl -X POST http://localhost:5678/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test User",
    "message": "Tell me about THERMOTECH heaters"
  }'
```

## 📊 API Endpoints

### Chat API
```
GET  /api/chat/conversations      # List all conversations
GET  /api/chat/conversations/:id  # Get conversation details
GET  /api/chat/messages           # Get recent messages
GET  /api/chat/search?q=term      # Search conversations
```

### Product API
```
GET    /api/products              # List products
POST   /api/products              # Create product
PUT    /api/products/:id          # Update product
DELETE /api/products/:id          # Delete product

GET    /api/products/brands       # List brands
POST   /api/products/brands       # Create brand

GET    /api/products/errors/codes # List error codes
```

### Analytics API
```
GET  /api/analytics/summary       # Summary statistics
GET  /api/analytics/daily?days=30 # Daily data
GET  /api/analytics/trends        # Trend data
```

## 🛠️ Development

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend/product-management  # or chat-monitor
npm install
npm start
```

## 🐛 Troubleshooting

### Create Qdrant Collection

```bash
curl -X PUT http://localhost:6333/collections/rag_docs_gemini_3072_metadata \
  -H "Content-Type: application/json" \
  -d '{
    "vectors": {
      "size": 768,
      "distance": "Cosine"
    }
  }'
```

### View Logs
```bash
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Health Checks
```bash
curl http://localhost:3000/health
curl http://localhost:6333/healthz
```

## 📝 Example Usage

1. **Add Product**: http://localhost/products → "+ New Product" (admin)
2. **Load Data**: Run data ingestion workflow in N8N
3. **Customer Chat**: http://localhost/customer-chat → Start conversation with AI (customers)
4. **View Stats**: http://localhost/chat → Monitor conversations and analytics (admin)

### Customer Chat Interface Features

The customer chat interface (`http://localhost/customer-chat`) provides:

- **Real-time AI Chat**: Direct conversation with AI assistant powered by Google Gemini
- **Markdown Support**: Rich text formatting in AI responses
- **Session Management**: Automatic conversation ID tracking and persistence
- **Statistics Dashboard**: Real-time message count, token usage, and response time metrics
- **Export Functionality**: Download conversation history in JSON, TXT, or CSV formats
- **Customer Metadata**: Configure customer info, platform, category, and priority
- **Local Storage**: Conversations persist across page refreshes
- **Typing Indicators**: Visual feedback during AI response generation

The interface directly connects to the N8N webhook endpoint for real-time chat functionality.

## 🔄 Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose stop

# View logs
docker-compose logs -f [service]

# Remove everything
docker-compose down -v
```

## 🏢 Sample Brands

This project uses fictional brands for demonstration:

- **THERMOTECH**: Electric heaters and climate control
- **HEATFLOW**: Water-based heating systems
- **WARMLINE**: Panel heating solutions
- **BREWMASTER**: Coffee brewing equipment

All product names, brands, and specifications are purely fictional and do not represent any real companies or products.

## 👤 Author

**Your Name**

## 📄 License

MIT License

---

**🎉 Happy coding! Open an issue for questions.**
