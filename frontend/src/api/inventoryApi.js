// src/api/inventoryApi.js
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Dashboard Endpoints (dashboard.js)
export const getDashboardSummary = () => api.get("/dashboard/summary");
export const getLowStockAlerts = () => api.get("/dashboard/low-stock-alerts");
export const getTopSellingProducts = () =>
  api.get("/dashboard/top-selling-products");

// --- Product Endpoints (products.js)
export const getProducts = (filters) =>
  api.get("/products", { params: filters });
export const getProductCategories = () => api.get("/products/meta/categories");
export const createProduct = (data) => api.post("/products", data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// --- Customer Endpoints (customers.js)
export const getCustomers = (filters) =>
  api.get("/customers", { params: filters });

// --- Customer Order Endpoints (customerOrders.js)
export const getCustomerOrders = (filters) =>
  api.get("/customer-orders", { params: filters });

// --- Customer Order Items Endpoints
/**
 * Fetches the details of a single Customer Order, including its items.
 * Corresponds to: GET /api/customer-orders/:orderId
 * @param {string} orderId The ID of the order to fetch.
 */
export const getCustomerOrderDetails = (orderId) =>
  api.get(`/customer-orders/${orderId}`);

export const createOrderItem = (orderId, data) =>
  api.post(`/customer-orders/${orderId}/items`, data);

export const updateOrderItem = (orderId, itemId, updatedData) => {
  return api.put(`/customer-orders/${orderId}/items/${itemId}`, updatedData);
};
export const deleteOrderItem = (orderId, itemId) =>
  api.delete(`/customer-orders/${orderId}/items/${itemId}`);

// --- Supplier Endpoints (suppliers.js)
export const getSuppliers = (filters) =>
  api.get("/suppliers", { params: filters });
export const getSupplierRegions = () => api.get("/suppliers/meta/regions");

// --- Supplier Purchase Endpoints (supplierPurchases.js)
export const getSupplierPurchases = (filters) =>
  api.get("/supplier-purchases", { params: filters });

/**
 * Fetches the details of a single Supplier Purchase, including its items.
 * Corresponds to: GET /api/supplier-purchases/:purchaseId
 * @param {string} purchaseId The ID of the purchase to fetch.
 */
export const getSupplierPurchaseDetails = (purchaseId) =>
  api.get(`/supplier-purchases/${purchaseId}`);

export const createPurchaseItem = (purchaseId, data) =>
  api.post(`/supplier-purchases/${purchaseId}/items`, data);

export const updatePurchaseItem = (purchaseId, itemId, data) =>
  api.put(`/supplier-purchases/${purchaseId}/items/${itemId}`, data);

export const deletePurchaseItem = (purchaseId, itemId) =>
  api.delete(`/supplier-purchases/${purchaseId}/items/${itemId}`);

export default api;
