// src/App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Suppliers from "./pages/Suppliers";
import Purchases from "./pages/Purchases";
import PurchaseDetails from "./pages/PurchaseDetails";
import SupplyRisk from "./pages/SupplyRisk";
import PurchaseForecast from "./pages/PurchaseForecast";
import CustomerProductTrends from "./pages/CustomerProductTrends";
import "./App.css"; // We'll add some basic CSS below

const Sidebar = () => {
  const [expandedMenu, setExpandedMenu] = useState(null);

  const toggleMenu = (menuName) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
  };

  return (
    <nav className="sidebar">
      <div className="logo">F&B IMS</div>
      <Link to="/">📊 Dashboard</Link>
      <Link to="/products">📦 Products</Link>
      <Link to="/customers">🧑‍🤝‍🧑 Customers</Link>
      <Link to="/orders">🛒 Orders</Link>
      <Link to="/suppliers">🚛 Suppliers</Link>
      <Link to="/purchases">🧾 Purchases</Link>
      
      {/* Reports Menu with Subtabs */}
      <div className="menu-item">
        <div 
          className="menu-header"
          onClick={() => toggleMenu("reports")}
        >
          📄 Reports
          <span className={`arrow ${expandedMenu === "reports" ? "open" : ""}`}>
            ▼
          </span>
        </div>
        {expandedMenu === "reports" && (
          <div className="submenu">
            <Link to="/reports/supplyRisk">Supply Continuity Risk Report</Link>
            <Link to="/reports/purchaseForecast">Purchase Forecast Report</Link>
            <Link to="/reports/customerTrends">Customer Product Trends</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

const App = () => (
  <Router>
    <div className="app-container">
      <Sidebar />
      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:orderId" element={<OrderDetails />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/purchases/:purchaseId" element={<PurchaseDetails />} />
          <Route path="/reports/supplyRisk" element={<SupplyRisk />} />
          <Route path="/reports/purchaseForecast" element={<PurchaseForecast />} />
          <Route path="/reports/customerTrends" element={<CustomerProductTrends />} />
        </Routes>
      </main>
    </div>
  </Router>
);

export default App;
