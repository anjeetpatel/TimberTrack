import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!phone || !pin) { setError('Phone and PIN are required.'); return; }
    if (pin.length !== 4) { setError('PIN must be exactly 4 digits.'); return; }
    if (isRegister && !name) { setError('Name is required.'); return; }

    setLoading(true);
    try {
      if (isRegister) {
        await register(phone, name, pin);
        addToast('Registration successful! Welcome to TimberTrack.', 'success');
      } else {
        await login(phone, pin);
        addToast('Welcome back!', 'success');
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Phone Number</label>
            <input className="form-input" type="tel" placeholder="Enter your phone number" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>

          {isRegister && (
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-input" type="text" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}

          <div className="form-group">
            <label>4-Digit PIN</label>
            <input className="form-input" type="password" maxLength={4} placeholder="••••" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} />
          </div>

          {error && <p className="form-error" style={{ marginBottom: '16px' }}>{error}</p>}

          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading} type="submit">
            {loading ? <><div className="spinner spinner-sm" /> Please wait...</> : isRegister ? 'Create Account' : 'Log In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--on-surface-variant)' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => { setIsRegister(!isRegister); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
            {isRegister ? 'Log In' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
}
