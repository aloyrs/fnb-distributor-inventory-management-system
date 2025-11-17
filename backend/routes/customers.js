const express = require("express");
const router = express.Router();
const { Customer, CustomerOrder, sequelize } = require("../models");
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

// Get customer product trends (increasing vs declining products)
router.get("/trends/product-analysis", async (req, res) => {
  try {
    const productTrends = await sequelize.query(
      `WITH customer_product_periods AS (
        SELECT
          c.customer_id,
          c.name AS customer_name,
          p.product_id,
          p.name AS product_name,
          CASE
            WHEN julianday(co.order_date) < (
              SELECT AVG(julianday(order_date))
              FROM CustomerOrders
              WHERE customer_id = c.customer_id
            ) THEN 'earlier'
            ELSE 'recent'
          END AS period,
          SUM(coi.quantity) AS total_qty,
          COUNT(DISTINCT co.order_id) AS order_count,
          AVG(coi.quantity) AS avg_qty_per_order
        FROM Customers c
        JOIN CustomerOrders co ON c.customer_id = co.customer_id AND co.status = 'completed'
        JOIN CustomerOrderItems coi ON co.order_id = coi.order_id
        JOIN Products p ON coi.product_id = p.product_id
        GROUP BY c.customer_id, c.name, p.product_id, p.name, period
      ),
      product_trends AS (
        SELECT
          customer_id,
          customer_name,
          product_id,
          product_name,
          MAX(CASE WHEN period = 'earlier' THEN total_qty ELSE 0 END) AS earlier_qty,
          MAX(CASE WHEN period = 'recent' THEN total_qty ELSE 0 END) AS recent_qty,
          MAX(CASE WHEN period = 'earlier' THEN order_count ELSE 0 END) AS earlier_orders,
          MAX(CASE WHEN period = 'recent' THEN order_count ELSE 0 END) AS recent_orders
        FROM customer_product_periods
        GROUP BY customer_id, customer_name, product_id, product_name
      )
      SELECT
        customer_id,
        customer_name,
        product_id,
        product_name,
        earlier_qty,
        recent_qty,
        (recent_qty - earlier_qty) AS qty_change,
        CASE WHEN earlier_qty = 0 THEN NULL ELSE ROUND(((recent_qty - earlier_qty) * 100.0) / earlier_qty, 1) END AS change_percentage,
        CASE
          WHEN recent_qty > earlier_qty * 1.2 THEN 'INCREASING'
          WHEN recent_qty < earlier_qty * 0.8 THEN 'DECLINING'
          ELSE 'STABLE'
        END AS trend,
        (recent_orders - earlier_orders) AS order_frequency_change
      FROM product_trends
      WHERE (earlier_qty > 0 OR recent_qty > 0)
      ORDER BY customer_id, trend DESC, ABS(qty_change) DESC;
      `,
      { type: sequelize.QueryTypes.SELECT }
    );

    res.json(productTrends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
