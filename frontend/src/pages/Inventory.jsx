import { useState, useEffect } from 'react';
import { inventoryAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', pricePerDay: '', totalQuantity: '', itemValue: '' });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => { loadItems(); }, []);

  const loadItems = async (q = '') => {
    try {
      const res = await inventoryAPI.getAll(q);
      setItems(res.data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    loadItems(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.pricePerDay || !form.totalQuantity) {
      addToast('Please fill all required fields.', 'error');
      return;
    }
    setSaving(true);
    try {
      await inventoryAPI.create({
        name: form.name,
        category: form.category,
        pricePerDay: Number(form.pricePerDay),
        totalQuantity: Number(form.totalQuantity),
        itemValue: Number(form.itemValue) || 0,
      });
      addToast('Item added successfully!', 'success');
      setShowModal(false);
      setForm({ name: '', category: '', pricePerDay: '', totalQuantity: '', itemValue: '' });
      loadItems();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const getBadgeClass = (status) => {
    if (status === 'Out of Stock') return 'badge-out-of-stock';
    if (status === 'Low Stock') return 'badge-low-stock';
    return 'badge-in-stock';
  };

  if (loading) return <LoadingSpinner size="page" />;

  return (
    <div>
      <div className="page-header">
        <h1>Inventory</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="search-bar">
            <span className="material-symbols-outlined">search</span>
            <input placeholder="Search inventory..." value={search} onChange={handleSearch} />
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_box</span>
            Add Item
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Item Name</th><th>Category</th><th>Total Qty</th><th>Available</th><th>Price/Day</th><th>Item Value</th><th>Status</th></tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--outline)' }}>No inventory items found.</td></tr>
              ) : items.map(item => (
                <tr key={item._id}>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.totalQuantity}</td>
                  <td>{item.availableQuantity}</td>
                  <td>₹{item.pricePerDay}</td>
                  <td>₹{item.itemValue || 0}</td>
                  <td><span className={`badge ${getBadgeClass(item.status)}`}>{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Item</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Item Name *</label>
                <input className="form-input" placeholder="e.g., Wooden Balli (10ft)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option value="">Select Category</option>
                    <option value="Scaffolding">Scaffolding</option>
                    <option value="Shuttering">Shuttering</option>
                    <option value="Props">Props</option>
                    <option value="Channels">Channels</option>
                    <option value="Planks">Planks</option>
                    <option value="Cup Lock">Cup Lock</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity *</label>
                  <input className="form-input" type="number" min="1" value={form.totalQuantity} onChange={e => setForm({ ...form, totalQuantity: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price Per Day (₹) *</label>
                  <input className="form-input" type="number" min="0" step="0.5" placeholder="0.00" value={form.pricePerDay} onChange={e => setForm({ ...form, pricePerDay: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Item Value (₹)</label>
                  <input className="form-input" type="number" min="0" placeholder="Replacement cost" value={form.itemValue} onChange={e => setForm({ ...form, itemValue: e.target.value })} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="spinner spinner-sm" /> Saving...</> : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
