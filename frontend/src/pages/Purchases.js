// src/pages/Purchases.js
import React, { useState, useEffect } from "react";
import { getSupplierPurchases, createSupplierPurchase, getSuppliers, getProducts } from "../api/inventoryApi";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const purchaseStatuses = ["ordered", "completed"];
  // Initialize the navigate function
  const navigate = useNavigate();

  const [showAddForm, setShowAddForm] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    supplier_id: "",
    product_id: "",
    quantity: 1,
    unit_price: "",
    status: "ordered",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Function to handle row click and navigate
  const handleRowClick = (purchaseId) => {
    navigate(`/purchases/${purchaseId}`);
  };

  useEffect(() => {
    const loadPurchases = async () => {
      setLoading(true);
      const filters = {
        status: status,
      };

      try {
        const res = await getSupplierPurchases(filters);
        setPurchases(res.data);
      } catch (err) {
        console.error("Failed to load purchases", err);
      } finally {
        setLoading(false);
      }
    }
    loadPurchases();
  }, [status]);

  useEffect(() => {
    if (!showAddForm) return;
    const loadLookups = async () => {
      try {
        const [sRes, pRes] = await Promise.all([getSuppliers(), getProducts()]);
        setSuppliers(sRes.data);
        setProducts(pRes.data);
      } catch (err) {
        console.error("Failed to load suppliers or products", err);
      }
    };
    loadLookups();
  }, [showAddForm]);

  return (
    <div>
      <h2>🧾 Supplier Purchases</h2>

      <div className="filter-bar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          {purchaseStatuses.map((s, index) => (
            <option key={index} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div style={{ marginLeft: "auto", paddingRight: 20 }}>
          <button onClick={() => setShowAddForm((s) => !s)}>
            {showAddForm ? "Cancel" : "Add Purchase"}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="filter-bar" style={{ flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <select value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}>
              <option value="">Select Supplier</option>
              {suppliers.map((s) => (
                <option key={s.supplier_id} value={s.supplier_id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select value={form.product_id} onChange={(e) => {
              const pid = e.target.value;
              const prod = products.find((p) => String(p.product_id) === String(pid));
              setForm({ ...form, product_id: pid, unit_price: prod ? prod.unit_price : "" });
            }}>
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p.product_id} value={p.product_id}>
                  {p.name}
                </option>
              ))}
            </select>

            <input type="number" min="1" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />

            <input type="number" step="0.01" placeholder="Unit Cost" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {purchaseStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ flex: 1 }} />

            <button disabled={submitting} onClick={async () => {
              if (!form.supplier_id || !form.product_id || !form.quantity) {
                alert("Please select supplier, product and quantity");
                return;
              }
              if (!form.unit_price || parseFloat(form.unit_price) <= 0) {
                alert("Please enter a valid unit cost greater than 0");
                return;
              }
              setSubmitting(true);
              try {
                const payload = {
                  supplier_id: form.supplier_id,
                  purchase_date: new Date().toISOString(),
                  status: form.status,
                  notes: form.notes,
                  items: [
                    {
                      product_id: form.product_id,
                      quantity: form.quantity,
                      unit_price: parseFloat(form.unit_price),
                    },
                  ],
                };
                const res = await createSupplierPurchase(payload);
                // refresh list
                setShowAddForm(false);
                setForm({ supplier_id: "", product_id: "", quantity: 1, unit_price: "", status: "ordered", notes: "" });
                // reload purchases
                const updated = await getSupplierPurchases({ status });
                setPurchases(updated.data);
                alert("Purchase created (ID: " + res.data.purchase_id + ")");
              } catch (err) {
                console.error("Failed to create purchase", err);
                alert(err.response?.data?.error || err.message || "Failed to create purchase");
              } finally {
                setSubmitting(false);
              }
            }}>Create Purchase</button>
          </div>
        </div>
      )}

      {loading ? (
        <div>Loading Purchases...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Supplier</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              // The entire <tr> is now clickable
              <tr
                key={p.purchase_id}
                onClick={() => handleRowClick(p.purchase_id)}
                // Apply a style hint for better user experience
                style={{ cursor: "pointer" }}
              >
                <td>{p.purchase_id}</td>
                <td>{p.supplier?.name || "N/A"}</td>
                <td>{new Date(p.purchase_date).toLocaleDateString()}</td>
                <td>${parseFloat(p.total_amount).toFixed(2)}</td>
                <td>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p style={{ color: "#555", fontSize: "0.65em" }}>
        💡 Click any row to view the detailed purchase items.
      </p>
    </div>
  );
};

export default Purchases;
