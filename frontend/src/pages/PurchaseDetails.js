import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getSupplierPurchaseDetails,
  createPurchaseItem,
  updatePurchaseItem,
  deletePurchaseItem,
  getProducts,
} from "../api/inventoryApi";

const PurchaseDetails = () => {
  const { purchaseId } = useParams();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);

  // Removed newItem state as it's now local to the modal for better input control

  const [editingItemId, setEditingItemId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPurchaseDetails = async () => {
    if (!purchaseId) {
      setError("No Purchase ID provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await getSupplierPurchaseDetails(purchaseId);
      setPurchase(res.data);
    } catch (err) {
      console.error(`Failed to load Purchase ${purchaseId}`, err);
      setError(
        `Failed to load purchase: ${err.message || "An error occurred"}`
      );
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
    fetchPurchaseDetails();
    fetchProducts();
  }, [purchaseId]);

  // Modified handleCreateItem to accept the item data directly
  const handleCreateItem = async (newItemData) => {
    try {
      // The newItemData is already parsed to numbers by the modal's handler
      await createPurchaseItem(purchaseId, newItemData);
      // We don't need to reset a global newItem state anymore
      setIsModalOpen(false);
      await fetchPurchaseDetails();
    } catch (err) {
      alert(
        "Failed to add item: " + (err.response?.data?.error || err.message)
      );
    }
  };

  const handleUpdateItem = async (itemId, updatedData) => {
    console.log(
      `Attempting to update Purchase ${purchaseId}, Item ${itemId} with data:`,
      updatedData
    );

    try {
      await updatePurchaseItem(purchaseId, itemId, updatedData);
      setEditingItemId(null);
      await fetchPurchaseDetails();
    } catch (err) {
      alert(
        "Failed to update item: " + (err.response?.data?.error || err.message)
      );
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this purchase item? This will affect stock levels."
      )
    )
      return;
    try {
      await deletePurchaseItem(purchaseId, itemId);
      await fetchPurchaseDetails();
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

  if (loading && !purchase) {
    return <div className="loading">Loading Purchase Details...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!purchase) {
    return (
      <div className="not-found">Purchase with ID {purchaseId} not found.</div>
    );
  }

  const PurchaseItemRow = ({ item }) => {
    const isEditing = editingItemId === item.item_id;

    const [editData, setEditData] = useState({
      quantity: item.quantity,
      unit_cost: item.unit_cost,
    });

    const handleSave = () => {
      handleUpdateItem(item.item_id, {
        quantity: parseFloat(editData.quantity),
        unit_cost: parseFloat(editData.unit_cost),
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
        <td>
          {isEditing ? (
            <input
              type="number"
              value={editData.unit_cost}
              onChange={(e) =>
                setEditData({ ...editData, unit_cost: e.target.value })
              }
              min="0.01"
              step="0.01"
              style={{ width: "100px" }}
            />
          ) : (
            formatCurrency(item.unit_cost)
          )}
        </td>
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
                Edit
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
    // 1. Local state to manage input strings (instant update)
    const [localNewItem, setLocalNewItem] = useState({
      product_id: "",
      quantity: "1", // Initialize as string for smoother input
      unit_cost: "0.00", // Initialize as string for smoother input
    });

    // Reset local state when the modal opens/closes
    useEffect(() => {
      if (isOpen) {
        setLocalNewItem({
          product_id: "",
          quantity: "1",
          unit_cost: "0.00",
        });
      }
    }, [isOpen]);

    if (!isOpen) return null;

    // 2. Handler to convert and submit on click
    const handleModalSubmit = (e) => {
      e.preventDefault();

      const { product_id, quantity, unit_cost } = localNewItem;

      // Ensure product is selected (though 'required' should handle this)
      if (!product_id) {
        alert("Please select a product.");
        return;
      }

      // Parse and validate numbers here before calling the API handler
      const parsedQuantity = parseInt(quantity, 10);
      const parsedUnitCost = parseFloat(unit_cost);

      if (isNaN(parsedQuantity) || parsedQuantity < 1) {
        alert("Quantity must be a number greater than 0.");
        return;
      }
      if (isNaN(parsedUnitCost) || parsedUnitCost <= 0) {
        alert("Unit Cost must be a number greater than 0.");
        return;
      }

      // Call the main handler with the correctly formatted data
      handleCreateItem({
        product_id: product_id,
        quantity: parsedQuantity,
        unit_cost: parsedUnitCost,
      });

      // The main handler closes the modal on success, so no need to call onClose here
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
            width: "500px", // Increased size here
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3>➕ Add New Item to Purchase</h3>
          <form onSubmit={handleModalSubmit} className="add-item-form">
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Product:
              </label>
              <select
                value={localNewItem.product_id}
                onChange={(e) =>
                  setLocalNewItem({
                    ...localNewItem,
                    product_id: e.target.value,
                  })
                }
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
                Unit Cost:
              </label>
              <input
                type="number"
                placeholder="Unit Cost"
                value={localNewItem.unit_cost}
                onChange={(e) =>
                  setLocalNewItem({
                    ...localNewItem,
                    unit_cost: e.target.value,
                  })
                }
                min="0.01"
                step="0.01"
                required
                style={{ width: "100%", padding: "8px", borderRadius: "4px" }}
              />
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
    <div className="purchase-details-page">
      <Link to="/purchases" className="back-link">
        ← Back to All Purchases
      </Link>
      <h2>🧾 Purchase #{purchase.purchase_id} Details</h2>

      <div className="purchase-summary-card">
        <h3>Summary</h3>
        <div className="summary-grid">
          <p>
            <strong>Supplier:</strong> {purchase.supplier?.name || "N/A"}
          </p>
          <p>
            <strong>Date:</strong> {formatDate(purchase.purchase_date)}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className={`status-${purchase.status}`}>
              {purchase.status}
            </span>
          </p>
          <p>
            <strong>Total Amount:</strong>{" "}
            <span className="total-amount">
              {formatCurrency(purchase.total_amount)}
            </span>
          </p>

          <p>
            <strong>Note:</strong> <span>{purchase.notes}</span>
          </p>
        </div>
      </div>

      <div className="purchase-items-section">
        <h3>Purchase Items</h3>

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
              <th>Unit Cost</th>
              <th>Subtotal</th>
              <th className="actions-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchase.items && purchase.items.length > 0 ? (
              purchase.items.map((item) => (
                <PurchaseItemRow key={item.item_id} item={item} />
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-items">
                  No items found for this purchase.
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

export default PurchaseDetails;
