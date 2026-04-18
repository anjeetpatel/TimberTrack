import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

// Register mode: 'create' (new org) or 'join' (invite code)
const REGISTER_MODE = { CREATE: 'create', JOIN: 'join' };

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [registerMode, setRegisterMode] = useState(REGISTER_MODE.CREATE);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [orgName, setOrgName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register, isOwner } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const reset = (newMode) => {
    setMode(newMode);
    setError('');
    setPhone(''); setName(''); setPin(''); setOrgName(''); setInviteCode('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone || !pin) { setError('Phone and PIN are required.'); return; }
    if (pin.length < 4) { setError('PIN must be at least 4 digits.'); return; }

    if (mode === 'register') {
      if (!name) { setError('Full name is required.'); return; }
      if (registerMode === REGISTER_MODE.CREATE && !orgName) {
        setError('Business name is required.'); return;
      }
      if (registerMode === REGISTER_MODE.JOIN && !inviteCode) {
        setError('Invite code is required.'); return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        const payload = {
          name, phone, pin,
          ...(registerMode === REGISTER_MODE.CREATE
            ? { organizationName: orgName }
            : { inviteCode: inviteCode.toUpperCase() }),
        };
        const res = await register(payload);
        const role = res.data.user?.role;
        addToast(
          registerMode === REGISTER_MODE.CREATE
            ? `Organization "${orgName}" created. Welcome, ${name}!`
            : `Joined organization successfully. Welcome, ${name}!`,
          'success'
        );
        navigate(role === 'OWNER' ? '/dashboard' : '/rentals');
      } else {
        const res = await login(phone, pin);
        const role = res.data.user?.role;
        addToast('Welcome back!', 'success');
        navigate(role === 'OWNER' ? '/dashboard' : '/rentals');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="card login-card">
        <h1>
          <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '8px' }}>forest</span>
          TimberTrack
        </h1>
        <p className="subtitle">Rental Management System</p>

        {/* Register mode tabs */}
        {mode === 'register' && (
          <div style={{
            display: 'flex', gap: '6px', background: 'var(--surface-variant)',
            padding: '4px', borderRadius: '8px', marginBottom: '20px',
          }}>
            {[
              { id: REGISTER_MODE.CREATE, icon: 'add_business', label: 'Create Business' },
              { id: REGISTER_MODE.JOIN, icon: 'group_add', label: 'Join with Code' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setRegisterMode(tab.id)}
                style={{
                  flex: 1, padding: '8px 4px', border: 'none', borderRadius: '6px',
                  fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                  background: registerMode === tab.id ? 'white' : 'transparent',
                  color: registerMode === tab.id ? 'var(--primary)' : 'var(--on-surface-variant)',
                  boxShadow: registerMode === tab.id ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Phone Number</label>
            <input id="phone" className="form-input" type="tel" placeholder="Enter your phone number"
              value={phone} onChange={e => setPhone(e.target.value)} />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label>Full Name</label>
              <input id="name" className="form-input" type="text" placeholder="Your name"
                value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}

          {mode === 'register' && registerMode === REGISTER_MODE.CREATE && (
            <div className="form-group">
              <label>Business / Organization Name</label>
              <input id="orgName" className="form-input" type="text" placeholder="e.g. Sharma Scaffolding"
                value={orgName} onChange={e => setOrgName(e.target.value)} />
            </div>
          )}

          {mode === 'register' && registerMode === REGISTER_MODE.JOIN && (
            <div className="form-group">
              <label>Invite Code</label>
              <input id="inviteCode" className="form-input" type="text"
                placeholder="8-character code from your owner"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                style={{ letterSpacing: '3px', fontWeight: 700 }}
              />
            </div>
          )}

          <div className="form-group">
            <label>4-Digit PIN</label>
            <input id="pin" className="form-input" type="password" maxLength={6}
              placeholder="••••" value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, ''))} />
          </div>

          {error && <p className="form-error" style={{ marginBottom: '16px' }}>{error}</p>}

          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading} type="submit">
            {loading
              ? <><div className="spinner spinner-sm" /> Please wait...</>
              : mode === 'register'
                ? (registerMode === REGISTER_MODE.CREATE ? '🏢 Create Organization' : '🔗 Join Organization')
                : 'Log In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--on-surface-variant)' }}>
          {mode === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => reset(mode === 'register' ? 'login' : 'register')}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
            {mode === 'register' ? 'Log In' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
}
