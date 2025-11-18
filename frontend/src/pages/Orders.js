// src/pages/Orders.js
import React, { useState, useEffect } from "react";
import { getCustomerOrders, createOrder, getCustomers, getProducts } from "../api/inventoryApi";
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

  const [showAddForm, setShowAddForm] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    customer_id: "",
    product_id: "",
    quantity: 1,
    unit_price: "",
    status: "completed",
    shipping_address: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    if (!showAddForm) return;
    const loadLookups = async () => {
      try {
        const [cRes, pRes] = await Promise.all([getCustomers(), getProducts()]);
        setCustomers(cRes.data);
        setProducts(pRes.data);
      } catch (err) {
        console.error("Failed to load customers or products", err);
      }
    };
    loadLookups();
  }, [showAddForm]);

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
        <div style={{ marginLeft: "auto", paddingRight: 20 }}>
          <button onClick={() => setShowAddForm((s) => !s)}>
            {showAddForm ? "Cancel" : "Add Order"}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="filter-bar" style={{ flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.name}
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

            <input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />

            <input type="number" step="0.01" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} placeholder="Unit Price" />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {orderStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <input placeholder="Shipping address" value={form.shipping_address} onChange={(e) => setForm({ ...form, shipping_address: e.target.value })} />
            <input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

            <button disabled={submitting} onClick={async () => {
              // submit
              if (!form.customer_id || !form.product_id || !form.quantity) {
                alert('Please select customer, product and quantity');
                return;
              }
              setSubmitting(true);
              try {
                const payload = {
                  customer_id: form.customer_id,
                  order_date: new Date().toISOString(),
                  status: form.status,
                  shipping_address: form.shipping_address,
                  notes: form.notes,
                  items: [
                    {
                      product_id: form.product_id,
                      quantity: form.quantity,
                      unit_price: form.unit_price || 0,
                    },
                  ],
                };
                const res = await createOrder(payload);
                // refresh list
                setShowAddForm(false);
                setForm({ customer_id: "", product_id: "", quantity: 1, unit_price: "", status: "completed", shipping_address: "", notes: "" });
                // reload orders
                const updated = await getCustomerOrders({ status });
                setOrders(updated.data);
                alert('Order created (ID: ' + res.data.order_id + ')');
              } catch (err) {
                console.error('Failed to create order', err);
                alert(err.response?.data?.error || err.message || 'Failed to create order');
              } finally {
                setSubmitting(false);
              }
            }}>Create Order</button>
          </div>
        </div>
      )}

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
