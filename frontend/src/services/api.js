const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('timbertrack_token');

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, config);

  // Handle CSV downloads
  if (res.headers.get('Content-Type')?.includes('text/csv')) {
    return res.blob();
  }

  const data = await res.json();
  if (!res.ok) {
    // Build a rich error object so callers can read status code too
    const err = new Error(data.message || 'Something went wrong');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

// ── AUTH ──────────────────────────────────────────────────────────
export const authAPI = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  refresh: () => request('/auth/refresh', { method: 'POST' }),
  getMe: () => request('/auth/me'),
};

// ── INVENTORY ─────────────────────────────────────────────────────
export const inventoryAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/inventory${qs ? `?${qs}` : ''}`);
  },
  create: (body) => request('/inventory', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/inventory/${id}`, { method: 'DELETE' }),
};

// ── CUSTOMERS ─────────────────────────────────────────────────────
export const customerAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/customers${qs ? `?${qs}` : ''}`);
  },
  create: (body) => request('/customers', { method: 'POST', body: JSON.stringify(body) }),
  delete: (id) => request(`/customers/${id}`, { method: 'DELETE' }),
};

// ── RENTALS ───────────────────────────────────────────────────────
export const rentalAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/rentals${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => request(`/rentals/${id}`),
  create: (body) => request('/rentals', { method: 'POST', body: JSON.stringify(body) }),
};

// ── RETURNS ───────────────────────────────────────────────────────
export const returnAPI = {
  process: (body) => request('/returns', { method: 'POST', body: JSON.stringify(body) }),
  getByRental: (rentalId) => request(`/returns?rentalId=${rentalId}`),
};

// ── PAYMENTS ──────────────────────────────────────────────────────
export const paymentAPI = {
  record: (body) => request('/payments', { method: 'POST', body: JSON.stringify(body) }),
  getByRental: (rentalId) => request(`/payments?rentalId=${rentalId}`),
};

// ── DASHBOARD ─────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => request('/dashboard/stats'),
};

// ── WHATSAPP ──────────────────────────────────────────────────────
export const whatsappAPI = {
  rentalMessage: (rentalId) => request(`/whatsapp/rental/${rentalId}`),
  returnMessage: (rentalId) => request(`/whatsapp/return/${rentalId}`),
  reminderMessage: (rentalId) => request(`/whatsapp/reminder/${rentalId}`),
};

// ── EXPORT ────────────────────────────────────────────────────────
export const exportAPI = {
  downloadRentals: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/export/rentals${qs ? `?${qs}` : ''}`);
  },
  downloadPayments: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/export/payments${qs ? `?${qs}` : ''}`);
  },
};

// ── ORGANIZATION ──────────────────────────────────────────────────
export const orgAPI = {
  get: () => request('/organization'),
  transferOwnership: (targetUserId) =>
    request('/organization/transfer', { method: 'POST', body: JSON.stringify({ targetUserId }) }),
  regenerateInviteCode: (opts = {}) =>
    request('/organization/invite/regenerate', { method: 'POST', body: JSON.stringify(opts) }),
};

// ── SUBSCRIPTION ──────────────────────────────────────────────────
export const subscriptionAPI = {
  get: () => request('/subscription'),
  upgrade: () => request('/subscription/upgrade', { method: 'POST' }),
  downgrade: () => request('/subscription/downgrade', { method: 'POST' }),
};

// ── ACTIVITY LOG ──────────────────────────────────────────────────
export const activityAPI = {
  getLogs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/activity${qs ? `?${qs}` : ''}`);
  },
};

// ── AI ────────────────────────────────────────────────────────────
export const aiAPI = {
  generateBillingSummary: (body) => request('/ai/billing-summary', { method: 'POST', body: JSON.stringify(body) }),
};

// ── UTILS ─────────────────────────────────────────────────────────
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};
