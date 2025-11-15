const express = require("express");
const router = express.Router();
const { Customer, CustomerOrder } = require("../models");
const { Op } = require("sequelize");

// Get all customers with optional filters
router.get("/", async (req, res) => {
  try {
    const { search, customer_type, status } = req.query;

    let whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    if (customer_type) {
      whereClause.customer_type = customer_type;
    }

    if (status) {
      whereClause.status = status;
    }

    const customers = await Customer.findAll({
      where: whereClause,
      include: [
        {
          model: CustomerOrder,
          as: "orders",
          attributes: ["order_id", "order_date", "total_amount", "status"],
          limit: 5,
          order: [["order_date", "DESC"]],
        },
      ],
      order: [["name", "ASC"]],
    });

    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer by ID
router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id, {
      include: [
        {
          model: CustomerOrder,
          as: "orders",
          order: [["order_date", "DESC"]],
        },
      ],
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new customer
router.post("/", async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update customer
router.put("/:id", async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    await customer.update(req.body);
    res.json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete customer
router.delete("/:id", async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    await customer.destroy();
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
