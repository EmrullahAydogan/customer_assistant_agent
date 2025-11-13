# 🤖 Customer Assistant Agent

AI-powered customer support system with N8N workflow automation, RAG (Retrieval Augmented Generation), and multi-database architecture.

## 🎯 Features

### ✨ Key Features
- **RAG System**: Semantic search with Qdrant vector database
- **Multi-Database**: PostgreSQL (chat), MongoDB (products), Qdrant (vectors)
- **N8N Workflows**: Automated data ingestion and chat endpoint
- **Dual Web UI**: Product management and chat monitoring dashboards
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
- **Product Management**: http://localhost/products
- **Chat Monitor**: http://localhost/chat
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
│   ├── product-management/      # Product management UI
│   └── chat-monitor/            # Chat monitoring UI
├── n8n/workflows/               # N8N workflow files
└── nginx/nginx.conf             # Reverse proxy config
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

1. **Add Product**: http://localhost/products → "+ New Product"
2. **Load Data**: Run data ingestion workflow in N8N
3. **Test Chat**: Send request to webhook or test via UI
4. **View Stats**: http://localhost/chat → Dashboard

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
