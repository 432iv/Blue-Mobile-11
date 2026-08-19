/* ================================================================
   BLUE MOBILE — API SERVICE LAYER
   All communication with the Blue Mobile backend.
   - Relative URLs → same origin as the Express server (cookies work).
   - Override the base URL before this script loads by setting:
       window.BLUE_MOBILE_API_BASE = 'https://api.example.com/api'
   - Session cookie is httpOnly + SameSite=Lax (never in JS).
   - Any 401 from the server triggers API.onUnauthorized, which the
     app uses to return to the login screen automatically.
   ================================================================ */
(function () {
  'use strict';

  const BASE = String(window.BLUE_MOBILE_API_BASE || '/api').replace(/\/+$/, '');

  class ApiError extends Error {
    constructor(status, message, code, details) {
      super(message);
      this.status = status; // 0 = network failure
      this.code = code;
      this.details = details;
    }
  }

  async function request(path, { method = 'GET', body } = {}) {
    let res;
    try {
      res = await fetch(BASE + path, {
        method,
        // 'include' works for same-origin AND cross-origin (Netlify → Render)
        credentials: 'include',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (err) {
      throw new ApiError(0, 'Cannot reach the server. Check your connection.', 'NETWORK');
    }

    let data = {};
    try {
      data = await res.json();
    } catch (e) {
      /* non-JSON response */
    }

    if (!res.ok) {
      const err = new ApiError(
        res.status,
        (data && data.error && data.error.message) || 'Request failed (' + res.status + ')',
        data && data.error && data.error.code,
        data && data.error && data.error.details
      );
      if (res.status === 401 && API.onUnauthorized) API.onUnauthorized(err);
      throw err;
    }
    return data;
  }

  const API = {
    ApiError,
    base: BASE,
    onUnauthorized: null,

    /* ---------------- Auth ---------------- */
    login: (username, password) =>
      request('/auth/login', { method: 'POST', body: { username, password } }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    me: () => request('/auth/me'),
    changePassword: (payload) =>
      request('/auth/change-password', { method: 'PUT', body: payload }),

    /* ---------------- Products ---------------- */
    // returns { products: [...active...], outOfStock: [...] }
    getProducts: (includeOut) =>
      request('/products' + (includeOut ? '?includeOut=true' : '')).then((d) => d),
    getProduct: (id) => request('/products/' + encodeURIComponent(id)).then((d) => d.product),
    getProductByBarcode: (code) =>
      request('/products/barcode/' + encodeURIComponent(code)).then((d) => d.product),
    createProduct: (data) => request('/products', { method: 'POST', body: data }).then((d) => d.product),
    updateProduct: (id, data) =>
      request('/products/' + encodeURIComponent(id), { method: 'PUT', body: data }).then((d) => d.product),
    deleteProduct: (id) =>
      request('/products/' + encodeURIComponent(id), { method: 'DELETE' }).then((d) => d.deleted),
    // purchase/restock: quantity + purchase price → internal batch
    purchaseProduct: (id, data) =>
      request('/products/' + encodeURIComponent(id) + '/purchase', { method: 'POST', body: data }).then((d) => d.product),

    /* ---------------- Device models ---------------- */
    getDeviceModels: (search) =>
      request('/device-models' + (search ? '?search=' + encodeURIComponent(search) : '')).then((d) => d.models),
    createDeviceModel: (data) =>
      request('/device-models', { method: 'POST', body: data }).then((d) => d.model),

    /* ---------------- Daily notes ---------------- */
    getNotes: (sessionId) =>
      request('/notes' + (sessionId ? '?sessionId=' + encodeURIComponent(sessionId) : '')).then((d) => d.notes),
    createNote: (text) => request('/notes', { method: 'POST', body: { text } }).then((d) => d.note),
    deleteNote: (id) =>
      request('/notes/' + encodeURIComponent(id), { method: 'DELETE' }).then((d) => d.deleted),

    /* ---------------- Day sessions ---------------- */
    getCurrentSession: () => request('/sessions/current').then((d) => d.session),
    startDay: (data) => request('/sessions', { method: 'POST', body: data }).then((d) => d.session),
    closeDay: () => request('/sessions/close', { method: 'POST' }).then((d) => d.report),

    /* ---------------- Sales ---------------- */
    getSales: (sessionId) =>
      request('/sales' + (sessionId ? '?sessionId=' + encodeURIComponent(sessionId) : '')).then(
        (d) => d.sales
      ),
    createSale: (data) => request('/sales', { method: 'POST', body: data }).then((d) => d.sale),
    updateSale: (id, data) =>
      request('/sales/' + encodeURIComponent(id), { method: 'PUT', body: data }).then((d) => d.sale),
    deleteSale: (id) =>
      request('/sales/' + encodeURIComponent(id), { method: 'DELETE' }).then((d) => d.deleted),

    /* ---------------- Reports ---------------- */
    getReports: () => request('/reports').then((d) => d.reports),
    getReport: (id) => request('/reports/' + encodeURIComponent(id)).then((d) => d.report),
    getMonthly: () => request('/reports/monthly').then((d) => d.months),
    getBestSellers: () => request('/reports/best-sellers').then((d) => d.products),
    getLowStock: () => request('/reports/low-stock').then((d) => d.products),

    /* ---------------- Customers ---------------- */
    getCustomers: () => request('/customers'),
    getCustomer: (id) => request('/customers/' + encodeURIComponent(id)).then((d) => d.customer),
    createCustomer: (data) =>
      request('/customers', { method: 'POST', body: data }).then((d) => d.customer),
    updateCustomer: (id, data) =>
      request('/customers/' + encodeURIComponent(id), { method: 'PUT', body: data }).then((d) => d.customer),
    deleteCustomer: (id) =>
      request('/customers/' + encodeURIComponent(id), { method: 'DELETE' }).then((d) => d.deleted),
    addCustomerTransaction: (id, data) =>
      request('/customers/' + encodeURIComponent(id) + '/transactions', {
        method: 'POST',
        body: data,
      }).then((d) => d.customer),

    /* ---------------- Dashboard ---------------- */
    getDashboard: () => request('/dashboard/summary').then((d) => d.summary),

    /* ---------------- Admin ---------------- */
    clearData: () => request('/admin/data', { method: 'DELETE' }),
  };

  window.API = API;
})();
