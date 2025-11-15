// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import Suppliers from "./pages/Suppliers";
import Purchases from "./pages/Purchases";
import "./App.css"; // We'll add some basic CSS below

const Sidebar = () => (
  <nav className="sidebar">
    <div className="logo">F&B IMS</div>
    <Link to="/">📊 Dashboard</Link>
    <Link to="/products">📦 Products</Link>
    <Link to="/customers">🧑‍🤝‍🧑 Customers</Link>
    <Link to="/orders">🛒 Orders</Link>
    <Link to="/suppliers">🚛 Suppliers</Link>
    <Link to="/purchases">🧾 Purchases</Link>
  </nav>
);

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
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/purchases" element={<Purchases />} />
          {/* Add detail routes here: <Route path="/products/:id" element={<ProductDetail />} /> */}
        </Routes>
      </main>
    </div>
  </Router>
);

export default App;
