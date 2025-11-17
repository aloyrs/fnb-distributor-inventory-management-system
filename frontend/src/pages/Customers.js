// src/pages/Customers.js
import React, { useState, useEffect } from "react";
import { getCustomers } from "../api/inventoryApi";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const customerStatuses = ["active", "inactive"]; // Example statuses

  useEffect(() => {
    const loadCustomers = async () => {
      setLoading(true);
      const filters = {
        search: search,
        status: status,
      };

      try {
        const res = await getCustomers(filters);
        setCustomers(res.data);
      } catch (err) {
        console.error("Failed to load customers", err);
      } finally {
        setLoading(false);
      }
    };
    loadCustomers();
  }, [search, status]);

  const handleSearch = (e) => {
    e.preventDefault();
    // The useEffect hook handles the API call
  };

  return (
    <div>
      <h2>🧑‍🤝‍🧑 Customer Directory</h2>

      <form className="filter-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          {customerStatuses.map((s, index) => (
            <option key={index} value={s}>
              {s}
            </option>
          ))}
        </select>
      </form>

      {loading ? (
        <div>Loading Customers...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Recent Orders</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.customer_id}>
                <td>{c.customer_id}</td>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>{c.status}</td>
                <td>{c.orders.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Customers;
