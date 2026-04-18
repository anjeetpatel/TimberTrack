import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rentalAPI, paymentAPI, returnAPI, whatsappAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

export default function RentalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { isOwner } = useAuth();
  const [rental, setRental] = useState(null);
  const [payments, setPayments] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: '', paymentMethod: 'CASH' });
  const [paying, setPaying] = useState(false);
  const [showPayConfirm, setShowPayConfirm] = useState(false);

  useEffect(() => { loadAll(); }, [id]);

  const loadAll = async () => {
    try {
      const [rRes, pRes, rtRes] = await Promise.all([
        rentalAPI.getById(id),
        paymentAPI.getByRental(id),
        returnAPI.getByRental(id),
      ]);
      setRental(rRes.data);
      setPayments(pRes.data);
      setReturns(rtRes.data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setShowPayConfirm(false);
    setPaying(true);
    try {
      await paymentAPI.record({
        rentalId: id,
        amount: Number(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
      });
      addToast('Payment recorded successfully! ✓', 'success');
      setShowPayment(false);
      setPaymentForm({ amount: '', paymentMethod: 'CASH' });
      loadAll();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setPaying(false);
    }
  };

  const handleWhatsApp = async (type) => {
    try {
      let res;
      if (type === 'rental') res = await whatsappAPI.rentalMessage(id);
      else if (type === 'return') res = await whatsappAPI.returnMessage(id);
      else res = await whatsappAPI.reminderMessage(id);
      window.open(res.data.link, '_blank');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) return <LoadingSpinner size="page" />;
  if (!rental) return <div className="page-body"><p>Rental not found.</p></div>;

  const dueAmount = Math.max(0, rental.totalAmount - rental.amountPaid);

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-icon btn-secondary" onClick={() => navigate('/rentals')}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 style={{ fontSize: '1.3rem' }}>Rental — {rental.customerId?.name}</h1>
            <span style={{ fontSize: '0.8rem', color: 'var(--outline)' }}>ID: {rental._id}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-whatsapp btn-sm" onClick={() => handleWhatsApp(rental.status === 'COMPLETED' ? 'return' : 'rental')}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chat</span>
            WhatsApp
          </button>
          {isOwner() && dueAmount > 0 && (
            <button className="btn btn-whatsapp btn-sm" onClick={() => handleWhatsApp('reminder')}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>notifications</span>
              Reminder
            </button>
          )}
          {rental.status === 'ACTIVE' && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/rentals/${id}/return`)}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>assignment_returned</span>
              Return Items
            </button>
          )}
        </div>
      </div>

      <div className="page-body">
        <div className="detail-grid">
          <div>
            {/* Rental Info */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px' }}>Rental Information</h3>
              <div className="detail-row">
                <span className="detail-label">Customer</span>
                <span className="detail-value">{rental.customerId?.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone</span>
                <span className="detail-value">{rental.customerId?.phone}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Start Date</span>
                <span className="detail-value">{new Date(rental.startDate).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Days Active</span>
                <span className={`detail-value ${rental.isOverdue ? 'overdue' : ''}`}>
                  {rental.currentDays} days {rental.isOverdue && '⚠️ OVERDUE'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className={`badge badge-${rental.status.toLowerCase()}`}>{rental.status}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="card">
              <h3 style={{ marginBottom: '16px' }}>Rented Items</h3>
              <div className="table-container" style={{ boxShadow: 'none' }}>
                <table>
                  <thead><tr><th>Item</th><th>Issued</th><th>Returned</th><th>Remaining</th><th>Rate/Day</th></tr></thead>
                  <tbody>
                    {rental.items?.map((item, idx) => {
                      const remaining = item.issuedQty - item.returnedQty;
                      return (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{item.itemName}</td>
                          <td>{item.issuedQty}</td>
                          <td>{item.returnedQty}</td>
                          <td style={{ color: remaining > 0 ? 'var(--error)' : 'var(--outline)' }}>{remaining}</td>
                          <td>₹{item.pricePerDay}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Financial Summary */}
          <div>
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px' }}>Financial Summary</h3>
              <div className="detail-row">
                <span className="detail-label">Total Amount</span>
                <span className="detail-value amount">₹{(rental.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              {rental.status === 'ACTIVE' && rental.runningCost > 0 && (
                <div className="detail-row">
                  <span className="detail-label">Running Cost (Est.)</span>
                  <span className="detail-value amount" style={{ color: 'var(--tertiary)' }}>+ ₹{rental.runningCost.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Amount Paid</span>
                <span className="detail-value amount" style={{ color: '#2e7d32' }}>₹{(rental.amountPaid || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="detail-row" style={{ background: dueAmount > 0 ? 'var(--error-container)' : '#e8f5e9', padding: '12px', borderRadius: 'var(--radius-sm)', margin: '8px 0' }}>
                <span className="detail-label" style={{ fontWeight: 700 }}>Balance Due</span>
                <span className="detail-value amount" style={{ color: dueAmount > 0 ? 'var(--error)' : '#2e7d32', fontSize: '1.3rem' }}>₹{dueAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Payment Status</span>
                <span className={`badge badge-${rental.paymentStatus?.toLowerCase()}`}>{rental.paymentStatus}</span>
              </div>

              {dueAmount > 0 && isOwner() && (
                <button className="btn btn-success" style={{ width: '100%', marginTop: '16px' }} onClick={() => setShowPayment(true)}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>payments</span>
                  Record Payment
                </button>
              )}
              {dueAmount > 0 && !isOwner() && (
                <div style={{ marginTop: '16px', padding: '12px', background: 'var(--surface-variant)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--on-surface-variant)', textAlign: 'center' }}>
                  <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', fontSize: '16px', marginRight: '4px' }}>info</span>
                  Payments can only be recorded by the account owner.
                </div>
              )}
            </div>

            {/* Return History */}
            {returns.length > 0 && (
              <div className="card" style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '16px' }}>Return History</h3>
                {returns.map((rt, idx) => (
                  <div key={idx} style={{ padding: '12px 0', borderBottom: idx < returns.length - 1 ? '1px solid var(--surface-container)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600 }}>{new Date(rt.returnDate).toLocaleDateString('en-IN')}</span>
                      <span style={{ fontWeight: 600 }}>₹{rt.finalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--outline)' }}>
                      {rt.returnedItems.map(ri => `${ri.quantityReturned} items (${ri.daysCharged}d)`).join(', ')}
                      {rt.damageCharges > 0 && ` + ₹${rt.damageCharges} damage`}
                      {rt.lostCharges > 0 && ` + ₹${rt.lostCharges} lost`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Payment History */}
            {payments.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: '16px' }}>Payment History</h3>
                {payments.map((p, idx) => (
                  <div key={idx} style={{ padding: '12px 0', borderBottom: idx < payments.length - 1 ? '1px solid var(--surface-container)' : 'none', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>₹{p.amount.toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--outline)' }}>{p.paymentMethod}</div>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--outline)' }}>{new Date(p.paymentDate).toLocaleDateString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="modal-overlay" onClick={() => setShowPayment(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Record Payment</h3>
              <button className="modal-close" onClick={() => setShowPayment(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '20px' }}>
              Amount Due: <strong style={{ color: 'var(--error)' }}>₹{dueAmount.toLocaleString('en-IN')}</strong>
            </p>
            <div className="form-group">
              <label>Payment Amount (₹) *</label>
              <input className="form-input" type="number" min="1" max={dueAmount} placeholder={`Max ₹${dueAmount}`} value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Payment Method *</label>
              <select className="form-select" value={paymentForm.paymentMethod} onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowPayment(false)}>Cancel</button>
              <button className="btn btn-success" disabled={paying || !paymentForm.amount} onClick={() => setShowPayConfirm(true)}>
                {paying ? <><div className="spinner spinner-sm" /> Processing...</> : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPayConfirm && (
        <ConfirmDialog
          title="Confirm Payment"
          message={`Record payment of ₹${Number(paymentForm.amount).toLocaleString('en-IN')} via ${paymentForm.paymentMethod}?`}
          confirmText="Record Payment"
          icon="payments"
          onConfirm={handlePayment}
          onCancel={() => setShowPayConfirm(false)}
        />
      )}
    </div>
  );
}
