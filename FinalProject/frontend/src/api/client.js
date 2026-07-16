const API_BASE = '/api';

const handleError = (res) => {
  if (!res.ok) {
    const error = new Error(res.statusText);
    error.status = res.status;
    throw error;
  }
  return res;
};

// `credentials: 'include'` ensures the httpOnly auth cookie set by the API is
// sent with every request.
const request = (url, options = {}) =>
  fetch(url, { credentials: 'include', ...options })
    .then(handleError)
    .then((res) => res.json());

const http = {
  get: (url) => request(url),
  post: (url, data) =>
    request(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    }),
  put: (url, data) =>
    request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    }),
  delete: (url) => request(url, { method: 'DELETE' })
};

const api = {
  // --- Users ---
  createNewUser: (username, password, email) =>
    http.post(`${API_BASE}/users/signup`, { username, password, email }),
  getCurrentUser: () => http.get(`${API_BASE}/users/current`),
  logIn: (username, password) =>
    http.post(`${API_BASE}/users/login`, { username, password }),
  logOut: () => http.post(`${API_BASE}/users/logout`, {}),

  // --- Providers ---
  getProviderById: (providerId) => http.get(`${API_BASE}/providers/${providerId}`),
  getAllProviders: () => http.get(`${API_BASE}/users/providers`),
  createProvider: (name) => http.post(`${API_BASE}/users/providers`, { name }),
  deleteProvider: (providerId) => http.delete(`${API_BASE}/users/providers/${providerId}`),
  editProviderName: (newName, providerId) =>
    http.put(`${API_BASE}/providers/${providerId}`, { name: newName }),

  // --- Accounts ---
  getAccounts: (providerId) => http.get(`${API_BASE}/accounts/${providerId}`),
  getAccountById: (providerId, accountId) =>
    http.get(`${API_BASE}/accounts/${providerId}/${accountId}`),
  createAccount: (providerId, username, password, notes) =>
    http.put(`${API_BASE}/providers/${providerId}/accounts`, { username, password, notes }),
  deleteAccount: (providerId, accountId) =>
    http.delete(`${API_BASE}/providers/${providerId}/accounts/${accountId}`),
  updateAccount: (providerId, accountId, username, password, notes) =>
    http.put(`${API_BASE}/accounts/${providerId}/${accountId}`, { username, password, notes })
};

export default api;
