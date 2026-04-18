import { useState, useEffect } from 'react';
import { orgAPI, subscriptionAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const UsageBar = ({ label, used, limit, color }) => {
  const pct = limit === Infinity ? 0 : Math.min(100, Math.round((used / limit) * 100));
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</span>
        <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>
          {limit === Infinity ? `${used} (Unlimited)` : `${used} / ${limit}`}
        </span>
      </div>
      <div style={{ height: '8px', background: 'var(--outline-variant)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: pct >= 90 ? '#ef4444' : pct >= 70 ? '#f97316' : color,
          borderRadius: '4px',
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
};

export default function Settings() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [org, setOrg] = useState(null);
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [copyDone, setCopyDone] = useState(false);

  const fetchData = async () => {
    try {
      const [orgRes, subRes] = await Promise.all([orgAPI.get(), subscriptionAPI.get()]);
      setOrg(orgRes.data);
      setSub(subRes.data);
    } catch {
      showToast('Failed to load settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRegenerateInvite = async () => {
    setRegenerating(true);
    try {
      const res = await orgAPI.regenerateInviteCode({ usageLimit: 10 });
      showToast('Invite code regenerated!', 'success');
      setOrg(prev => ({
        ...prev,
        invite: {
          ...prev.invite,
          code: res.data.inviteCode,
          usageCount: 0,
          usesRemaining: res.data.usageLimit,
        },
      }));
    } catch (e) {
      showToast(e.message || 'Failed to regenerate.', 'error');
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(org?.invite?.code || '');
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 2000);
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      await subscriptionAPI.upgrade();
      showToast('Plan upgraded to PAID! (Demo)', 'success');
      fetchData();
    } catch (e) {
      showToast(e.message || 'Upgrade failed.', 'error');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
        Loading settings...
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '760px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className="material-symbols-outlined">settings</span>
        Settings
      </h1>

      {/* ── Organization ─────────────────────────────────────────── */}
      <section className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Organization</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{org?.name}</div>
            <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>
              Created {org?.createdAt ? new Date(org.createdAt).toLocaleDateString('en-IN') : '—'}
              &nbsp;·&nbsp;{org?.memberCount} member{org?.memberCount !== 1 ? 's' : ''}
            </div>
          </div>
          <span style={{
            marginLeft: 'auto',
            padding: '4px 12px',
            borderRadius: '20px',
            fontWeight: 700,
            fontSize: '0.8rem',
            background: sub?.plan === 'PAID' ? 'var(--primary)' : 'var(--outline-variant)',
            color: sub?.plan === 'PAID' ? 'white' : 'var(--on-surface-variant)',
          }}>
            {sub?.plan || 'FREE'}
          </span>
        </div>
      </section>

      {/* ── Invite Code ──────────────────────────────────────────── */}
      <section className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>Invite Code</h2>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', marginBottom: '16px' }}>
          Share this code with workers so they can join your organization.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <code style={{
            padding: '10px 18px',
            background: 'var(--surface-variant)',
            borderRadius: '8px',
            fontSize: '1.2rem',
            fontWeight: 700,
            letterSpacing: '4px',
          }}>
            {org?.invite?.code || '—'}
          </code>
          <button className="btn btn-secondary" onClick={handleCopyInvite} style={{ minWidth: '90px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              {copyDone ? 'check' : 'content_copy'}
            </span>
            {copyDone ? 'Copied!' : 'Copy'}
          </button>
          <button className="btn btn-secondary" onClick={handleRegenerateInvite} disabled={regenerating}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
            {regenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
        </div>
        <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
          {org?.invite?.usesRemaining} uses remaining of {org?.invite?.usageLimit} total
          {org?.invite?.expiresAt && ` · Expires ${new Date(org.invite.expiresAt).toLocaleDateString('en-IN')}`}
        </div>
      </section>

      {/* ── Subscription & Usage ─────────────────────────────────── */}
      <section className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Usage & Subscription</h2>
          {sub?.plan === 'FREE' && (
            <button className="btn btn-primary" onClick={handleUpgrade} disabled={upgrading} style={{ padding: '6px 16px', fontSize: '0.85rem' }}>
              {upgrading ? 'Upgrading...' : '⚡ Upgrade to PAID'}
            </button>
          )}
        </div>
        {sub && (
          <>
            <UsageBar
              label="Rentals this month"
              used={sub.usage.rentalsThisMonth}
              limit={sub.limits.rentalsPerMonth}
              color="var(--primary)"
            />
            <UsageBar
              label="Total customers"
              used={sub.usage.totalCustomers}
              limit={sub.limits.maxCustomers}
              color="#10b981"
            />
            {sub.plan === 'FREE' && (
              <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: '8px' }}>
                FREE plan: 50 rentals/month &amp; 100 customers max. Upgrade for unlimited access.
              </p>
            )}
          </>
        )}
      </section>

      {/* ── Account ──────────────────────────────────────────────── */}
      <section className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Your Account</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: '2px' }}>Name</div>
            <div style={{ fontWeight: 600 }}>{user?.name}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: '2px' }}>Role</div>
            <div style={{ fontWeight: 600 }}>👑 Owner</div>
          </div>
        </div>
      </section>
    </div>
  );
}
