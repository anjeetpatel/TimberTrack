import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, exportAPI, downloadBlob } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await dashboardAPI.getStats();
      setStats(res.data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      const blob = type === 'rentals' ? await exportAPI.downloadRentals() : await exportAPI.downloadPayments();
      downloadBlob(blob, `timbertrack_${type}.csv`);
      addToast('Report downloaded!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) return <LoadingSpinner size="page" />;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline btn-sm" onClick={() => handleExport('rentals')}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
            Rentals Report
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => handleExport('payments')}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
            Payments Report
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/inventory')}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_box</span>
            Add Inventory
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="stats-grid">
          <div className="card stat-card">
            <div className="stat-icon blue"><span className="material-symbols-outlined">receipt_long</span></div>
            <div className="stat-info">
              <h4>Active Rentals</h4>
              <div className="stat-value">{stats?.activeRentals || 0}</div>
            </div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon red"><span className="material-symbols-outlined">warning</span></div>
            <div className="stat-info">
              <h4>Overdue Rentals</h4>
              <div className="stat-value">{stats?.overdueRentals || 0}</div>
            </div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon green"><span className="material-symbols-outlined">payments</span></div>
            <div className="stat-info">
              <h4>Total Revenue</h4>
              <div className="stat-value">₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}</div>
            </div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon orange"><span className="material-symbols-outlined">pending_actions</span></div>
            <div className="stat-info">
              <h4>Pending Payments</h4>
              <div className="stat-value">₹{(stats?.pendingPayments || 0).toLocaleString('en-IN')}</div>
            </div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon purple"><span className="material-symbols-outlined">inventory_2</span></div>
            <div className="stat-info">
              <h4>Items Out</h4>
              <div className="stat-value">{stats?.totalItemsOut || 0}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Recent Active Rentals</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/rentals')}>
              View All <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
            </button>
          </div>
          {stats?.recentRentals?.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Customer</th><th>Items</th><th>Out Date</th><th>Days</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {stats.recentRentals.map(r => (
                    <tr key={r._id} className={r.isOverdue ? 'overdue' : ''}>
                      <td style={{ fontWeight: 600 }}>{r.customerId?.name || 'N/A'}</td>
                      <td>{r.itemsOut} of {r.totalItems}</td>
                      <td>{new Date(r.startDate).toLocaleDateString('en-IN')}</td>
                      <td>{r.currentDays}d</td>
                      <td>
                        {r.isOverdue && <span className="badge badge-overdue">Overdue</span>}
                        {!r.isOverdue && <span className="badge badge-active">Active</span>}
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/rentals/${r._id}`)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <span className="material-symbols-outlined">receipt_long</span>
              <h3>No Active Rentals</h3>
              <p>Create your first rental to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
