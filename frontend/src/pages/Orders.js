// src/pages/Orders.js
import React, { useState, useEffect } from "react";
import { getCustomerOrders } from "../api/inventoryApi";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const orderStatuses = [
    "completed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  const navigate = useNavigate();

  const handleRowClick = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      const filters = {
        status: status,
      };

      try {
        const res = await getCustomerOrders(filters);
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [status]);

  return (
    <div>
      <h2>🛒 Customer Orders</h2>

      <div className="filter-bar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          {orderStatuses.map((s, index) => (
            <option key={index} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div>Loading Orders...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr
                key={o.order_id}
                onClick={() => handleRowClick(o.order_id)}
                style={{ cursor: "pointer" }}
              >
                <td>{o.order_id}</td>
                <td>{o.customer?.name || "N/A"}</td>
                <td>{new Date(o.order_date).toLocaleDateString()}</td>
                <td>${parseFloat(o.total_amount).toFixed(2)}</td>
                <td>{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p style={{ color: "#555", fontSize: "0.65em" }}>
        💡 Click any row to view the detailed order items.
      </p>
    </div>
  );
};

export default Orders;
