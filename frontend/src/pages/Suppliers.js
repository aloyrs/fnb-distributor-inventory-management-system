// src/pages/Suppliers.js
import React, { useState, useEffect } from "react";
import { getSuppliers, getSupplierRegions, createSupplier, updateSupplier, deleteSupplier } from "../api/inventoryApi";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null); // Track editing state
  const [addError, setAddError] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    region: "",       
    status: "Active", 
  });

  useEffect(() => {
    const loadRegions = async () => {
      try {
        const res = await getSupplierRegions();
        setRegions(res.data);
      } catch (err) {
        console.error("Failed to load regions", err);
      }
    };
    loadRegions();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    const filters = { search: search, region: region };

    try {
      const res = await getSuppliers(filters);
      const sortedData = res.data.sort((a, b) => a.supplier_id - b.supplier_id);
      setSuppliers(sortedData);
    } catch (err) {
      console.error("Failed to load suppliers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [search, region]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open Modal for Create
  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setFormData({
      name: "", contact_person: "", email: "", phone: "", address: "", region: "", status: "Active",
    });
    setAddError(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact_person: supplier.contact_person || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      region: supplier.region || "",
      status: supplier.status || "Active",
    });
    setAddError(null);
    setIsModalOpen(true);
  };

  // Delete Logic
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete supplier: ${name}?`)) return;

    try {
      await deleteSupplier(id);
      loadSuppliers();
    } catch (err) {
      alert("Failed to delete supplier: " + (err.response?.data?.error || err.message));
    }
  };

  // Submit Logic (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAddError(null);

    try {
      if (editingSupplier) {
        // Update
        await updateSupplier(editingSupplier.supplier_id, formData);
      } else {
        // Create
        await createSupplier(formData);
      }
      
      setIsModalOpen(false);
      loadSuppliers(); 
    } catch (err) {
      setAddError(err.response?.data?.error || "Operation failed. Please try again.");
    }
  };

  return (
    <div>
      <h2>🚛 Supplier Partners</h2>

      <div className="toolbar">
        <form className="filter-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by name or contact..."
            autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">All Regions</option>
            {regions.map((r, index) => (
              <option key={index} value={r}>{r}</option>
            ))}
          </select>
        </form>
        <button className="add-button" onClick={handleOpenCreate}>
          + Add New Supplier
        </button>
      </div>

      {loading ? (
        <div>Loading Suppliers...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Region</th> 
              <th>Status</th>
              <th>Actions</th> {/* New Column */}
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.supplier_id}>
                <td>{s.supplier_id}</td>
                <td>{s.name}</td>
                <td>{s.contact_person || "N/A"}</td>
                <td>{s.email || "N/A"}</td>
                <td>{s.phone || "N/A"}</td>
                <td>{s.region || "N/A"}</td>
                <td>{s.status || "Active"}</td> 
                <td className="actions-cell">
                  <button 
                    onClick={() => handleOpenEdit(s)}
                    style={{ marginRight: "5px", padding: "5px 10px", backgroundColor: "#f39c12", border: "none", borderRadius: "4px", color: "white", cursor: "pointer" }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(s.supplier_id, s.name)}
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
            <h2>{editingSupplier ? "Edit Supplier" : "Add New Supplier"}</h2>
            <form onSubmit={handleSubmit}>
              {addError && <div className="error-message">{addError}</div>}

              <div className="form-group">
                <label>Supplier Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Contact Person</label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label>Region</label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleFormChange}
                >
                  <option value="">-- Select Region --</option>
                  {regions.map((r, index) => (
                    <option key={index} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingSupplier ? "Update Supplier" : "Save Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;