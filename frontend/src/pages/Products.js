import React, { useState, useEffect } from "react";
import {
  getProducts,
  getProductCategories,
  getSuppliers,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/inventoryApi";

const ProductFormModal = ({
  isOpen,
  onClose,
  product,
  categories,
  suppliers,
  onSubmit,
}) => {
  const isEditing = !!product;
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    unit_price: "",
    stock_quantity: "",
    reorder_level: "",
    supplier_id: "",
    ...product,
    supplier_id: product?.supplier_id ? String(product.supplier_id) : "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        description: "",
        category: "",
        unit_price: "",
        stock_quantity: "",
        reorder_level: "",
        supplier_id:
          suppliers.length > 0 ? String(suppliers[0].supplier_id) : "",
        ...product,
        supplier_id: product?.supplier_id
          ? String(product.supplier_id)
          : suppliers.length > 0
          ? String(suppliers[0].supplier_id)
          : "",
      });
    }
  }, [isOpen, product, suppliers]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.supplier_id) {
      alert("Please select a supplier.");
      return;
    }

    const submittedData = {
      ...formData,
      unit_price: parseFloat(formData.unit_price) || 0,
      stock_quantity: parseInt(formData.stock_quantity, 10) || 0,
      reorder_level: parseInt(formData.reorder_level, 10) || 0,
      supplier_id: parseInt(formData.supplier_id, 10),
    };
    onSubmit(submittedData);
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
        <h3>
          {isEditing
            ? `✏️ Edit Product ID: ${product.product_id}`
            : "➕ Add New Product"}
        </h3>
        <form onSubmit={handleSubmit} className="product-form">
          {/* Name */}
          <div style={{ marginBottom: "10px" }}>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: "10px" }}>
            <label>Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", minHeight: "80px" }}
            />
          </div>

          {/* Category */}
          <div style={{ marginBottom: "10px" }}>
            <label>Category:</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px" }}
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Supplier */}
          <div style={{ marginBottom: "10px" }}>
            <label>Supplier:</label>
            <select
              name="supplier_id"
              value={formData.supplier_id}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px" }}
            >
              <option value="">-- Select Supplier --</option>
              {suppliers.map((s) => (
                <option key={s.supplier_id} value={s.supplier_id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Unit Price */}
          <div style={{ marginBottom: "10px" }}>
            <label>Unit Price ($):</label>
            <input
              type="number"
              name="unit_price"
              value={formData.unit_price}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          {/* Stock Quantity */}
          <div style={{ marginBottom: "10px" }}>
            <label>Stock Quantity:</label>
            <input
              type="number"
              name="stock_quantity"
              value={formData.stock_quantity}
              onChange={handleChange}
              min="0"
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          {/* Reorder Level */}
          <div style={{ marginBottom: "20px" }}>
            <label>Reorder Level:</label>
            <input
              type="number"
              name="reorder_level"
              value={formData.reorder_level}
              onChange={handleChange}
              min="0"
              required
              style={{ width: "100%", padding: "8px" }}
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
              style={{ flexGrow: 1, padding: "10px" }}
            >
              Cancel
            </button>
            <button type="submit" style={{ flexGrow: 1, padding: "10px" }}>
              {isEditing ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]); // New state for suppliers
  const [loading, setLoading] = useState(true);

  // State for CRUD Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // State for filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [lowStock, setLowStock] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    const filters = {
      search: search,
      category: category,
      lowStock: lowStock ? "true" : undefined,
    };

    try {
      const res = await getProducts(filters);
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products", err);
      // alert("Failed to load products."); // Disabled to avoid annoyance
    } finally {
      setLoading(false);
    }
  };

  // Effect to load metadata (categories and suppliers)
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [categoriesRes, suppliersRes] = await Promise.all([
          getProductCategories(),
          getSuppliers({}), // Fetch all suppliers
        ]);
        setCategories(categoriesRes.data);
        setSuppliers(suppliersRes.data);
      } catch (err) {
        console.error("Failed to load metadata (categories/suppliers)", err);
      }
    };
    loadMetadata();
  }, []);

  // Effect to load products based on filters
  useEffect(() => {
    fetchProducts();
  }, [search, category, lowStock]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleCreateOrUpdateProduct = async (data) => {
    try {
      if (editingProduct) {
        // Update existing product
        await updateProduct(editingProduct.product_id, data);
        alert("Product updated successfully!");
      } else {
        // Create new product
        await createProduct(data);
        alert("Product created successfully!");
      }
      handleCloseModal();
      fetchProducts(); // Refresh the list
    } catch (err) {
      console.error(
        `Failed to ${editingProduct ? "update" : "create"} product`,
        err
      );
      alert(
        `Failed to ${editingProduct ? "update" : "create"} product: ` +
          (err.response?.data?.error || err.message)
      );
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete product: ${productName}?`
      )
    ) {
      return;
    }
    try {
      await deleteProduct(productId);
      alert("Product deleted successfully!");
      fetchProducts(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete product", err);
      alert(
        "Failed to delete product: " +
          (err.response?.data?.error || err.message)
      );
    }
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount);
    return isNaN(num) ? "$0.00" : `$${num.toFixed(2)}`;
  };

  return (
    <div>
      <h2>📦 Product Inventory</h2>

      <div className="controls" style={{ marginBottom: "20px" }}>
        <button onClick={handleOpenCreateModal} className="add-product-btn">
          ➕ Add New Product
        </button>
      </div>

      <form className="filter-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <label>
          <input
            type="checkbox"
            checked={lowStock}
            onChange={(e) => setLowStock(e.target.checked)}
          />
          Low Stock (&lt; 100)
        </label>
      </form>

      {loading ? (
        <div>Loading Products...</div>
      ) : (
        <table className="products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th> {/* New column */}
              <th>Category</th>
              <th>Unit Price</th>
              <th>Stock</th>
              <th>Reorder Level</th>
              <th>Supplier</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.product_id}>
                <td>{p.product_id}</td>
                <td>{p.name}</td>
                <td
                  style={{
                    maxWidth: "200px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.description || "N/A"}
                </td>{" "}
                {/* Display description */}
                <td>{p.category}</td>
                <td>{formatCurrency(p.unit_price)}</td>
                <td>{p.stock_quantity}</td>
                <td>{p.reorder_level}</td>
                <td>{p.supplier?.name || "N/A"}</td>
                <td className="actions">
                  <button
                    onClick={() => handleOpenEditModal(p)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p.product_id, p.name)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={editingProduct}
        categories={categories}
        suppliers={suppliers} // Pass suppliers list
        onSubmit={handleCreateOrUpdateProduct}
      />
    </div>
  );
};

export default Products;
