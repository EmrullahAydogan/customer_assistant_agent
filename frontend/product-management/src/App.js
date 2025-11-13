import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './styles/App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Products Page
function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    brandId: '', categoryId: '', modelCode: '', name: '',
    description: '', productType: '', powerWatt: '', price: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, brandsRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/products/brands`),
        fetch(`${API_URL}/products/categories`)
      ]);
      const productsData = await productsRes.json();
      const brandsData = await brandsRes.json();
      const categoriesData = await categoriesRes.json();
      setProducts(productsData.data || []);
      setBrands(brandsData.data || []);
      setCategories(categoriesData.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setShowForm(false);
      fetchData();
      setFormData({ brandId: '', categoryId: '', modelCode: '', name: '',
        description: '', productType: '', powerWatt: '', price: '' });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      try {
        await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
        fetchData();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  if (loading) return <div className="loading">Yükleniyor...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Ürün Yönetimi</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'İptal' : '+ Yeni Ürün'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-row">
            <div className="form-group">
              <label>Marka *</label>
              <select required value={formData.brandId} onChange={(e) => setFormData({...formData, brandId: e.target.value})}>
                <option value="">Seçiniz</option>
                {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Kategori *</label>
              <select required value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})}>
                <option value="">Seçiniz</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Model Kodu *</label>
              <input required type="text" value={formData.modelCode} onChange={(e) => setFormData({...formData, modelCode: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Ürün Adı *</label>
              <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label>Açıklama</label>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3"></textarea>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Ürün Tipi</label>
              <input type="text" value={formData.productType} onChange={(e) => setFormData({...formData, productType: e.target.value})} placeholder="Manuel, Dijital, WiFi..." />
            </div>
            <div className="form-group">
              <label>Güç (W)</label>
              <input type="number" value={formData.powerWatt} onChange={(e) => setFormData({...formData, powerWatt: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Fiyat (TRY)</label>
              <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="btn-primary">Kaydet</button>
        </form>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Model Kodu</th>
              <th>Ürün Adı</th>
              <th>Marka</th>
              <th>Kategori</th>
              <th>Tip</th>
              <th>Güç</th>
              <th>Fiyat</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id}>
                <td>{p.modelCode}</td>
                <td>{p.name}</td>
                <td>{p.brandName}</td>
                <td>{p.categoryName}</td>
                <td>{p.productType}</td>
                <td>{p.powerWatt}W</td>
                <td>{p.price} TRY</td>
                <td>
                  <button onClick={() => handleDelete(p._id)} className="btn-danger btn-sm">Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Brands & Categories Management
function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [newBrand, setNewBrand] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    const res = await fetch(`${API_URL}/products/brands`);
    const data = await res.json();
    setBrands(data.data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/products/brands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBrand)
    });
    setNewBrand({ name: '', description: '' });
    fetchBrands();
  };

  return (
    <div className="page">
      <h2>Marka Yönetimi</h2>
      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-group">
          <label>Marka Adı *</label>
          <input required type="text" value={newBrand.name} onChange={(e) => setNewBrand({...newBrand, name: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Açıklama</label>
          <input type="text" value={newBrand.description} onChange={(e) => setNewBrand({...newBrand, description: e.target.value})} />
        </div>
        <button type="submit" className="btn-primary">Ekle</button>
      </form>
      <div className="card-grid">
        {brands.map(b => (
          <div key={b._id} className="card">
            <h3>{b.name}</h3>
            <p>{b.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Error Codes Management
function ErrorCodesPage() {
  const [errorCodes, setErrorCodes] = useState([]);

  useEffect(() => {
    fetchErrorCodes();
  }, []);

  const fetchErrorCodes = async () => {
    const res = await fetch(`${API_URL}/products/errors/codes`);
    const data = await res.json();
    setErrorCodes(data.data || []);
  };

  return (
    <div className="page">
      <h2>Hata Kodları</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Hata Kodu</th>
              <th>Ad</th>
              <th>Açıklama</th>
              <th>Önem</th>
              <th>Tip</th>
            </tr>
          </thead>
          <tbody>
            {errorCodes.map(e => (
              <tr key={e._id}>
                <td><strong>{e.errorCode}</strong></td>
                <td>{e.errorName}</td>
                <td>{e.description}</td>
                <td><span className={`badge badge-${e.severity.toLowerCase()}`}>{e.severity}</span></td>
                <td>{e.errorType}</td>
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
          <h1>Ürün Yönetimi</h1>
          <ul>
            <li><Link to="/">Ürünler</Link></li>
            <li><Link to="/brands">Markalar</Link></li>
            <li><Link to="/error-codes">Hata Kodları</Link></li>
          </ul>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ProductsPage />} />
            <Route path="/brands" element={<BrandsPage />} />
            <Route path="/error-codes" element={<ErrorCodesPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
