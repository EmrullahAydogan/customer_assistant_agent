import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './styles/App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Dashboard Page
function DashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_URL}/analytics/summary`);
      const data = await res.json();
      setAnalytics(data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Yükleniyor...</div>;
  if (!analytics) return <div className="loading">Veri yüklenemedi</div>;

  return (
    <div className="page">
      <h2>Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{analytics.totalConversations}</div>
          <div className="stat-label">Toplam Görüşme</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{analytics.activeConversations}</div>
          <div className="stat-label">Aktif Görüşme</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{analytics.totalMessages}</div>
          <div className="stat-label">Toplam Mesaj</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{analytics.avgSatisfactionScore}/5</div>
          <div className="stat-label">Ortalama Memnuniyet</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{analytics.avgResponseTime}s</div>
          <div className="stat-label">Ortalama Yanıt Süresi</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{analytics.tokensUsedToday}</div>
          <div className="stat-label">Bugün Kullanılan Token</div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-card">
          <h3>Duygu Analizi</h3>
          <div className="sentiment-list">
            {analytics.sentimentDistribution.map(s => (
              <div key={s.sentiment} className="sentiment-item">
                <span className={`sentiment-badge sentiment-${s.sentiment}`}>
                  {s.sentiment === 'positive' ? 'Pozitif' : s.sentiment === 'negative' ? 'Negatif' : 'Nötr'}
                </span>
                <span className="sentiment-count">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Platform Dağılımı</h3>
          <div className="platform-list">
            {analytics.platformDistribution.map(p => (
              <div key={p.platform} className="platform-item">
                <span>{p.platform}</span>
                <span className="platform-count">{p.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Kategori Dağılımı</h3>
          <div className="category-list">
            {analytics.categoryDistribution.slice(0, 5).map(c => (
              <div key={c.category} className="category-item">
                <span>{c.category}</span>
                <span className="category-count">{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Conversations Page
function ConversationsPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', platform: '' });

  useEffect(() => {
    fetchConversations();
  }, [filter]);

  const fetchConversations = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.platform) params.append('platform', filter.platform);

      const res = await fetch(`${API_URL}/chat/conversations?${params}`);
      const data = await res.json();
      setConversations(data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Yükleniyor...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Görüşmeler</h2>
        <div className="filters">
          <select value={filter.status} onChange={(e) => setFilter({...filter, status: e.target.value})}>
            <option value="">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="completed">Tamamlanmış</option>
          </select>
          <select value={filter.platform} onChange={(e) => setFilter({...filter, platform: e.target.value})}>
            <option value="">Tüm Platformlar</option>
            <option value="web">Web</option>
            <option value="mobile">Mobil</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Müşteri</th>
              <th>Platform</th>
              <th>Kategori</th>
              <th>Durum</th>
              <th>Duygu</th>
              <th>Mesaj</th>
              <th>Memnuniyet</th>
              <th>Tarih</th>
            </tr>
          </thead>
          <tbody>
            {conversations.map(c => (
              <tr key={c.conversation_id}>
                <td><strong>{c.customer_name}</strong></td>
                <td>{c.platform}</td>
                <td>{c.category}</td>
                <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                <td><span className={`sentiment-badge sentiment-${c.sentiment}`}>{c.sentiment}</span></td>
                <td>{c.total_messages}</td>
                <td>{c.satisfaction_score ? `${c.satisfaction_score}/5` : '-'}</td>
                <td>{new Date(c.start_time).toLocaleString('tr-TR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Main App
function App() {
  return (
    <Router>
      <div className="app">
        <nav className="sidebar">
          <h1>Chat Monitor</h1>
          <ul>
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/conversations">Görüşmeler</Link></li>
          </ul>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/conversations" element={<ConversationsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
