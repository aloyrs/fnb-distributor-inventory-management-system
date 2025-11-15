// src/pages/Dashboard.js
import React, { useState, useEffect } from "react";
import {
  getDashboardSummary,
  getLowStockAlerts,
  getTopSellingProducts,
} from "../api/inventoryApi";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, lowStockRes, topSellingRes] = await Promise.all([
          getDashboardSummary(),
          getLowStockAlerts(),
          getTopSellingProducts(),
        ]);
        setSummary(summaryRes.data);
        setLowStock(lowStockRes.data);
        setTopSelling(topSellingRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading Dashboard...</div>;
  if (!summary) return <div>Failed to load data.</div>;

  return (
    <div>
      <h2>📊 Inventory Dashboard</h2>

      <div className="summary-cards">
        <div className="card">
          <h3>Total Products</h3>
          <p>{summary.totalProducts}</p>
        </div>
        <div className="card">
          <h3>Low Stock Alerts</h3>
          <p>{summary.lowStockCount}</p>
        </div>
        <div className="card">
          <h3>Inventory Value</h3>
          <p>${parseFloat(summary.totalInventoryValue).toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>YTD Revenue</h3>
          <p>${parseFloat(summary.ytdRevenue).toFixed(2)}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ flex: 1 }}>
          <h3>⚠️ Low Stock Alerts (Stock &lt; 100)</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Stock</th>
                <th>Reorder</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((p) => (
                <tr key={p.product_id}>
                  <td>{p.name}</td>
                  <td>{p.stock_quantity}</td>
                  <td>{p.reorder_level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ flex: 1 }}>
          <h3>⭐ Top 10 Selling Products</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Units Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topSelling.map((p) => (
                <tr key={p.product_id}>
                  <td>{p.product_name}</td>
                  <td>{p.total_sold}</td>
                  <td>${parseFloat(p.total_revenue).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
