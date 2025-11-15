const express = require("express");
const router = express.Router();
const { Supplier, Product, SupplierPurchase, sequelize } = require("../models");
const { Op } = require("sequelize");

// Get all suppliers with optional filters
router.get("/", async (req, res) => {
  try {
    const { search, region, status } = req.query;

    let whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { contact_person: { [Op.like]: `%${search}%` } },
      ];
    }

    if (region) {
      whereClause.region = region;
    }

    if (status) {
      whereClause.status = status;
    }

    const suppliers = await Supplier.findAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: "products",
          attributes: ["product_id", "name"],
        },
      ],
      order: [["name", "ASC"]],
    });

    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get supplier by ID
router.get("/:id", async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id, {
      include: [
        {
          model: Product,
          as: "products",
        },
        {
          model: SupplierPurchase,
          as: "purchases",
          limit: 10,
          order: [["purchase_date", "DESC"]],
        },
      ],
    });

    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new supplier
router.post("/", async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update supplier
router.put("/:id", async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);

    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    await supplier.update(req.body);
    res.json(supplier);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete supplier
router.delete("/:id", async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);

    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    await supplier.destroy();
    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get supplier regions
router.get("/meta/regions", async (req, res) => {
  try {
    const regions = await Supplier.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("region")), "region"],
      ],
      where: {
        region: { [Op.ne]: null },
      },
      raw: true,
    });

    res.json(regions.map((r) => r.region));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
