# N8N Workflow Güncelleme Kılavuzu

## 🚀 Hızlı Çözüm (Önerilen) - 2 Dakika

N8N arayüzünden doğrudan düzenleme yaparak sorunu hemen çözebilirsiniz:

### Adımlar:

1. **N8N'e giriş yapın**
   - Tarayıcınızda `http://localhost:5678` adresine gidin
   - Kullanıcı adı: `admin`
   - Şifre: `n8n_admin_2024`

2. **Workflow'u açın**
   - "RAG Chat Endpoint - Customer Support" workflow'unu bulun ve açın

3. **Hatalı node'u düzeltin**
   - "Save User Message to PostgreSQL" node'una çift tıklayın
   - SQL sorgusunu bulun (Query alanı)
   - Aşağıdaki değişiklikleri yapın:

   **Eski (yanlış):**
   ```sql
   RETURNING conversation_id, message_count
   ```

   **Yeni (doğru):**
   ```sql
   RETURNING conversation_id, total_messages
   ```

   İki yerde değiştirin:
   - `SELECT conversation_id, message_count FROM...` → `SELECT conversation_id, total_messages FROM...`
   - `RETURNING conversation_id, message_count` → `RETURNING conversation_id, total_messages`

4. **İkinci düzeltmeyi yapın**
   - "Prepare Final Response" node'una çift tıklayın
   - JavaScript kodunda şu satırı bulun:

   **Eski:**
   ```javascript
   total_messages: userMsgResult.message_count + 2,
   ```

   **Yeni:**
   ```javascript
   total_messages: (userMsgResult.total_messages || 0) + 2,
   ```

5. **Kaydedin ve test edin**
   - Workflow'u kaydedin (Ctrl+S veya Save butonu)
   - "Execute Workflow" ile test edin

---

## 🔄 Alternatif Çözüm - Workflow'u Yeniden Import Etme

Eğer tüm workflow'u güncel haliyle yeniden yüklemek isterseniz:

### Adımlar:

1. **Eski workflow'u silin**
   - N8N UI'da "RAG Chat Endpoint - Customer Support" workflow'unu açın
   - Sağ üst köşedeki "..." menüsüne tıklayın
   - "Delete" seçeneğini seçin

2. **Yeni workflow'u import edin**
   - Ana sayfada "Import from File" butonuna tıklayın
   - `/home/user/customer_assistant_agent/n8n/workflows/02-chat-endpoint.json` dosyasını seçin
   - Import işlemini onaylayın

3. **Credentials'ları yapılandırın**
   - Gemini API credential'ını ekleyin/seçin
   - PostgreSQL credential'ını ekleyin/seçin

4. **Workflow'u aktifleştirin**
   - Sağ üst köşedeki "Active" toggle'ını açın

---

## ⚙️ Gelecek İçin - Otomatik Import (Advanced)

Container'ları her yeniden başlattığınızda workflow'ların otomatik güncellenmesini isterseniz:

### 1. Import Script Kullanımı

```bash
# Script'i çalıştırılabilir yapın
chmod +x scripts/import-n8n-workflows.sh

# Workflow'ları import edin
./scripts/import-n8n-workflows.sh
```

### 2. Docker Compose ile Otomatik Import

**NOT:** Bu yöntem N8N container'ını özelleştirmeyi gerektirir ve karmaşıktır.
Çoğu durumda yukarıdaki hızlı çözüm yeterlidir.

---

## 🐛 Sorun Giderme

### Hata: "column 'message_count' does not exist"

**Neden:** PostgreSQL veritabanında kolon adı `total_messages` iken, workflow `message_count` kullanıyor.

**Çözüm:** Yukarıdaki "Hızlı Çözüm" adımlarını takip edin.

### Workflow import edilemiyor

**Olası nedenler:**
- Aynı isimde workflow zaten var → Önce eski workflow'u silin
- JSON formatı hatalı → Dosyanın bozulmadığından emin olun
- N8N versiyonu uyumsuz → N8N'i güncelleyin

### API credentials çalışmıyor

**Kontrol edin:**
- Gemini API key'in geçerli olduğundan emin olun
- PostgreSQL bağlantı bilgilerinin doğru olduğunu kontrol edin
  - Host: `postgres`
  - Port: `5432`
  - Database: `chat_database`
  - User: `chat_user`
  - Password: `chat_password_2024`

---

## 📝 Notlar

- N8N workflow'ları kendi veritabanında saklar (`n8n_database`)
- JSON dosyaları sadece şablon/yedekleme amaçlıdır
- Dosyadaki değişiklikler otomatik olarak N8N'e yansımaz
- Manuel import veya API kullanarak güncelleme gereklidir

---

## ✅ Başarı Kontrolü

Workflow'un düzgün çalıştığını test etmek için:

```bash
# Test request gönder
curl -X POST http://localhost:5678/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "TEST_001",
    "customer_name": "Test User",
    "message": "Merhaba, test mesajı",
    "platform": "web"
  }'
```

Başarılı yanıt:
```json
{
  "success": true,
  "conversation_id": "uuid-here",
  "response": "AI response here",
  "metadata": {
    "total_messages": 2,
    ...
  }
}
```
