// src/pages/Purchases.js
import React, { useState, useEffect } from "react";
import { getSupplierPurchases } from "../api/inventoryApi";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const purchaseStatuses = ["ordered", "completed"];
  // Initialize the navigate function
  const navigate = useNavigate();

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
    };
    loadPurchases();
  }, [status]);

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
      </div>

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
