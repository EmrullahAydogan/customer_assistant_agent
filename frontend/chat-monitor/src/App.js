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

  if (loading) return <div className="loading">Loading...</div>;
  if (!analytics) return <div className="loading">Failed to load data</div>;

  return (
    <div className="page">
      <h2>Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{analytics.totalConversations}</div>
          <div className="stat-label">Total Conversations</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{analytics.activeConversations}</div>
          <div className="stat-label">Active Conversations</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{analytics.totalMessages}</div>
          <div className="stat-label">Total Messages</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{analytics.avgSatisfactionScore}/5</div>
          <div className="stat-label">Avg Satisfaction</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{analytics.avgResponseTime}s</div>
          <div className="stat-label">Avg Response Time</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{analytics.tokensUsedToday}</div>
          <div className="stat-label">Tokens Used Today</div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-card">
          <h3>Sentiment Analysis</h3>
          <div className="sentiment-list">
            {analytics.sentimentDistribution.map(s => (
              <div key={s.sentiment} className="sentiment-item">
                <span className={`sentiment-badge sentiment-${s.sentiment}`}>
                  {s.sentiment === 'positive' ? 'Positive' : s.sentiment === 'negative' ? 'Negative' : 'Neutral'}
                </span>
                <span className="sentiment-count">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Platform Distribution</h3>
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
          <h3>Category Distribution</h3>
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

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Conversations</h2>
        <div className="filters">
          <select value={filter.status} onChange={(e) => setFilter({...filter, status: e.target.value})}>
            <option value="">Tüm Statuslar</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <select value={filter.platform} onChange={(e) => setFilter({...filter, platform: e.target.value})}>
            <option value="">All Platforms</option>
            <option value="web">Web</option>
            <option value="mobile">Mobile</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Platform</th>
              <th>Kategori</th>
              <th>Status</th>
              <th>Sentiment</th>
              <th>Messages</th>
              <th>Satisfaction</th>
              <th>Date</th>
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
            <li><Link to="/conversations">Conversations</Link></li>
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
