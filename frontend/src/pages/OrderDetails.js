// src/pages/OrderDetails.js
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getCustomerOrderDetails,
  createOrderItem,
  updateOrderItem,
  deleteOrderItem,
  getProducts,
} from "../api/inventoryApi";

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);

  // State declarations added to fix ESLint errors
  const [editingItemId, setEditingItemId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrderDetails = async () => {
    if (!orderId) {
      setError("No Order ID provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await getCustomerOrderDetails(orderId);
      setOrder(res.data);
    } catch (err) {
      console.error(`Failed to load Order ${orderId}`, err);
      setError(`Failed to load order: ${err.message || "An error occurred"}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products", err);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
    fetchProducts();
  }, [orderId]);

  const handleCreateItem = async (newItemData) => {
    try {
      // The newItemData already contains the correct unit_price from the modal logic
      await createOrderItem(orderId, newItemData);
      setIsModalOpen(false);
      await fetchOrderDetails();
    } catch (err) {
      alert(
        "Failed to add item: " + (err.response?.data?.error || err.message)
      );
    }
  };

  // Only allow updating quantity, not unit_price
  const handleUpdateItem = async (itemId, updatedData) => {
    console.log(
      `Attempting to update Order ${orderId}, Item ${itemId} with quantity:`,
      updatedData.quantity
    );

    try {
      // Only pass the quantity property to the update function
      // The backend (customerOrders.js) now handles retrieving the existing unit_price.
      await updateOrderItem(orderId, itemId, {
        quantity: updatedData.quantity,
      });
      setEditingItemId(null);
      await fetchOrderDetails();
    } catch (err) {
      alert(
        "Failed to update item: " + (err.response?.data?.error || err.message)
      );
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this order item? This will affect stock levels."
      )
    )
      return;
    try {
      await deleteOrderItem(orderId, itemId);
      await fetchOrderDetails();
    } catch (err) {
      alert(
        "Failed to delete item: " + (err.response?.data?.error || err.message)
      );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount);
    return isNaN(num) ? "$0.00" : `$${num.toFixed(2)}`;
  };

  if (loading && !order) {
    return <div className="loading">Loading Order Details...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!order) {
    return <div className="not-found">Order with ID {orderId} not found.</div>;
  }

  const OrderItemRow = ({ item }) => {
    const isEditing = editingItemId === item.item_id;

    // State only tracks quantity since price is fixed
    const [editData, setEditData] = useState({
      quantity: item.quantity,
    });

    const handleSave = () => {
      handleUpdateItem(item.item_id, {
        quantity: parseFloat(editData.quantity),
        // unit_price is explicitly not included
      });
    };

    return (
      <tr key={item.item_id}>
        <td>{item.product?.name || "Product N/A"}</td>
        <td>
          {isEditing ? (
            <input
              type="number"
              value={editData.quantity}
              onChange={(e) =>
                setEditData({ ...editData, quantity: e.target.value })
              }
              min="1"
              style={{ width: "80px" }}
            />
          ) : (
            item.quantity
          )}
        </td>
        {/* Unit Price is displayed but NOT editable (no input field) */}
        <td>{formatCurrency(item.unit_price)}</td>
        <td>{formatCurrency(item.subtotal)}</td>
        <td className="actions">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="save-btn">
                Save
              </button>
              <button
                onClick={() => setEditingItemId(null)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditingItemId(item.item_id)}
                className="edit-btn"
              >
                Edit Quantity
              </button>
              <button
                onClick={() => handleDeleteItem(item.item_id)}
                className="delete-btn"
              >
                Delete
              </button>
            </>
          )}
        </td>
      </tr>
    );
  };

  const AddItemModal = ({ isOpen, onClose }) => {
    const [localNewItem, setLocalNewItem] = useState({
      product_id: "",
      quantity: "1",
      unit_price: "", // Will be auto-populated
    });

    const selectedProduct = products.find(
      (p) => String(p.product_id) === localNewItem.product_id
    );

    useEffect(() => {
      if (isOpen) {
        setLocalNewItem({
          product_id: "",
          quantity: "1",
          unit_price: "",
        });
      }
    }, [isOpen]);

    const handleProductChange = (e) => {
      const newProductId = e.target.value;
      const product = products.find(
        (p) => String(p.product_id) === newProductId
      );

      setLocalNewItem({
        ...localNewItem,
        product_id: newProductId,
        // Auto-populate unit_price from the product object
        unit_price: product ? String(product.unit_price) : "",
      });
    };

    if (!isOpen) return null;

    const handleModalSubmit = (e) => {
      e.preventDefault();

      const { product_id, quantity, unit_price } = localNewItem;

      if (!product_id) {
        alert("Please select a product.");
        return;
      }

      if (!unit_price || parseFloat(unit_price) <= 0) {
        alert("Selected product has no valid unit price defined.");
        return;
      }

      const parsedQuantity = parseInt(quantity, 10);
      const parsedUnitPrice = parseFloat(unit_price);

      if (isNaN(parsedQuantity) || parsedQuantity < 1) {
        alert("Quantity must be a number greater than 0.");
        return;
      }

      handleCreateItem({
        product_id: product_id,
        quantity: parsedQuantity,
        unit_price: parsedUnitPrice,
      });
    };

    return (
      <div
        className="modal-overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
        onClick={onClose}
      >
        <div
          className="modal-content"
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "8px",
            width: "500px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3>➕ Add New Item to Order</h3>
          <form onSubmit={handleModalSubmit} className="add-item-form">
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Product:
              </label>
              <select
                value={localNewItem.product_id}
                onChange={handleProductChange}
                required
                style={{ width: "100%", padding: "8px", borderRadius: "4px" }}
              >
                <option value="">-- Select Product --</option>
                {products.map((p) => (
                  <option key={p.product_id} value={p.product_id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Quantity:
              </label>
              <input
                type="number"
                placeholder="Quantity"
                value={localNewItem.quantity}
                onChange={(e) =>
                  setLocalNewItem({ ...localNewItem, quantity: e.target.value })
                }
                min="1"
                required
                style={{ width: "100%", padding: "8px", borderRadius: "4px" }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Unit Price:
              </label>
              {/* Unit price is a read-only display based on the selected product */}
              <p
                style={{
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  backgroundColor: "#f0f0f0",
                }}
              >
                {localNewItem.unit_price
                  ? formatCurrency(localNewItem.unit_price)
                  : "Select a product..."}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                className="cancel-btn"
                style={{ flexGrow: 1, padding: "10px" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-btn"
                // Disable if no valid unit_price is set
                disabled={
                  !localNewItem.unit_price ||
                  parseFloat(localNewItem.unit_price) <= 0
                }
                style={{ flexGrow: 1, padding: "10px" }}
              >
                Add Item
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="order-details-page">
      <Link to="/orders" className="back-link">
        ← Back to All Orders
      </Link>
      <h2>🛒 Order #{order.order_id} Details</h2>

      <div className="order-summary-card">
        <h3>Summary</h3>
        <div className="summary-grid">
          <p>
            <strong>Customer:</strong> {order.customer?.name || "N/A"}
          </p>
          <p>
            <strong>Date:</strong> {formatDate(order.order_date)}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className={`status-${order.status}`}>{order.status}</span>
          </p>
          <p>
            <strong>Total Amount:</strong>{" "}
            <span className="total-amount">
              {formatCurrency(order.total_amount)}
            </span>
          </p>
          <p>
            <strong>Shipping Address:</strong> {order.shipping_address || "N/A"}
          </p>
          <p>
            <strong>Notes:</strong> {order.notes || "N/A"}
          </p>
        </div>
      </div>

      <div className="order-items-section">
        <h3>Order Items</h3>

        <div>
          <button onClick={() => setIsModalOpen(true)} className="add-item-btn">
            ➕ Add New Item
          </button>
        </div>
        <table className="items-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Subtotal</th>
              <th className="actions-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {order.items && order.items.length > 0 ? (
              order.items.map((item) => (
                <OrderItemRow key={item.item_id} item={item} />
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-items">
                  No items found for this order.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default OrderDetails;
