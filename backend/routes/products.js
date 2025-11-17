const express = require("express");
const router = express.Router();
const { Product, Supplier, ProductCategory, sequelize } = require("../models");
const { Op } = require("sequelize");

// Get all products with optional filters
router.get("/", async (req, res) => {
  try {
    const { search, category_id, lowStock, supplier_id } = req.query;

    let whereClause = {};

    if (search) {
      whereClause.name = { [Op.like]: `%${search}%` };
    }

    if (category_id) {
      whereClause.category_id = category_id;
    }

    if (lowStock === "true") {
      whereClause.stock_quantity = { [Op.lt]: 100 };
    }

    if (supplier_id) {
      whereClause.supplier_id = supplier_id;
    }

    const products = await Product.findAll({
      where: whereClause,
      include: [
        {
          model: Supplier,
          as: "supplier",
          attributes: ["supplier_id", "name"],
        },
        {
          model: ProductCategory,
          as: "category",
          attributes: ["category_id", "name"]
        }
      ],
      order: [["name", "ASC"]],
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Supplier,
          as: "supplier",
        },
        {
          model: ProductCategory,
          as: "category",
          attributes: ["category_id", "name"]
        }
      ],
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new product
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update product
router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await product.update(req.body);
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await product.destroy();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get low stock products
router.get("/alerts/low-stock", async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        stock_quantity: {
          [Op.lt]: sequelize.col("reorder_level"),
        },
      },
      include: [
        {
          model: Supplier,
          as: "supplier",
        },
      ],
      order: [["stock_quantity", "ASC"]],
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product categories
router.get("/meta/categories", async (req, res) => {
  try {
    const categories = await ProductCategory.findAll({
      attributes: ["category_id", "name", "description"],
      order: [["name", "ASC"]],
    });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
