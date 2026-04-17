import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rentalAPI, returnAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';

export default function ReturnItems() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [returnQtys, setReturnQtys] = useState({});
  const [damageCharges, setDamageCharges] = useState('');
  const [notes, setNotes] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    rentalAPI.getById(id)
      .then(res => {
        setRental(res.data);
        // Initialize return quantities to 0
        const qtys = {};
        res.data.items?.forEach(item => {
          qtys[item.itemId] = 0;
        });
        setReturnQtys(qtys);
      })
      .catch(err => addToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  const updateReturnQty = (itemId, maxRemaining, value) => {
    const qty = Math.max(0, Math.min(parseInt(value) || 0, maxRemaining));
    setReturnQtys({ ...returnQtys, [itemId]: qty });
  };

  const hasItemsToReturn = Object.values(returnQtys).some(q => q > 0);

  const handleSubmit = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    try {
      const returnedItems = Object.entries(returnQtys)
        .filter(([_, qty]) => qty > 0)
        .map(([itemId, qty]) => ({ itemId, quantityReturned: qty }));

      await returnAPI.process({
        rentalId: id,
        returnedItems,
        damageCharges: Number(damageCharges) || 0,
      });

      addToast('Return processed successfully! ✓', 'success');
      navigate(`/rentals/${id}`);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner size="page" />;
  if (!rental) return <div className="page-body"><p>Rental not found.</p></div>;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-icon btn-secondary" onClick={() => navigate(`/rentals/${id}`)}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 style={{ fontSize: '1.3rem' }}>Return Items</h1>
            <span style={{ fontSize: '0.8rem', color: 'var(--outline)' }}>Rental: {rental.customerId?.name}</span>
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="detail-grid">
          <div>
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Select Items to Return</h3>

              {rental.items?.map((item, idx) => {
                const remaining = item.issuedQty - item.returnedQty;
                if (remaining <= 0) return null;

                return (
                  <div key={idx} style={{ padding: '20px', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>{item.itemName}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--outline)', marginTop: '4px' }}>
                          ₹{item.pricePerDay}/day • Issued: {item.issuedQty} • Returned: {item.returnedQty}
                        </div>
                      </div>
                      <span className="badge badge-active" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                        {remaining} remaining
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontFamily: 'var(--font-label)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Return Qty:</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button className="btn btn-icon btn-secondary btn-sm" onClick={() => updateReturnQty(item.itemId, remaining, (returnQtys[item.itemId] || 0) - 1)}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>remove</span>
                        </button>
                        <input
                          type="number"
                          min="0"
                          max={remaining}
                          value={returnQtys[item.itemId] || 0}
                          onChange={e => updateReturnQty(item.itemId, remaining, e.target.value)}
                          style={{ width: '60px', textAlign: 'center', padding: '8px', border: '1.5px solid var(--outline-variant)', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '1rem' }}
                        />
                        <button className="btn btn-icon btn-secondary btn-sm" onClick={() => updateReturnQty(item.itemId, remaining, (returnQtys[item.itemId] || 0) + 1)}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={() => updateReturnQty(item.itemId, remaining, remaining)}>
                          All
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {rental.items?.every(i => i.issuedQty - i.returnedQty <= 0) && (
                <div className="empty-state">
                  <span className="material-symbols-outlined">check_circle</span>
                  <h3>All Items Returned</h3>
                  <p>This rental has no remaining items to return.</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Additional Charges</h3>

              <div className="form-group">
                <label>Damage Charges (₹)</label>
                <input className="form-input" type="number" min="0" placeholder="0" value={damageCharges} onChange={e => setDamageCharges(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea className="form-input" rows={3} placeholder="e.g., 2 planks snapped due to overload..." value={notes} onChange={e => setNotes(e.target.value)} style={{ resize: 'vertical' }} />
              </div>

              <div style={{ padding: '16px', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '8px' }}>Return Summary</h4>
                {Object.entries(returnQtys).filter(([_, q]) => q > 0).map(([itemId, qty]) => {
                  const item = rental.items.find(i => i.itemId === itemId);
                  return (
                    <div key={itemId} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem' }}>
                      <span>{item?.itemName}</span>
                      <span style={{ fontWeight: 600 }}>× {qty}</span>
                    </div>
                  );
                })}
                {!hasItemsToReturn && <p style={{ color: 'var(--outline)', fontSize: '0.85rem' }}>No items selected</p>}
                {Number(damageCharges) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem', borderTop: '1px solid var(--outline-variant)', marginTop: '8px' }}>
                    <span>Damage Charges</span>
                    <span style={{ fontWeight: 600 }}>₹{Number(damageCharges).toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                disabled={!hasItemsToReturn || submitting}
                onClick={() => setShowConfirm(true)}
              >
                {submitting ? <><div className="spinner spinner-sm" /> Processing...</> : (
                  <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>receipt</span> Process Return</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmDialog
          title="Confirm Return"
          message="Are you sure you want to process this return? The rental amount will be updated accordingly."
          confirmText="Process Return"
          icon="assignment_returned"
          onConfirm={handleSubmit}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
