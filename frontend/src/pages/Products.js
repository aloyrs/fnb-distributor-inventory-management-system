// src/pages/Products.js
import React, { useState, useEffect, useCallback } from "react";
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
    unit_price: "",
    stock_quantity: "",
    reorder_level: "",
    ...product,
    // Ensure we use the ID for the initial state
    category_id: product?.category_id ? String(product.category_id) : "",
    supplier_id: product?.supplier_id ? String(product.supplier_id) : "",
  });

  useEffect(() => {
    if (isOpen) {
      // Logic to determine initial IDs
      let initialSupplierId = "";
      if (product?.supplier_id) {
        initialSupplierId = String(product.supplier_id);
      } else if (suppliers.length > 0) {
        initialSupplierId = String(suppliers[0].supplier_id);
      }

      let initialCategoryId = "";
      if (product?.category_id) {
        initialCategoryId = String(product.category_id);
      } else if (product?.category?.category_id) {
        // Fallback if category_id isn't on the root object but inside the nested object
        initialCategoryId = String(product.category.category_id);
      }

      setFormData({
        name: product?.name || "",
        description: product?.description || "",
        unit_price: product?.unit_price || "",
        stock_quantity: product?.stock_quantity || "",
        reorder_level: product?.reorder_level || "",
        ...product,
        category_id: initialCategoryId,
        supplier_id: initialSupplierId,
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
    
    if (!formData.category_id) {
      alert("Please select a category.");
      return;
    }

    const submittedData = {
      ...formData,
      unit_price: parseFloat(formData.unit_price) || 0,
      stock_quantity: parseInt(formData.stock_quantity, 10) || 0,
      reorder_level: parseInt(formData.reorder_level, 10) || 0,
      supplier_id: parseInt(formData.supplier_id, 10),
      category_id: parseInt(formData.category_id, 10),
    };
    
    // Remove the old 'category' string property if it exists to avoid confusion
    delete submittedData.category; 

    onSubmit(submittedData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>
          {isEditing
            ? `✏️ Edit Product ID: ${product.product_id}`
            : "+ Add New Product"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Category:</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Supplier:</label>
            <select
              name="supplier_id"
              value={formData.supplier_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Supplier --</option>
              {suppliers.map((s) => (
                <option key={s.supplier_id} value={s.supplier_id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Unit Price ($):</label>
            <input
              type="number"
              name="unit_price"
              value={formData.unit_price}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>Stock Quantity:</label>
            <input
              type="number"
              name="stock_quantity"
              value={formData.stock_quantity}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Reorder Level:</label>
            <input
              type="number"
              name="reorder_level"
              value={formData.reorder_level}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
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
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for CRUD Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // State for filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [lowStock, setLowStock] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const filters = {
      search: search,
      category: category,
      lowStock: lowStock ? "true" : undefined,
    };

    try {
      const res = await getProducts(filters);
      const sortedData = res.data.sort((a, b) => a.product_id - b.product_id);
      setProducts(sortedData);
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoading(false);
    }
  }, [search, category, lowStock]);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [categoriesRes, suppliersRes] = await Promise.all([
          getProductCategories(),
          getSuppliers({}),
        ]);
        setCategories(categoriesRes.data);
        setSuppliers(suppliersRes.data);
      } catch (err) {
        console.error("Failed to load metadata", err);
      }
    };
    loadMetadata();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
        await updateProduct(editingProduct.product_id, data);
        alert("Product updated successfully!");
      } else {
        await createProduct(data);
        alert("Product created successfully!");
      }
      handleCloseModal();
      fetchProducts();
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
    if (!window.confirm(`Are you sure you want to delete product: ${productName}?`)) {
      return;
    }
    try {
      await deleteProduct(productId);
      alert("Product deleted successfully!");
      fetchProducts();
    } catch (err) {
      console.error("Failed to delete product", err);
      alert("Failed to delete product: " + (err.response?.data?.error || err.message));
    }
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount);
    return isNaN(num) ? "$0.00" : `$${num.toFixed(2)}`;
  };

  return (
    <div>
      <h2>📦 Product Inventory</h2>

      <div className="toolbar">
        <form className="filter-bar" onSubmit={handleSearch}>
          <div style={{ display: 'flex', gap: '10px', flexGrow: 1 }}>
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <label style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', marginLeft: '10px' }}>
              <input
                type="checkbox"
                checked={lowStock}
                onChange={(e) => setLowStock(e.target.checked)}
                style={{ width: 'auto', marginRight: '5px' }}
              />
              Low Stock (&lt; 100)
            </label>
          </div>
        </form>
        <button onClick={handleOpenCreateModal} className="add-button">
          + Add New Product
        </button>
      </div>

      {loading ? (
        <div>Loading Products...</div>
      ) : (
        <table className="products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
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
                </td>
                <td>{p.category?.name || "N/A"}</td>
                <td>{formatCurrency(p.unit_price)}</td>
                <td>{p.stock_quantity}</td>
                <td>{p.reorder_level}</td>
                <td>{p.supplier?.name || "N/A"}</td>
                <td className="actions-cell">
                  <button
                    onClick={() => handleOpenEditModal(p)}
                    style={{ marginRight: "5px", padding: "5px 10px", backgroundColor: "#f39c12", border: "none", borderRadius: "4px", color: "white", cursor: "pointer" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p.product_id, p.name)}
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

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={editingProduct}
        categories={categories}
        suppliers={suppliers}
        onSubmit={handleCreateOrUpdateProduct}
      />
    </div>
  );
};

export default Products;