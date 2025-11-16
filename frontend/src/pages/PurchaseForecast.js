import React, { useState, useEffect } from "react";
import axios from "axios";

const PurchaseForecast = () => {
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPriority, setFilterPriority] = useState("all");
  const [sortBy, setSortBy] = useState("days_since_purchase");

  useEffect(() => {
    fetchForecastData();
  }, []);

  const fetchForecastData = async () => {
    try {
      setLoading(true);
      const API_BASE_URL =
        process.env.REACT_APP_API_BASE_URL || "http://localhost:3000/api";
      const response = await axios.get(
        `${API_BASE_URL}/dashboard/purchase-forecast`
      );
      setForecastData(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter data
  const filteredData =
    filterPriority === "all"
      ? forecastData
      : forecastData.filter((item) => item.purchase_priority === filterPriority);

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case "days_since_purchase":
        return (b.days_since_purchase || 0) - (a.days_since_purchase || 0);
      case "cost":
        return (b.estimated_monthly_cost || 0) - (a.estimated_monthly_cost || 0);
      case "stock":
        return a.stock_quantity - b.stock_quantity;
      default:
        return 0;
    }
  });

  // Calculate statistics
  const stats = {
    urgent: forecastData.filter((item) => item.purchase_priority === "URGENT")
      .length,
    soon: forecastData.filter((item) => item.purchase_priority === "SOON")
      .length,
    planned: forecastData.filter((item) => item.purchase_priority === "PLANNED")
      .length,
    totalMonthlyBudget: forecastData.reduce(
      (sum, item) => sum + (item.estimated_monthly_cost || 0),
      0
    ),
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "URGENT":
        return "#e74c3c"; // red
      case "SOON":
        return "#f39c12"; // orange
      case "PLANNED":
        return "#27ae60"; // green
      default:
        return "#95a5a6"; // gray
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "URGENT":
        return "🚨";
      case "SOON":
        return "⚠️";
      case "PLANNED":
        return "📅";
      default:
        return "❓";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return <div className="loading">Loading forecast data...</div>;
  }

  return (
    <div className="forecast-container">
      <h1>📦 Purchase Forecast Report</h1>
      <p className="page-description">
        Based on historical purchase patterns, this forecast shows which products need to be reordered and when.
      </p>

      {error && <div className="error-message">{error}</div>}

      {/* Priority Summary Cards */}
      <div className="summary-cards">
        <div className="forecast-card urgent" onClick={() => setFilterPriority("URGENT")} style={{ cursor: "pointer" }}>
          <h3>🚨 Urgent</h3>
          <p className="card-number">{stats.urgent}</p>
          <small>Purchase immediately</small>
        </div>
        <div className="forecast-card soon" onClick={() => setFilterPriority("SOON")} style={{ cursor: "pointer" }}>
          <h3>⚠️ Soon</h3>
          <p className="card-number">{stats.soon}</p>
          <small>Within 2 weeks</small>
        </div>
        <div className="forecast-card planned" onClick={() => setFilterPriority("PLANNED")} style={{ cursor: "pointer" }}>
          <h3>📅 Planned</h3>
          <p className="card-number">{stats.planned}</p>
          <small>Schedule purchase</small>
        </div>
        <div className="forecast-card budget">
          <h3>💰 Monthly Budget</h3>
          <p className="card-number">${stats.totalMonthlyBudget.toFixed(2)}</p>
          <small>Total estimated cost</small>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="control-bar">
        <div className="filter-section">
          <label>Filter by Priority: </label>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="all">All Products</option>
            <option value="URGENT">Urgent</option>
            <option value="SOON">Soon</option>
            <option value="PLANNED">Planned</option>
          </select>
        </div>

        <div className="sort-section">
          <label>Sort by: </label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="days_since_purchase">Days Since Purchase</option>
            <option value="cost">Monthly Cost</option>
            <option value="stock">Current Stock</option>
          </select>
        </div>
      </div>

      {/* Forecast Table */}
      <table className="forecast-table">
        <thead>
          <tr>
            <th>Priority</th>
            <th>Product ID</th>
            <th>Product Name</th>
            <th>Category</th>
            <th>Current Stock</th>
            <th>Reorder Level</th>
            <th>Forecasted Monthly Qty</th>
            <th>Last Purchase</th>
            <th>Days Since Purchase</th>
            <th>Avg Days Between Purchases</th>
            <th>Monthly Cost Estimate</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.length > 0 ? (
            sortedData.map((product) => (
              <tr key={product.product_id}>
                <td>
                  <span
                    className="priority-badge"
                    style={{
                      backgroundColor: getPriorityColor(product.purchase_priority),
                      color: "white",
                      padding: "5px 10px",
                      borderRadius: "4px",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {getPriorityIcon(product.purchase_priority)} {product.purchase_priority}
                  </span>
                </td>
                <td>{product.product_id}</td>
                <td>{product.name}</td>
                <td>{product.category || "-"}</td>
                <td>
                  <strong>{product.stock_quantity}</strong>
                </td>
                <td>{product.reorder_level}</td>
                <td>{product.forecasted_monthly_qty || 0} units</td>
                <td>{formatDate(product.last_purchase_date)}</td>
                <td>
                  <strong>{product.days_since_purchase || "N/A"}</strong> days
                </td>
                <td>{product.avg_days_between_purchases || "N/A"} days</td>
                <td>${product.estimated_monthly_cost?.toFixed(2) || "0.00"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11" style={{ textAlign: "center" }}>
                No products found for this priority level.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Chart Section */}
      <div className="charts-section">
        <div className="chart-card">
          <h2>📊 Priority Distribution</h2>
          <div className="mini-chart">
            <div className="chart-bar">
              <div
                className="bar urgent-bar"
                style={{ width: `${(stats.urgent / forecastData.length) * 100 || 0}%` }}
              >
                <span>{stats.urgent}</span>
              </div>
              <div
                className="bar soon-bar"
                style={{ width: `${(stats.soon / forecastData.length) * 100 || 0}%` }}
              >
                <span>{stats.soon}</span>
              </div>
              <div
                className="bar planned-bar"
                style={{ width: `${(stats.planned / forecastData.length) * 100 || 0}%` }}
              >
                <span>{stats.planned}</span>
              </div>
            </div>
          </div>
          <div className="chart-legend">
            <div>
              <span style={{ color: "#e74c3c" }}>■</span> Urgent ({stats.urgent})
            </div>
            <div>
              <span style={{ color: "#f39c12" }}>■</span> Soon ({stats.soon})
            </div>
            <div>
              <span style={{ color: "#27ae60" }}>■</span> Planned ({stats.planned})
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h2>💰 Top 5 Most Expensive Purchases</h2>
          <div className="top-products">
            {forecastData
              .sort((a, b) => (b.estimated_monthly_cost || 0) - (a.estimated_monthly_cost || 0))
              .slice(0, 5)
              .map((product, index) => (
                <div key={product.product_id} className="top-product-item">
                  <div className="product-rank">{index + 1}</div>
                  <div className="product-info">
                    <div className="product-name">{product.name}</div>
                    <div className="product-cost">
                      ${product.estimated_monthly_cost?.toFixed(2) || "0.00"} / month
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="statistics-section">
        <h2>📈 Statistics</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <label>Total Products in Forecast:</label>
            <value>{forecastData.length}</value>
          </div>
          <div className="stat-item">
            <label>Products Requiring Purchase:</label>
            <value>{stats.urgent + stats.soon}</value>
          </div>
          <div className="stat-item">
            <label>Total Planned Purchases:</label>
            <value>{stats.planned}</value>
          </div>
          <div className="stat-item">
            <label>Average Purchase Frequency:</label>
            <value>
              {(
                forecastData.reduce((sum, item) => sum + (item.avg_days_between_purchases || 0), 0) /
                forecastData.length
              ).toFixed(0)} days
            </value>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseForecast;
