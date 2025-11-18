// src/pages/Customers.js
import React, { useState, useEffect } from "react";
// 👇 Import update and delete functions
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from "../api/inventoryApi";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null); // Track who we are editing
  const [addError, setAddError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    customer_type: "retail",
    status: "active",
  });

  const customerStatuses = ["active", "inactive"];

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await getCustomers({ search, status });
      // Sort by ID
      const sortedData = res.data.sort((a, b) => a.customer_id - b.customer_id);
      setCustomers(sortedData);
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search, status]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
  };

  // --- CRUD Actions ---

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open Modal for Create
  const handleOpenCreate = () => {
    setEditingCustomer(null); // Not editing
    setFormData({
      name: "", email: "", phone: "", address: "", customer_type: "retail", status: "active",
    });
    setAddError(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (customer) => {
    setEditingCustomer(customer); // Set the customer being edited
    setFormData({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      customer_type: customer.customer_type || "retail",
      status: customer.status || "active",
    });
    setAddError(null);
    setIsModalOpen(true);
  };

  // Delete Action
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await deleteCustomer(id);
      loadCustomers(); // Refresh list
    } catch (err) {
      alert("Failed to delete customer: " + (err.response?.data?.error || err.message));
    }
  };

  // Submit Form (Handles both Create and Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAddError(null);

    try {
      if (editingCustomer) {
        // UPDATE existing
        await updateCustomer(editingCustomer.customer_id, formData);
      } else {
        // CREATE new
        await createCustomer(formData);
      }
      
      setIsModalOpen(false);
      loadCustomers(); // Refresh list
    } catch (err) {
      setAddError(err.response?.data?.error || "Operation failed. Please try again.");
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
            autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Status</option>
            {customerStatuses.map((s, index) => (
              <option key={index} value={s}>{s}</option>
            ))}
          </select>
        </form>
        <button className="add-button" onClick={handleOpenCreate}>
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
              <th>Actions</th> {/* New Column */}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.customer_id}>
                <td>{c.customer_id}</td>
                <td>{c.name}</td>
                <td>{c.email || "N/A"}</td>
                <td>{c.phone || "N/A"}</td>
                <td>{c.status}</td>
                <td>{c.orders ? c.orders.length : 0}</td>
                <td className="actions-cell">
                  {/* Edit Button */}
                  <button 
                    className="edit-btn" 
                    onClick={() => handleOpenEdit(c)}
                    style={{ marginRight: "5px", padding: "5px 10px", backgroundColor: "#f39c12", border: "none", borderRadius: "4px", color: "white", cursor: "pointer" }}
                  >
                    Edit
                  </button>
                  {/* Delete Button */}
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDelete(c.customer_id, c.name)}
                    style={{ padding: "5px 10px", backgroundColor: "#e74c3c", border: "none", borderRadius: "4px", color: "white", cursor: "pointer" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingCustomer ? "Edit Customer" : "Add New Customer"}</h2>
            <form onSubmit={handleSubmit}>
              {addError && <div className="error-message">{addError}</div>}
              
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                ></textarea>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
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
                  {editingCustomer ? "Update Customer" : "Save Customer"}
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