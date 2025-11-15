// src/pages/Products.js
import React, { useState, useEffect } from "react";
import { getProducts, getProductCategories } from "../api/inventoryApi";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [lowStock, setLowStock] = useState(false);

  // Effect to load metadata (categories)
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getProductCategories();
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    loadCategories();
  }, []);

  // Effect to load products based on filters
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const filters = {
        search: search,
        category: category,
        lowStock: lowStock ? "true" : undefined, // Endpoint expects "true" string
      };

      try {
        const res = await getProducts(filters);
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [search, category, lowStock]); // Re-run when filters change

  const handleSearch = (e) => {
    e.preventDefault();
    // The useEffect hook handles the API call when 'search' state changes
  };

  return (
    <div>
      <h2>📦 Product Inventory</h2>

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
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Unit Price</th>
              <th>Stock</th>
              <th>Supplier</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.product_id}>
                <td>{p.product_id}</td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>${parseFloat(p.unit_price).toFixed(2)}</td>
                <td>{p.stock_quantity}</td>
                <td>{p.supplier?.name || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Products;
