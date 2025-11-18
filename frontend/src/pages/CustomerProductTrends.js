// src/pages/CustomerProductTrends.js
import React, { useState, useEffect } from "react";
import { getCustomerProductTrends } from "../api/inventoryApi";

const CustomerProductTrends = () => {
  const [trendsData, setTrendsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchCustomer, setSearchCustomer] = useState("");

  // Format: { "customerID-sectionType": true/false }
  const [openSections, setOpenSections] = useState({});

  useEffect(() => {
    fetchTrendsData();
  }, []);

  const fetchTrendsData = async () => {
    try {
      setLoading(true);
      const data = await getCustomerProductTrends();
      setTrendsData(data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to toggle sections
  const toggleSection = (customerId, sectionType) => {
    const key = `${customerId}-${sectionType}`;
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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

  if (loading) {
    return <div className="loading">Loading customer product trends...</div>;
  }

  return (
    <div className="trends-container">
      <h1>📊 Customer Product Trends Analysis</h1>
      <p className="page-description">
        Analyze which products each customer is ordering more (increasing) or less (declining). 
        Click on sections to expand or collapse details.
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
          filteredCustomers.map((customer) => {
            // Determine if sections are open
            // Default: Increasing/Declining = OPEN, Stable = CLOSED
            const isIncreasingOpen = openSections[`${customer.customer_id}-increasing`] ?? true;
            const isDecliningOpen = openSections[`${customer.customer_id}-declining`] ?? true;
            const isStableOpen = openSections[`${customer.customer_id}-stable`] ?? false;

            return (
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

                {/* Increasing Products Section */}
                {customer.increasing.length > 0 && (
                  <div className="trend-section increasing-section">
                    {/* Clickable Header */}
                    <div 
                      className="section-header" 
                      onClick={() => toggleSection(customer.customer_id, 'increasing')}
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div>
                        <h3>📈 Increasing Products</h3>
                        <p className="section-desc" style={{ marginBottom: 0 }}>
                          Customer is ordering more of these products
                        </p>
                      </div>
                      <span className="arrow">{isIncreasingOpen ? "▲" : "▼"}</span>
                    </div>

                    {/* Collapsible Content */}
                    {isIncreasingOpen && (
                      <div className="products-grid" style={{ marginTop: '15px' }}>
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
                                <label>Earlier:</label>
                                <span>{product.earlier_qty} units</span>
                              </div>
                              <div className="stat">
                                <label>Recent:</label>
                                <span>{product.recent_qty} units</span>
                              </div>
                              <div className="stat">
                                <label>Change:</label>
                                <span style={{ color: "#27ae60" }}>
                                  +{product.qty_change} units
                                </span>
                              </div>
                            </div>
                            <div className="action-hint">✅ Stock more of this</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Declining Products Section */}
                {customer.declining.length > 0 && (
                  <div className="trend-section declining-section">
                    {/* Clickable Header */}
                    <div 
                      className="section-header" 
                      onClick={() => toggleSection(customer.customer_id, 'declining')}
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div>
                        <h3>📉 Declining Products</h3>
                        <p className="section-desc" style={{ marginBottom: 0 }}>
                          Customer is ordering less of these products
                        </p>
                      </div>
                      <span className="arrow">{isDecliningOpen ? "▲" : "▼"}</span>
                    </div>

                    {/* Collapsible Content */}
                    {isDecliningOpen && (
                      <div className="products-grid" style={{ marginTop: '15px' }}>
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
                                <label>Earlier:</label>
                                <span>{product.earlier_qty} units</span>
                              </div>
                              <div className="stat">
                                <label>Recent:</label>
                                <span>{product.recent_qty} units</span>
                              </div>
                              <div className="stat">
                                <label>Change:</label>
                                <span style={{ color: "#e74c3c" }}>
                                  {product.qty_change} units
                                </span>
                              </div>
                            </div>
                            <div className="action-hint">⚠️ Check why declining</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Stable Products Section */}
                {customer.stable.length > 0 && (
                  <div className="trend-section stable-section">
                    {/* Clickable Header */}
                    <div 
                      className="section-header" 
                      onClick={() => toggleSection(customer.customer_id, 'stable')}
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div>
                        <h3>➡️ Stable Products</h3>
                        <p className="section-desc" style={{ marginBottom: 0 }}>
                          Consistent ordering pattern ({customer.stable.length} items)
                        </p>
                      </div>
                      <span className="arrow">{isStableOpen ? "▲" : "▼"}</span>
                    </div>

                    {/* Collapsible Content */}
                    {isStableOpen && (
                      <div className="products-grid" style={{ marginTop: '15px' }}>
                        {customer.stable.map((product) => (
                          <div key={product.product_id} className="product-card stable">
                            <div className="product-header">
                              <div className="product-name">{product.product_name}</div>
                              <div className="trend-badge stable-badge">Stable</div>
                            </div>
                            <div className="product-stats">
                              <div className="stat">
                                <label>Earlier:</label>
                                <span>{product.earlier_qty} units</span>
                              </div>
                              <div className="stat">
                                <label>Recent:</label>
                                <span>{product.recent_qty} units</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
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