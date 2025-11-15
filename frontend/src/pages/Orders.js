// src/pages/Orders.js
import React, { useState, useEffect } from "react";
import { getCustomerOrders } from "../api/inventoryApi";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const orderStatuses = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      const filters = {
        status: status,
        // You can add logic for startDate and endDate here
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
          <option value="">All Statuses</option>
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
              <tr key={o.order_id}>
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
    </div>
  );
};

export default Orders;
