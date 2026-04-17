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
    const blob = await res.blob();
    return blob;
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

// ---- AUTH ----
export const authAPI = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
};

// ---- INVENTORY ----
export const inventoryAPI = {
  getAll: (search = '') => request(`/inventory${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  create: (body) => request('/inventory', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
};

// ---- CUSTOMERS ----
export const customerAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/customers${qs ? `?${qs}` : ''}`);
  },
  create: (body) => request('/customers', { method: 'POST', body: JSON.stringify(body) }),
};

// ---- RENTALS ----
export const rentalAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/rentals${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => request(`/rentals/${id}`),
  create: (body) => request('/rentals', { method: 'POST', body: JSON.stringify(body) }),
};

// ---- RETURNS ----
export const returnAPI = {
  process: (body) => request('/returns', { method: 'POST', body: JSON.stringify(body) }),
  getByRental: (rentalId) => request(`/returns?rentalId=${rentalId}`),
};

// ---- PAYMENTS ----
export const paymentAPI = {
  record: (body) => request('/payments', { method: 'POST', body: JSON.stringify(body) }),
  getByRental: (rentalId) => request(`/payments?rentalId=${rentalId}`),
};

// ---- DASHBOARD ----
export const dashboardAPI = {
  getStats: () => request('/dashboard/stats'),
};

// ---- WHATSAPP ----
export const whatsappAPI = {
  rentalMessage: (rentalId) => request(`/whatsapp/rental/${rentalId}`),
  returnMessage: (rentalId) => request(`/whatsapp/return/${rentalId}`),
  reminderMessage: (rentalId) => request(`/whatsapp/reminder/${rentalId}`),
};

// ---- EXPORT ----
export const exportAPI = {
  downloadRentals: () => request('/export/rentals'),
  downloadPayments: () => request('/export/payments'),
};

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
