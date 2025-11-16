import React, { useState, useEffect } from "react";
import axios from "axios";

const CustomerProductTrends = () => {
  const [trendsData, setTrendsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchCustomer, setSearchCustomer] = useState("");

  useEffect(() => {
    fetchTrendsData();
  }, []);

  const fetchTrendsData = async () => {
    try {
      setLoading(true);
      const API_BASE_URL =
        process.env.REACT_APP_API_BASE_URL || "http://localhost:3000/api";
      const response = await axios.get(
        `${API_BASE_URL}/customers/trends/product-analysis`
      );
      setTrendsData(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Group data by customer
  const customerGroups = {};
  trendsData.forEach((item) => {
    if (!customerGroups[item.customer_id]) {
      customerGroups[item.customer_id] = {
        customer_id: item.customer_id,
        customer_name: item.customer_name,
        increasing: [],
        declining: [],
        stable: [],
      };
    }
    if (item.trend === "INCREASING") {
      customerGroups[item.customer_id].increasing.push(item);
    } else if (item.trend === "DECLINING") {
      customerGroups[item.customer_id].declining.push(item);
    } else {
      customerGroups[item.customer_id].stable.push(item);
    }
  });

  const customers = Object.values(customerGroups);

  // Filter customers based on search
  const filteredCustomers = customers.filter((customer) =>
    customer.customer_name.toLowerCase().includes(searchCustomer.toLowerCase())
  );

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "INCREASING":
        return "📈";
      case "DECLINING":
        return "📉";
      case "STABLE":
        return "➡️";
      default:
        return "❓";
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case "INCREASING":
        return "#27ae60"; // green
      case "DECLINING":
        return "#e74c3c"; // red
      case "STABLE":
        return "#95a5a6"; // gray
      default:
        return "#3498db"; // blue
    }
  };

  if (loading) {
    return <div className="loading">Loading customer product trends...</div>;
  }

  return (
    <div className="trends-container">
      <h1>📊 Customer Product Trends Analysis</h1>
      <p className="page-description">
        Analyze which products each customer is ordering more (increasing) or less (declining). Use this to better address customer needs and adjust recommendations.
      </p>

      {error && <div className="error-message">{error}</div>}

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search customers..."
          value={searchCustomer}
          onChange={(e) => setSearchCustomer(e.target.value)}
        />
        <p className="result-count">
          Showing {filteredCustomers.length} of {customers.length} customers
        </p>
      </div>

      {/* Customer Trend Cards */}
      <div className="customers-list">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <div key={customer.customer_id} className="customer-card">
              <div className="customer-header">
                <h2>👤 {customer.customer_name}</h2>
                <div className="trend-summary">
                  <span className="badge increasing">
                    📈 {customer.increasing.length} Increasing
                  </span>
                  <span className="badge declining">
                    📉 {customer.declining.length} Declining
                  </span>
                  {customer.stable.length > 0 && (
                    <span className="badge stable">
                      ➡️ {customer.stable.length} Stable
                    </span>
                  )}
                </div>
              </div>

              {/* Increasing Products */}
              {customer.increasing.length > 0 && (
                <div className="trend-section increasing-section">
                  <h3>📈 Increasing Products</h3>
                  <p className="section-desc">
                    Customer is ordering more of these products
                  </p>
                  <div className="products-grid">
                    {customer.increasing.map((product) => (
                      <div key={product.product_id} className="product-card increasing">
                        <div className="product-header">
                          <div className="product-name">{product.product_name}</div>
                          <div className="trend-badge increasing-badge">
                            ↑ {product.change_percentage > 0 ? "+" : ""}
                            {product.change_percentage}%
                          </div>
                        </div>
                        <div className="product-stats">
                          <div className="stat">
                            <label>Earlier Period:</label>
                            <value>{product.earlier_qty} units</value>
                          </div>
                          <div className="stat">
                            <label>Recent Period:</label>
                            <value>{product.recent_qty} units</value>
                          </div>
                          <div className="stat">
                            <label>Change:</label>
                            <value style={{ color: "#27ae60" }}>
                              +{product.qty_change} units
                            </value>
                          </div>
                          <div className="stat">
                            <label>Order Frequency:</label>
                            <value>
                              {product.earlier_orders} → {product.recent_orders} orders
                            </value>
                          </div>
                        </div>
                        <div className="action-hint">✅ Stock more of this</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Declining Products */}
              {customer.declining.length > 0 && (
                <div className="trend-section declining-section">
                  <h3>📉 Declining Products</h3>
                  <p className="section-desc">
                    Customer is ordering less of these products
                  </p>
                  <div className="products-grid">
                    {customer.declining.map((product) => (
                      <div key={product.product_id} className="product-card declining">
                        <div className="product-header">
                          <div className="product-name">{product.product_name}</div>
                          <div className="trend-badge declining-badge">
                            ↓ {product.change_percentage}%
                          </div>
                        </div>
                        <div className="product-stats">
                          <div className="stat">
                            <label>Earlier Period:</label>
                            <value>{product.earlier_qty} units</value>
                          </div>
                          <div className="stat">
                            <label>Recent Period:</label>
                            <value>{product.recent_qty} units</value>
                          </div>
                          <div className="stat">
                            <label>Change:</label>
                            <value style={{ color: "#e74c3c" }}>
                              {product.qty_change} units
                            </value>
                          </div>
                          <div className="stat">
                            <label>Order Frequency:</label>
                            <value>
                              {product.earlier_orders} → {product.recent_orders} orders
                            </value>
                          </div>
                        </div>
                        <div className="action-hint">⚠️ Check why declining</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stable Products */}
              {customer.stable.length > 0 && (
                <div className="trend-section stable-section">
                  <h3>➡️ Stable Products</h3>
                  <p className="section-desc">Consistent ordering pattern</p>
                  <div className="products-grid">
                    {customer.stable.map((product) => (
                      <div key={product.product_id} className="product-card stable">
                        <div className="product-header">
                          <div className="product-name">{product.product_name}</div>
                          <div className="trend-badge stable-badge">Stable</div>
                        </div>
                        <div className="product-stats">
                          <div className="stat">
                            <label>Earlier Period:</label>
                            <value>{product.earlier_qty} units</value>
                          </div>
                          <div className="stat">
                            <label>Recent Period:</label>
                            <value>{product.recent_qty} units</value>
                          </div>
                          <div className="stat">
                            <label>Orders:</label>
                            <value>{product.recent_orders}</value>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No customers found matching "{searchCustomer}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProductTrends;
