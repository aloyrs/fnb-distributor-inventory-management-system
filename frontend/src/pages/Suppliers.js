// src/pages/Suppliers.js
import React, { useState, useEffect } from "react";
import { getSuppliers, getSupplierRegions } from "../api/inventoryApi";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");

  // Load metadata (regions)
  useEffect(() => {
    const loadRegions = async () => {
      try {
        const res = await getSupplierRegions();
        setRegions(res.data);
      } catch (err) {
        console.error("Failed to load regions", err);
      }
    };
    loadRegions();
  }, []);

  // Load suppliers based on filters
  useEffect(() => {
    const loadSuppliers = async () => {
      setLoading(true);
      const filters = {
        search: search,
        region: region,
      };

      try {
        const res = await getSuppliers(filters);
        setSuppliers(res.data);
      } catch (err) {
        console.error("Failed to load suppliers", err);
      } finally {
        setLoading(false);
      }
    };
    loadSuppliers();
  }, [search, region]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <div>
      <h2>🚛 Supplier Partners</h2>

      <form className="filter-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by name or contact person..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="">All Regions</option>
          {regions.map((r, index) => (
            <option key={index} value={r}>
              {r}
            </option>
          ))}
        </select>
      </form>

      {loading ? (
        <div>Loading Suppliers...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Contact Person</th>
              <th>Region</th>
              <th>Products Supplied</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.supplier_id}>
                <td>{s.supplier_id}</td>
                <td>{s.name}</td>
                <td>{s.contact_person}</td>
                <td>{s.region}</td>
                <td>{s.products.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Suppliers;
