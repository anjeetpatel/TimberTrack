import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerAPI, inventoryAPI, rentalAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';

/* ── Searchable Dropdown ─────────────────────────────────────────── */
function SearchDropdown({ placeholder, options, renderOption, renderSelected, selected, onSelect, onClear, icon }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(o => renderOption.filter(o, query));

  const handleSelect = (opt) => {
    onSelect(opt);
    setQuery('');
    setOpen(false);
  };

  if (selected) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'var(--surface-container-low)', borderRadius: '10px', border: '1.5px solid var(--primary)' }}>
        <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '20px' }}>{icon}</span>
        <div style={{ flex: 1 }}>{renderSelected(selected)}</div>
        <button onClick={onClear} style={{ background: 'none', border: '1px solid var(--outline-variant)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
          Change
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)', fontSize: '18px', pointerEvents: 'none' }}>
          search
        </span>
        <input
          ref={inputRef}
          className="form-input"
          style={{ paddingLeft: '40px' }}
          placeholder={placeholder}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 200,
          background: 'var(--surface)', border: '1px solid var(--outline-variant)',
          borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          maxHeight: '240px', overflowY: 'auto',
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '16px', color: 'var(--on-surface-variant)', textAlign: 'center', fontSize: '0.9rem' }}>
              No results found for "{query}"
            </div>
          ) : (
            filtered.map(opt => (
              <div
                key={opt._id}
                onClick={() => handleSelect(opt)}
                style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--surface-container)', transition: 'background 0.12s' }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--surface-container-low)'}
                onMouseOut={e => e.currentTarget.style.background = ''}
              >
                {renderOption.render(opt)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ── Item Quantity Input ─────────────────────────────────────────── */
function QtyInput({ value, max, onChange }) {
  const [raw, setRaw] = useState(String(value));

  const commit = (val) => {
    const n = parseInt(val);
    if (!val || isNaN(n) || n < 1) { setRaw('1'); onChange(1); return; }
    const clamped = Math.min(n, max);
    setRaw(String(clamped));
    onChange(clamped);
  };

  useEffect(() => setRaw(String(value)), [value]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <button
        className="btn btn-icon btn-secondary btn-sm"
        onClick={() => { const v = Math.max(1, value - 1); setRaw(String(v)); onChange(v); }}
        disabled={value <= 1}
        style={{ width: '30px', height: '30px', flexShrink: 0 }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>remove</span>
      </button>
      <input
        type="number"
        min={1}
        max={max}
        value={raw}
        onChange={e => setRaw(e.target.value)}
        onBlur={e => commit(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && commit(raw)}
        style={{
          width: '62px', textAlign: 'center', fontWeight: 700, fontSize: '1rem',
          border: '1.5px solid var(--outline-variant)', borderRadius: '8px',
          padding: '5px 4px', outline: 'none',
          background: 'var(--surface)', color: 'var(--on-surface)',
        }}
      />
      <button
        className="btn btn-icon btn-secondary btn-sm"
        onClick={() => { const v = Math.min(max, value + 1); setRaw(String(v)); onChange(v); }}
        disabled={value >= max}
        style={{ width: '30px', height: '30px', flexShrink: 0 }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
      </button>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────────── */
export default function NewRental() {
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    Promise.all([customerAPI.getAll({ limit: 200 }), inventoryAPI.getAll({ limit: 500 })])
      .then(([cRes, iRes]) => {
        setCustomers(cRes.data);
        setInventory(iRes.data);
      })
      .catch(err => addToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  // Available = inventory items not already in the cart
  const availableInventory = inventory.filter(
    i => i.availableQuantity > 0 && !selectedItems.find(si => si.itemId === i._id)
  );

  const addItem = (item) => {
    setSelectedItems(prev => [...prev, {
      itemId: item._id,
      itemName: item.name,
      category: item.category,
      maxQty: item.availableQuantity,
      pricePerDay: item.pricePerDay,
      qty: 1,
    }]);
  };

  const updateQty = (idx, qty) => {
    setSelectedItems(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], qty: Math.max(1, Math.min(qty, updated[idx].maxQty)) };
      return updated;
    });
  };

  const removeItem = (idx) => setSelectedItems(prev => prev.filter((_, i) => i !== idx));

  const estimatedTotal = selectedItems.reduce((sum, item) => sum + item.qty * item.pricePerDay, 0);

  const handleSubmit = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    try {
      const res = await rentalAPI.create({
        customerId: selectedCustomer._id,
        items: selectedItems.map(i => ({ itemId: i.itemId, qty: i.qty })),
        startDate,
      });
      addToast('Rental created successfully! ✓', 'success');
      navigate(`/rentals/${res.data._id}`);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner size="page" />;

  const canSubmit = selectedCustomer && selectedItems.length > 0 && !submitting;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-icon btn-secondary" onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1>New Rental</h1>
            <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
              {selectedItems.length > 0 && `${selectedItems.length} item(s) · Est. ₹${estimatedTotal.toLocaleString('en-IN')}/day`}
            </div>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span> Cancel
        </button>
      </div>

      <div className="page-body">
        <div className="detail-grid">
          {/* ── LEFT COLUMN ─────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* STEP 1: Customer */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: selectedCustomer ? 'var(--primary)' : 'var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>1</span>
                </div>
                <h3 style={{ margin: 0 }}>Select Customer</h3>
              </div>
              <SearchDropdown
                placeholder="Search by name or phone..."
                icon="person"
                options={customers}
                selected={selectedCustomer}
                onSelect={setSelectedCustomer}
                onClear={() => setSelectedCustomer(null)}
                renderOption={{
                  filter: (c, q) => c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q),
                  render: (c) => (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{c.phone}</div>
                      </div>
                      {c.email && <div style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>{c.email}</div>}
                    </div>
                  ),
                }}
                renderSelected={(c) => (
                  <div>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)' }}>{c.phone}{c.email ? ` · ${c.email}` : ''}</div>
                  </div>
                )}
              />
            </div>

            {/* STEP 2: Add Items */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: selectedItems.length > 0 ? 'var(--primary)' : 'var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>2</span>
                </div>
                <h3 style={{ margin: 0 }}>Add Items</h3>
                {selectedItems.length > 0 && (
                  <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
                    {availableInventory.length} more available
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', marginBottom: '14px' }}>
                Search and select items · type any quantity directly
              </p>

              <SearchDropdown
                placeholder="Search equipment, materials..."
                icon="inventory_2"
                options={availableInventory}
                selected={null}
                onSelect={addItem}
                onClear={() => {}}
                renderOption={{
                  filter: (i, q) => i.name.toLowerCase().includes(q.toLowerCase()) || i.category.toLowerCase().includes(q.toLowerCase()),
                  render: (i) => (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{i.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>
                          {i.category} · ₹{i.pricePerDay}/day
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: '0.78rem', fontWeight: 700,
                          color: i.availableQuantity < 10 ? '#ef4444' : '#10b981',
                          background: i.availableQuantity < 10 ? '#fef2f2' : '#ecfdf5',
                          padding: '2px 8px', borderRadius: '20px',
                        }}>
                          {i.availableQuantity} avail.
                        </div>
                      </div>
                    </div>
                  ),
                }}
                renderSelected={() => null}
              />

              {/* Already-added items list */}
              {selectedItems.length > 0 && (
                <div style={{ marginTop: '18px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Added Items ({selectedItems.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedItems.map((item, idx) => {
                      const isOverMax = item.qty > item.maxQty;
                      return (
                        <div key={item.itemId} style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '12px 14px',
                          background: isOverMax ? '#fef2f2' : 'var(--surface-container-low)',
                          borderRadius: '10px',
                          border: `1.5px solid ${isOverMax ? '#fca5a5' : 'transparent'}`,
                          transition: 'all 0.15s',
                        }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.itemName}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>
                              ₹{item.pricePerDay}/day · max {item.maxQty}
                              {isOverMax && <span style={{ color: '#ef4444', marginLeft: '8px' }}>⚠ exceeds stock!</span>}
                            </div>
                          </div>
                          <QtyInput
                            value={item.qty}
                            max={item.maxQty}
                            onChange={(v) => updateQty(idx, v)}
                          />
                          <div style={{ fontWeight: 700, minWidth: '72px', textAlign: 'right', fontSize: '0.9rem' }}>
                            ₹{(item.qty * item.pricePerDay).toLocaleString('en-IN')}/d
                          </div>
                          <button
                            onClick={() => removeItem(idx)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                            title="Remove item"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN: Summary ─────────────────── */}
          <div>
            <div className="card" style={{ position: 'sticky', top: '24px' }}>
              <h3 style={{ marginBottom: '20px' }}>Rental Summary</h3>

              {/* Start Date */}
              <div className="form-group">
                <label>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }}>calendar_today</span>
                  Rental Start Date
                </label>
                <input className="form-input" type="date" value={startDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={e => setStartDate(e.target.value)} />
              </div>

              {/* Customer summary */}
              {selectedCustomer && (
                <div style={{ padding: '10px 14px', background: 'var(--surface-container-low)', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem' }}>
                  <div style={{ fontWeight: 600 }}>👤 {selectedCustomer.name}</div>
                  <div style={{ color: 'var(--on-surface-variant)' }}>{selectedCustomer.phone}</div>
                </div>
              )}

              {/* Items */}
              {selectedItems.length === 0 ? (
                <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--on-surface-variant)', background: 'var(--surface-container-low)', borderRadius: '10px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '40px', opacity: 0.4 }}>shopping_cart</span>
                  <p style={{ marginTop: '8px', fontSize: '0.88rem' }}>No items yet. Search and add from the left panel.</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                    {selectedItems.map((item, idx) => (
                      <div key={item.itemId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                        <span style={{ color: 'var(--on-surface-variant)' }}>
                          {item.itemName} × {item.qty}
                        </span>
                        <span style={{ fontWeight: 600 }}>₹{(item.qty * item.pricePerDay).toLocaleString('en-IN')}/d</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px dashed var(--outline-variant)', paddingTop: '14px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 600, color: 'var(--on-surface-variant)' }}>Est. per day</span>
                      <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)' }}>₹{estimatedTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
                      Final amount is calculated per partial return based on actual days used.
                    </p>
                  </div>

                  <button
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                    disabled={!canSubmit}
                    onClick={() => setShowConfirm(true)}
                  >
                    {submitting
                      ? <><div className="spinner spinner-sm" /> Processing...</>
                      : <>Confirm Rental <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span></>
                    }
                  </button>
                </>
              )}

              {/* Disabled state hint */}
              {!selectedCustomer && (
                <p style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--on-surface-variant)', textAlign: 'center' }}>
                  ⬅ Select a customer first
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmDialog
          title="Confirm Rental"
          message={`Create rental for ${selectedCustomer?.name}?\n${selectedItems.length} item(s) · Est. ₹${estimatedTotal.toLocaleString('en-IN')}/day`}
          confirmText="Create Rental"
          icon="receipt_long"
          onConfirm={handleSubmit}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
