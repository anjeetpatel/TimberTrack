import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerAPI, inventoryAPI, rentalAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';

export default function NewRental() {
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    Promise.all([customerAPI.getAll({ limit: 100 }), inventoryAPI.getAll()])
      .then(([cRes, iRes]) => {
        setCustomers(cRes.data);
        setInventory(iRes.data);
      })
      .catch(err => addToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

  const filteredInventory = inventory.filter(i =>
    i.name.toLowerCase().includes(itemSearch.toLowerCase()) &&
    i.availableQuantity > 0 &&
    !selectedItems.find(si => si.itemId === i._id)
  );

  const addItem = (item) => {
    setSelectedItems([...selectedItems, {
      itemId: item._id,
      itemName: item.name,
      maxQty: item.availableQuantity,
      pricePerDay: item.pricePerDay,
      qty: 1,
    }]);
    setItemSearch('');
  };

  const updateQty = (idx, qty) => {
    const updated = [...selectedItems];
    updated[idx].qty = Math.max(1, Math.min(qty, updated[idx].maxQty));
    setSelectedItems(updated);
  };

  const removeItem = (idx) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    try {
      await rentalAPI.create({
        customerId: selectedCustomer._id,
        items: selectedItems.map(i => ({ itemId: i.itemId, qty: i.qty })),
        startDate,
      });
      addToast('Rental created successfully! ✓', 'success');
      navigate('/rentals');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner size="page" />;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-icon btn-secondary" onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1>New Rental</h1>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span> Cancel
        </button>
      </div>

      <div className="page-body">
        <div className="detail-grid">
          {/* Left: Customer & Items */}
          <div>
            {/* Customer Selection */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px' }}>1. Select Customer</h3>
              {selectedCustomer ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{selectedCustomer.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--outline)' }}>{selectedCustomer.phone}</div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => setSelectedCustomer(null)}>Change</button>
                </div>
              ) : (
                <>
                  <input className="form-input" placeholder="Search by name, phone..." value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} style={{ marginBottom: '12px' }} />
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {filteredCustomers.map(c => (
                      <div key={c._id} onClick={() => setSelectedCustomer(c)} style={{ padding: '12px', cursor: 'pointer', borderRadius: 'var(--radius-sm)', transition: 'background 0.15s' }} onMouseOver={e => e.target.style.background = 'var(--surface-container)'} onMouseOut={e => e.target.style.background = ''}>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--outline)' }}>{c.phone}</div>
                      </div>
                    ))}
                    {filteredCustomers.length === 0 && <div style={{ padding: '12px', color: 'var(--outline)' }}>No customers found.</div>}
                  </div>
                </>
              )}
            </div>

            {/* Item Selection */}
            <div className="card">
              <h3 style={{ marginBottom: '16px' }}>2. Add Items</h3>
              <input className="form-input" placeholder="Search equipment or materials..." value={itemSearch} onChange={e => setItemSearch(e.target.value)} />
              {itemSearch && (
                <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '8px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)' }}>
                  {filteredInventory.map(item => (
                    <div key={item._id} onClick={() => addItem(item)} style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-container)' }} onMouseOver={e => e.currentTarget.style.background = 'var(--surface-container-low)'} onMouseOut={e => e.currentTarget.style.background = ''}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{item.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--outline)' }}>{item.category} • ₹{item.pricePerDay}/day</div>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--outline)' }}>Avail: {item.availableQuantity}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Cart Summary */}
          <div>
            <div className="card">
              <h3 style={{ marginBottom: '16px' }}>Rental Summary</h3>

              <div className="form-group">
                <label>Start Date</label>
                <input className="form-input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>

              {selectedItems.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px' }}>
                  <span className="material-symbols-outlined">shopping_cart</span>
                  <p>No items added yet. Search and add items from the left.</p>
                </div>
              ) : (
                <>
                  {selectedItems.map((item, idx) => (
                    <div key={idx} style={{ padding: '14px 0', borderBottom: '1px solid var(--surface-container)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{item.itemName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--outline)' }}>₹{item.pricePerDay}/day • Max: {item.maxQty}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button className="btn btn-icon btn-secondary btn-sm" onClick={() => updateQty(idx, item.qty - 1)}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>remove</span>
                        </button>
                        <span style={{ fontWeight: 600, minWidth: '30px', textAlign: 'center' }}>{item.qty}</span>
                        <button className="btn btn-icon btn-secondary btn-sm" onClick={() => updateQty(idx, item.qty + 1)}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                        </button>
                        <button className="btn btn-icon btn-sm" style={{ color: 'var(--error)', background: 'none', border: 'none' }} onClick={() => removeItem(idx)}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  <div style={{ marginTop: '20px' }}>
                    <button
                      className="btn btn-primary btn-lg"
                      style={{ width: '100%' }}
                      disabled={!selectedCustomer || selectedItems.length === 0 || submitting}
                      onClick={() => setShowConfirm(true)}
                    >
                      {submitting ? <><div className="spinner spinner-sm" /> Processing...</> : (
                        <>Confirm Rental <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span></>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmDialog
          title="Confirm Rental"
          message={`Create rental for ${selectedCustomer?.name} with ${selectedItems.length} item(s)?`}
          confirmText="Create Rental"
          icon="receipt_long"
          onConfirm={handleSubmit}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
