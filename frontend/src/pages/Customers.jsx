import { useState, useEffect } from 'react';
import { customerAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import { useToast } from '../components/Toast';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => { loadCustomers(); }, [page]);

  const loadCustomers = async (q = search) => {
    try {
      const res = await customerAPI.getAll({ search: q, page, limit: 20 });
      setCustomers(res.data);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
    loadCustomers(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      addToast('Name and phone are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      await customerAPI.create(form);
      addToast('Customer added successfully!', 'success');
      setShowModal(false);
      setForm({ name: '', phone: '', email: '' });
      loadCustomers();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner size="page" />;

  return (
    <div>
      <div className="page-header">
        <h1>Customers</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="search-bar">
            <span className="material-symbols-outlined">search</span>
            <input placeholder="Search customers..." value={search} onChange={handleSearch} />
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            Add Customer
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Name</th><th>Phone</th><th>Email</th><th>Joined</th></tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '48px', color: 'var(--outline)' }}>No customers found.</td></tr>
              ) : customers.map(c => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>{c.phone}</td>
                  <td>{c.email || '—'}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Customer</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Customer Name *</label>
                <input className="form-input" placeholder="e.g., Elias Woodworks" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input className="form-input" type="tel" placeholder="(555) 000-0000" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input className="form-input" type="email" placeholder="Optional" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="spinner spinner-sm" /> Saving...</> : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
