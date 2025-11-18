// src/pages/Customers.js
import React, { useState, useEffect } from "react";
import { getCustomers, createCustomer } from "../api/inventoryApi";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  // State for the "Add Customer" modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addError, setAddError] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    customer_type: "retail", // Default value
    status: "active", // Default value
  });

  const customerStatuses = ["active", "inactive"]; // Example statuses

  const loadCustomers = async () => {
    setLoading(true);
    try {
      // Note: pass the current filters state here
      const res = await getCustomers({ search, status });
      setCustomers(res.data);
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
    }
  };

  // useEffect just calls the function above
  useEffect(() => {
    loadCustomers();
  }, [search, status]);

  const handleSearch = (e) => {
    e.preventDefault();
    // The useEffect hook handles the API call
  };

  // --- New Functions for Adding a Customer ---

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError(null);

    try {
      // Call the API function to create the customer
      await createCustomer(newCustomer);
      
      // Close modal and reset form
      setIsModalOpen(false);
      setNewCustomer({
        name: "", email: "", phone: "", address: "",
        customer_type: "retail", status: "active",
      });
      
      // Refresh the customer list to show the new one
      loadCustomers();
      
    } catch (err) {
      setAddError(err.response?.data?.error || "Failed to add customer. Please try again.");
    }
  };

  return (
    <div>
      <h2>🧑‍🤝‍🧑 Customer Directory</h2>

    <div className="toolbar">
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
      {/* Button to open the "Add Customer" modal */}
        <button className="add-button" onClick={() => setIsModalOpen(true)}>
          + Add New Customer
        </button>
      </div>

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

      {/* --- "Add Customer" Modal --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Customer</h2>
            <form onSubmit={handleAddSubmit}>
              {addError && <div className="error-message">{addError}</div>}
              
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={newCustomer.name}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={newCustomer.email}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={newCustomer.phone}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={newCustomer.address}
                  onChange={handleFormChange}
                ></textarea>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={newCustomer.status}
                  onChange={handleFormChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
