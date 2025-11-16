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

### 💻 Platform-Specific Installation

<details>
<summary><b>🪟 Windows Installation</b></summary>

#### Prerequisites

1. **Install Docker Desktop for Windows**
   - Download from: https://www.docker.com/products/docker-desktop
   - Minimum: Windows 10 64-bit (Pro, Enterprise, or Education)
   - WSL2 backend is recommended for better performance

2. **Enable WSL2 (Recommended)**
   ```powershell
   # Run in PowerShell as Administrator
   wsl --install
   wsl --set-default-version 2
   ```

3. **Install Git for Windows** (if not already installed)
   - Download from: https://git-scm.com/download/win

#### Installation Steps

**Option 1: Using Git Bash (Recommended)**
```bash
# Clone the repository
git clone https://github.com/EmrullahAydogan/customer_assistant_agent.git
cd customer_assistant_agent

# Run setup script
./setup.sh

# Open in browser
start http://localhost/customer-chat
```

**Option 2: Using PowerShell**
```powershell
# Clone the repository
git clone https://github.com/EmrullahAydogan/customer_assistant_agent.git
cd customer_assistant_agent

# Start all services
docker-compose up -d --build

# Wait for services to be ready (30-60 seconds)
docker-compose ps

# Open in browser
Start-Process "http://localhost/customer-chat"
```

#### Verify Installation
```powershell
# Check all containers are running
docker-compose ps

# Should show 9 containers running
```

#### Troubleshooting Windows

- **Port conflicts**: If port 80 is in use, stop IIS or other web servers
- **WSL2 memory**: Limit Docker memory in Docker Desktop settings
- **Slow performance**: Enable WSL2 backend in Docker Desktop settings
- **Permission issues**: Run Docker Desktop as Administrator

</details>

<details>
<summary><b>🐧 Linux (Ubuntu/Debian) Installation</b></summary>

#### Prerequisites

1. **Install Docker Engine**
   ```bash
   # Update package index
   sudo apt-get update

   # Install dependencies
   sudo apt-get install -y \
       ca-certificates \
       curl \
       gnupg \
       lsb-release

   # Add Docker's official GPG key
   sudo mkdir -p /etc/apt/keyrings
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
       sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

   # Set up repository
   echo \
     "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
     https://download.docker.com/linux/ubuntu \
     $(lsb_release -cs) stable" | \
     sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

   # Install Docker
   sudo apt-get update
   sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
   ```

2. **Install Docker Compose**
   ```bash
   # Docker Compose is included with docker-compose-plugin
   # Or install standalone version:
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
       -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Add user to docker group (optional)**
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   # Log out and log back in for this to take effect
   ```

#### Installation Steps

```bash
# Clone the repository
git clone https://github.com/EmrullahAydogan/customer_assistant_agent.git
cd customer_assistant_agent

# Make setup script executable
chmod +x setup.sh

# Run setup script
./setup.sh

# Open in browser
xdg-open http://localhost/customer-chat
```

#### Verify Installation
```bash
# Check Docker is running
sudo systemctl status docker

# Check all containers
docker-compose ps

# Should show 9 containers running
```

#### Troubleshooting Linux

- **Permission denied**: Add user to docker group or use `sudo`
- **Port conflicts**: Check with `sudo netstat -tulpn | grep :80`
- **Firewall issues**: Allow ports 80, 3000, 5678, 5432, 27017, 6333
  ```bash
  sudo ufw allow 80/tcp
  sudo ufw allow 5678/tcp
  ```

</details>

<details>
<summary><b>🍎 macOS Installation</b></summary>

#### Prerequisites

1. **Install Docker Desktop for Mac**
   - Download from: https://www.docker.com/products/docker-desktop
   - Minimum: macOS 10.15 or newer
   - For M1/M2 Macs: Use Apple Silicon version

2. **Install Homebrew** (optional, for easier management)
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

3. **Install Git** (if not already installed)
   ```bash
   # Using Homebrew
   brew install git

   # Or download from
   # https://git-scm.com/download/mac
   ```

#### Installation Steps

```bash
# Clone the repository
git clone https://github.com/EmrullahAydogan/customer_assistant_agent.git
cd customer_assistant_agent

# Make setup script executable
chmod +x setup.sh

# Run setup script
./setup.sh

# Open in browser
open http://localhost/customer-chat
```

#### Verify Installation
```bash
# Check all containers are running
docker-compose ps

# Should show 9 containers running
```

#### Troubleshooting macOS

- **Docker not starting**: Check Docker Desktop is running in menu bar
- **Port conflicts**: Stop other services using port 80
  ```bash
  sudo lsof -i :80
  ```
- **M1/M2 performance**: Enable "Use Rosetta for x86/amd64 emulation" in Docker Desktop settings
- **Resource limits**: Increase Docker memory/CPU in Docker Desktop preferences

</details>

### 🚀 Quick Start (All Platforms)

After Docker is installed, these commands work on all platforms:

```bash
# 1. Clone repository
git clone https://github.com/EmrullahAydogan/customer_assistant_agent.git
cd customer_assistant_agent

# 2. Start all services
docker-compose up -d --build

# 3. Wait for services (30-60 seconds)
docker-compose ps

# 4. Open in browser
# http://localhost/customer-chat
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
      "size": 3072,
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

### 📊 Platform Comparison

| Feature | Windows | Linux | macOS |
|---------|---------|-------|-------|
| **Docker Type** | Docker Desktop | Docker Engine | Docker Desktop |
| **Performance** | Good (with WSL2) | Excellent | Good (M1/M2: Excellent) |
| **Setup Complexity** | Medium | Easy | Easy |
| **Resource Usage** | Higher | Lower | Medium |
| **Native Support** | Via WSL2 | Native | Via VM |
| **Recommended For** | Development | Production | Development |

### 🔍 Common Issues (All Platforms)

#### Services Not Starting

```bash
# Check Docker is running
docker --version
docker-compose --version

# Check service status
docker-compose ps

# View logs for errors
docker-compose logs -f

# Restart all services
docker-compose restart
```

#### Port Conflicts

**Check which process is using a port:**

```bash
# Windows (PowerShell)
netstat -ano | findstr :80

# Linux/macOS
sudo lsof -i :80
# or
sudo netstat -tulpn | grep :80
```

**Common port conflicts:**
- Port 80: IIS, Apache, Nginx (stop other web servers)
- Port 5432: Other PostgreSQL instances
- Port 27017: Other MongoDB instances
- Port 5678: Other N8N instances

#### Memory Issues

```bash
# Check container resource usage
docker stats

# Clean up unused resources
docker system prune -a --volumes

# Increase Docker memory limit:
# - Windows/macOS: Docker Desktop → Settings → Resources
# - Linux: Edit /etc/docker/daemon.json
```

#### Network Issues

```bash
# Recreate network
docker-compose down
docker network prune
docker-compose up -d

# Check network connectivity
docker-compose exec backend ping postgres
docker-compose exec backend ping mongodb
```

### Create Qdrant Collection

```bash
curl -X PUT http://localhost:6333/collections/rag_docs_gemini_3072_metadata \
  -H "Content-Type: application/json" \
  -d '{
    "vectors": {
      "size": 3072,
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

**Emrullah AYDOGAN**

## 📄 License

MIT License

---

**🎉 Happy coding! Open an issue for questions.**
