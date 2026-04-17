import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rentalAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import { useToast } from '../components/Toast';

export default function Rentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ACTIVE');
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => { loadRentals(); }, [tab, filter, page]);

  const loadRentals = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, status: tab };
      if (filter) params.filter = filter;
      if (search) params.search = search;
      const res = await rentalAPI.getAll(params);
      setRentals(res.data);
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
    setTimeout(() => loadRentals(), 300);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Rentals</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="search-bar">
            <span className="material-symbols-outlined">search</span>
            <input placeholder="Search customer or ID..." value={search} onChange={handleSearch} />
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/rentals/new')}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            New Rental
          </button>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div className="tabs">
            <button className={`tab ${tab === 'ACTIVE' ? 'active' : ''}`} onClick={() => { setTab('ACTIVE'); setFilter(''); setPage(1); }}>Active Rentals</button>
            <button className={`tab ${tab === 'COMPLETED' ? 'active' : ''}`} onClick={() => { setTab('COMPLETED'); setFilter(''); setPage(1); }}>Completed</button>
          </div>
          {tab === 'ACTIVE' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className={`btn btn-sm ${filter === 'overdue' ? 'btn-danger' : 'btn-outline'}`} onClick={() => { setFilter(filter === 'overdue' ? '' : 'overdue'); setPage(1); }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span> Overdue
              </button>
              <button className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setFilter(filter === 'pending' ? '' : 'pending'); setPage(1); }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>pending_actions</span> Pending Payment
              </button>
            </div>
          )}
        </div>

        {loading ? <LoadingSpinner size="page" /> : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Customer Info</th><th>Items Out</th><th>Timeline</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {rentals.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--outline)' }}>No rentals found.</td></tr>
                  ) : rentals.map(r => {
                    const totalItems = r.items?.reduce((s, i) => s + i.issuedQty, 0) || 0;
                    const itemsOut = r.items?.reduce((s, i) => s + (i.issuedQty - i.returnedQty), 0) || 0;
                    return (
                      <tr key={r._id} className={r.isOverdue ? 'overdue' : ''}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{r.customerId?.name || 'N/A'}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--outline)' }}>{r.customerId?.phone}</div>
                        </td>
                        <td>{itemsOut} / {totalItems}</td>
                        <td>
                          <div>{new Date(r.startDate).toLocaleDateString('en-IN')}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--outline)' }}>{r.currentDays}d ago</div>
                        </td>
                        <td>
                          <div>₹{(r.totalAmount || 0).toLocaleString('en-IN')}</div>
                          {r.remainingBalance > 0 && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--error)' }}>Due: ₹{r.remainingBalance.toLocaleString('en-IN')}</div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {r.isOverdue && <span className="badge badge-overdue">Overdue</span>}
                            {!r.isOverdue && r.status === 'ACTIVE' && <span className="badge badge-active">Active</span>}
                            {r.status === 'COMPLETED' && <span className="badge badge-completed">Completed</span>}
                            <span className={`badge badge-${r.paymentStatus?.toLowerCase()}`}>{r.paymentStatus}</span>
                          </div>
                        </td>
                        <td>
                          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/rentals/${r._id}`)}>
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
