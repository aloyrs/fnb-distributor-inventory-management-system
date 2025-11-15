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

// --- Customer Endpoints (customers.js)
export const getCustomers = (filters) =>
  api.get("/customers", { params: filters });

// --- Customer Order Endpoints (customerOrders.js)
export const getCustomerOrders = (filters) =>
  api.get("/customer-orders", { params: filters });

// --- Supplier Endpoints (suppliers.js)
export const getSuppliers = (filters) =>
  api.get("/suppliers", { params: filters });
export const getSupplierRegions = () => api.get("/suppliers/meta/regions");

// --- Supplier Purchase Endpoints (supplierPurchases.js)
export const getSupplierPurchases = (filters) =>
  api.get("/supplier-purchases", { params: filters });

// Example CRUD methods (for Products)
// export const createProduct = (data) => api.post('/products', data);
// export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
// export const deleteProduct = (id) => api.delete(`/products/${id}`);

console.log(API_BASE_URL);

export default api;
