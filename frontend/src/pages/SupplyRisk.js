import React, { useState, useEffect } from "react";
import { getSupplyRiskReport } from "../api/inventoryApi";

const SupplyRisk = () => {
  const [supplyRiskData, setSupplyRiskData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterRisk, setFilterRisk] = useState("all"); // all, critical, medium, low

  useEffect(() => {
    fetchSupplyRiskData();
  }, []);

  const fetchSupplyRiskData = async () => {
    try {
      setLoading(true);
      const data = await getSupplyRiskReport();
      setSupplyRiskData(data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Categorize risk levels
  const getRiskLevel = (supplierCount) => {
    if (supplierCount === 0) return "critical";
    if (supplierCount === 1) return "high";
    if (supplierCount === 2) return "medium";
    return "low";
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case "critical":
        return "#e74c3c"; // red
      case "high":
        return "#f39c12"; // orange
      case "medium":
        return "#f1c40f"; // yellow
      case "low":
        return "#27ae60"; // green
      default:
        return "#95a5a6"; // gray
    }
  };

  const getRiskLabel = (riskLevel) => {
    switch (riskLevel) {
      case "critical":
        return "🔴 Critical";
      case "high":
        return "🟠 High";
      case "medium":
        return "🟡 Medium";
      case "low":
        return "🟢 Low";
      default:
        return "❓ Unknown";
    }
  };

  // Filter data based on selected filter
  const filteredData =
    filterRisk === "all"
      ? supplyRiskData
      : supplyRiskData.filter((item) => getRiskLevel(item.supplier_count) === filterRisk);

  // Calculate statistics
  const stats = {
    critical: supplyRiskData.filter((item) => getRiskLevel(item.supplier_count) === "critical").length,
    high: supplyRiskData.filter((item) => getRiskLevel(item.supplier_count) === "high").length,
    medium: supplyRiskData.filter((item) => getRiskLevel(item.supplier_count) === "medium").length,
    low: supplyRiskData.filter((item) => getRiskLevel(item.supplier_count) === "low").length,
  };

  if (loading) {
    return <div className="loading">Loading supply risk data...</div>;
  }

  return (
    <div className="supply-risk-container">
      <h1>📊 Supply Continuity Risk Report</h1>
      <p className="page-description">
        Analyze products based on the number of suppliers. Products with fewer suppliers face higher supply continuity risk.
      </p>

      {error && <div className="error-message">{error}</div>}

      {/* Risk Summary Cards */}
      <div className="summary-cards">
        <div
          className="risk-card critical"
          onClick={() => setFilterRisk("critical")}
          style={{ cursor: "pointer" }}
        >
          <h3>🔴 Critical Risk</h3>
          <p className="risk-count">{stats.critical}</p>
          <small>No suppliers</small>
        </div>
        <div
          className="risk-card high"
          onClick={() => setFilterRisk("high")}
          style={{ cursor: "pointer" }}
        >
          <h3>🟠 High Risk</h3>
          <p className="risk-count">{stats.high}</p>
          <small>1 supplier only</small>
        </div>
        <div
          className="risk-card medium"
          onClick={() => setFilterRisk("medium")}
          style={{ cursor: "pointer" }}
        >
          <h3>🟡 Medium Risk</h3>
          <p className="risk-count">{stats.medium}</p>
          <small>2 suppliers</small>
        </div>
        <div
          className="risk-card low"
          onClick={() => setFilterRisk("low")}
          style={{ cursor: "pointer" }}
        >
          <h3>🟢 Low Risk</h3>
          <p className="risk-count">{stats.low}</p>
          <small>3+ suppliers</small>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="control-bar">
        <div className="filter-section">
          <label>Filter by Risk Level: </label>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
          >
            <option value="all">All Products</option>
            <option value="critical">Critical Risk</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Supply Risk Table */}
      <table className="supply-risk-table">
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Product Name</th>
            <th>Category</th>
            <th>Unit Price</th>
            <th>Current Stock</th>
            <th>Supplier Count</th>
            <th>Risk Level</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((product) => {
              const riskLevel = getRiskLevel(product.supplier_count);
              return (
                <tr key={product.product_id}>
                  <td>{product.product_id}</td>
                  <td>{product.name}</td>
                  <td>{product.category || "-"}</td>
                  <td>${product.unit_price}</td>
                  <td>{product.stock_quantity}</td>
                  <td>
                    <span style={{ fontWeight: "bold" }}>
                      {product.supplier_count}
                    </span>
                  </td>
                  <td>
                    <span
                      className="risk-badge"
                      style={{
                        backgroundColor: getRiskColor(riskLevel),
                        color: "white",
                        padding: "5px 10px",
                        borderRadius: "4px",
                        fontWeight: "bold",
                      }}
                    >
                      {getRiskLabel(riskLevel)}
                    </span>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No products found for this risk level.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Statistics Summary */}
      <div className="statistics-section">
        <h2>Statistics</h2>
        <p>
          <strong>Total Products:</strong> {supplyRiskData.length}
        </p>
        <p>
          <strong>Average Suppliers per Product:</strong>{" "}
          {(
            supplyRiskData.reduce((sum, item) => sum + item.supplier_count, 0) /
            supplyRiskData.length
          ).toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default SupplyRisk;
