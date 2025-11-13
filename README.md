# 🤖 Customer Assistant Agent

Yapay zeka destekli müşteri destek sistemi. N8N workflow otomasyonu, RAG (Retrieval Augmented Generation) ve çoklu veritabanı mimarisi ile güçlendirilmiş tam kapsamlı bir çözüm.

## 🎯 Özellikler

### ✨ Ana Özellikler
- **RAG Sistemi**: Qdrant vector database ile semantik arama
- **Çoklu Veritabanı**: PostgreSQL (chat), MongoDB (ürünler), Qdrant (vektör)
- **N8N Workflow**: Otomatik veri yükleme ve chat endpoint'i
- **Dual Web UI**: Ürün yönetimi ve chat takip arayüzleri
- **Docker Compose**: Tek komutla tüm sistemi çalıştırma
- **AI Agent**: Google Gemini ile güçlendirilmiş yanıtlar
- **Analytics**: Gerçek zamanlı istatistikler ve sentiment analizi

### 📊 Veritabanları
1. **PostgreSQL**: Chat geçmişi, konuşmalar, analytics
2. **MongoDB**: Ürün kataloğu, markalar, hata kodları
3. **Qdrant**: Vector embeddings, semantik arama

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Docker 20.10+
- Docker Compose 2.0+
- 8GB+ RAM
- 10GB+ Disk alanı

### Kurulum

```bash
# 1. Setup script'ini çalıştırın
./setup.sh

# 2. Tarayıcıda açın
# http://localhost
```

## 🌐 Service URLs

Kurulum sonrası şu adreslere erişebilirsiniz:

- **Main Portal**: http://localhost
- **Product Management**: http://localhost/products
- **Chat Monitor**: http://localhost/chat
- **Backend API**: http://localhost:3000
- **N8N**: http://localhost:5678 (admin/n8n_admin_2024)
- **PostgreSQL**: localhost:5432 (chat_user/chat_password_2024)
- **MongoDB**: localhost:27017 (admin/mongo_password_2024)
- **Qdrant**: http://localhost:6333

## 📁 Proje Yapısı

```
customer_assistant_agent/
├── docker-compose.yml           # Ana Docker yapılandırması
├── setup.sh                     # Otomatik kurulum
├── database/                    # DB init dosyaları
│   ├── postgres/init.sql
│   └── mongodb/init-mongo.js
├── backend/                     # Express.js API
│   └── src/
│       ├── server.js
│       ├── config/
│       └── routes/
├── frontend/
│   ├── product-management/      # Ürün yönetimi UI
│   └── chat-monitor/            # Chat takip UI
├── n8n/workflows/               # N8N workflow dosyaları
└── nginx/nginx.conf             # Reverse proxy
```

## 🔧 N8N Workflows

### 1. Data Ingestion (MongoDB → Qdrant)

MongoDB'den ürün verilerini okuyup Qdrant'a yükler:

1. N8N UI'da `n8n/workflows/01-data-ingestion-mongodb.json` import edin
2. Credentials yapılandırın:
   - MongoDB: `mongodb://admin:mongo_password_2024@mongodb:27017/product_catalog?authSource=admin`
   - Google Gemini API: [API Key gerekli]
3. Execute Workflow ile çalıştırın

### 2. Chat Endpoint (Webhook)

Chat API endpoint'i sağlar:

1. `n8n/workflows/02-chat-endpoint.json` import edin
2. Webhook URL: `http://localhost:5678/webhook/chat`
3. Test:

```bash
curl -X POST http://localhost:5678/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test User",
    "message": "IVIGO ürünleri hakkında bilgi alabilir miyim?"
  }'
```

## 📊 API Endpoints

### Chat API
```
GET  /api/chat/conversations      # Tüm görüşmeler
GET  /api/chat/conversations/:id  # Detaylı görüşme
GET  /api/chat/messages           # Son mesajlar
GET  /api/chat/search?q=term      # Arama
```

### Product API
```
GET    /api/products              # Ürün listesi
POST   /api/products              # Yeni ürün
PUT    /api/products/:id          # Ürün güncelle
DELETE /api/products/:id          # Ürün sil

GET    /api/products/brands       # Markalar
POST   /api/products/brands       # Yeni marka

GET    /api/products/errors/codes # Hata kodları
```

### Analytics API
```
GET  /api/analytics/summary       # Özet istatistikler
GET  /api/analytics/daily?days=30 # Günlük veriler
GET  /api/analytics/trends        # Trend verileri
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
cd frontend/product-management  # veya chat-monitor
npm install
npm start
```

## 🐛 Troubleshooting

### Qdrant Collection Oluşturma

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

### Logs
```bash
# Tüm loglar
docker-compose logs -f

# Belirli servis
docker-compose logs -f backend
```

### Health Checks
```bash
curl http://localhost:3000/health
curl http://localhost:6333/healthz
```

## 📝 Örnek Kullanım

1. **Ürün Ekle**: http://localhost/products → "+ Yeni Ürün"
2. **Veri Yükle**: N8N'de data ingestion workflow'unu çalıştır
3. **Chat Test**: Webhook'a request gönder veya UI'dan test et
4. **İstatistikler**: http://localhost/chat → Dashboard

## 🔄 Komutlar

```bash
# Servisleri başlat
docker-compose up -d

# Servisleri durdur
docker-compose stop

# Logları izle
docker-compose logs -f [service]

# Tümünü sil
docker-compose down -v
```

## 👤 Author

**Emrullah Aydoğan**

## 📄 License

MIT License

---

**🎉 Başarılar! Sorularınız için issue açın.**
