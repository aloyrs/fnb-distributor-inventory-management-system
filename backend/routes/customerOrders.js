const express = require("express");
const router = express.Router();
const {
  CustomerOrder,
  CustomerOrderItem,
  Customer,
  Product,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

// Get all customer orders with optional filters
router.get("/", async (req, res) => {
  try {
    const { search, customer_id, status, startDate, endDate } = req.query;

    let whereClause = {};

    if (customer_id) {
      whereClause.customer_id = customer_id;
    }

    if (status) {
      whereClause.status = status;
    }

    if (startDate && endDate) {
      whereClause.order_date = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const orders = await CustomerOrder.findAll({
      where: whereClause,
      include: [
        {
          model: Customer,
          as: "customer",
          where: search ? { name: { [Op.like]: `%${search}%` } } : undefined,
        },
        {
          model: CustomerOrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["product_id", "name"],
            },
          ],
        },
      ],
      order: [["order_date", "DESC"]],
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order by ID
router.get("/:id", async (req, res) => {
  try {
    const order = await CustomerOrder.findByPk(req.params.id, {
      include: [
        {
          model: Customer,
          as: "customer",
        },
        {
          model: CustomerOrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new order with items
router.post("/", async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { customer_id, order_date, status, shipping_address, notes, items } =
      req.body;

    // Create order
    const order = await CustomerOrder.create(
      {
        customer_id,
        order_date,
        status,
        shipping_address,
        notes,
        total_amount: 0,
      },
      { transaction: t }
    );

    let totalAmount = 0;

    // Create order items and update stock
    if (items && items.length > 0) {
      for (const item of items) {
        // Check stock availability
        const product = await Product.findByPk(item.product_id);
        if (!product) {
          throw new Error(`Product ${item.product_id} not found`);
        }

        if (product.stock_quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}, Required: ${item.quantity}`
          );
        }

        const subtotal = item.quantity * item.unit_price;
        totalAmount += subtotal;

        await CustomerOrderItem.create(
          {
            order_id: order.order_id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal,
          },
          { transaction: t }
        );

        // Update product stock
        await product.update(
          {
            stock_quantity: product.stock_quantity - item.quantity,
          },
          { transaction: t }
        );
      }
    }

    // Update total amount
    await order.update({ total_amount: totalAmount }, { transaction: t });

    await t.commit();

    // Fetch complete order with items
    const completeOrder = await CustomerOrder.findByPk(order.order_id, {
      include: [
        { model: Customer, as: "customer" },
        {
          model: CustomerOrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
    });

    res.status(201).json(completeOrder);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ error: error.message });
  }
});

// Update order
router.put("/:id", async (req, res) => {
  try {
    const order = await CustomerOrder.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    await order.update(req.body);
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete order
router.delete("/:id", async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const order = await CustomerOrder.findByPk(req.params.id, {
      include: [{ model: CustomerOrderItem, as: "items" }],
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Restore stock quantities
    for (const item of order.items) {
      const product = await Product.findByPk(item.product_id);
      if (product) {
        await product.update(
          {
            stock_quantity: product.stock_quantity + item.quantity,
          },
          { transaction: t }
        );
      }
    }

    await order.destroy({ transaction: t });
    await t.commit();

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
});

// Order Item Routes

// Add item to order
router.post("/:id/items", async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const order = await CustomerOrder.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const { product_id, quantity, unit_price } = req.body;

    // Check stock
    const product = await Product.findByPk(product_id);
    if (!product) {
      throw new Error("Product not found");
    }

    if (product.stock_quantity < quantity) {
      throw new Error(
        `Insufficient stock. Available: ${product.stock_quantity}`
      );
    }

    const subtotal = quantity * unit_price;

    const item = await CustomerOrderItem.create(
      {
        order_id: req.params.id,
        product_id,
        quantity,
        unit_price,
        subtotal,
      },
      { transaction: t }
    );

    // Update product stock
    await product.update(
      {
        stock_quantity: product.stock_quantity - quantity,
      },
      { transaction: t }
    );

    // Update order total
    await order.update(
      {
        total_amount: parseFloat(order.total_amount) + subtotal,
      },
      { transaction: t }
    );

    await t.commit();
    res.status(201).json(item);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ error: error.message });
  }
});

// Update order item
router.put("/:orderId/items/:itemId", async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const item = await CustomerOrderItem.findByPk(req.params.itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    const oldQuantity = item.quantity;
    const oldSubtotal = parseFloat(item.subtotal);

    const { quantity } = req.body;
    const unit_price = item.unit_price;

    if (quantity === undefined) {
      return res
        .status(400)
        .json({ error: "Quantity must be provided for update." });
    }

    const quantityDifference = quantity - oldQuantity;

    if (quantityDifference > 0) {
      const product = await Product.findByPk(item.product_id);
      if (product.stock_quantity < quantityDifference) {
        throw new Error(
          `Insufficient stock. Available: ${product.stock_quantity}`
        );
      }
    }

    const newSubtotal = quantity * unit_price;

    await item.update(
      {
        quantity,
        unit_price,
        subtotal: newSubtotal,
      },
      { transaction: t }
    );

    const product = await Product.findByPk(item.product_id);
    if (product) {
      await product.update(
        {
          stock_quantity: product.stock_quantity - quantityDifference,
        },
        { transaction: t }
      );
    }

    const order = await CustomerOrder.findByPk(req.params.orderId);
    await order.update(
      {
        total_amount:
          parseFloat(order.total_amount) - oldSubtotal + newSubtotal,
      },
      { transaction: t }
    );

    await t.commit();
    res.json(item);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ error: error.message });
  }
});

// Delete order item
router.delete("/:orderId/items/:itemId", async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const item = await CustomerOrderItem.findByPk(req.params.itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Restore product stock
    const product = await Product.findByPk(item.product_id);
    if (product) {
      await product.update(
        {
          stock_quantity: product.stock_quantity + item.quantity,
        },
        { transaction: t }
      );
    }

    // Update order total
    const order = await CustomerOrder.findByPk(req.params.orderId);
    await order.update(
      {
        total_amount:
          parseFloat(order.total_amount) - parseFloat(item.subtotal),
      },
      { transaction: t }
    );

    await item.destroy({ transaction: t });
    await t.commit();

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
});

//Get monthly revenue for a specific year
router.get("/stats/monthly-revenue", async (req, res) => {
  try {
    const { year } = req.query;

    if (!year) {
      return res.status(400).json({ error: "Year is required" });
    }

    const monthlyRevenue = await CustomerOrder.findAll({
      attributes: [
        [
          // SQLite uses strftime('%m', date_column) for month
          sequelize.fn("strftime", "%m", sequelize.col("order_date")),
          "month",
        ],
        [sequelize.fn("SUM", sequelize.col("total_amount")), "totalRevenue"],
      ],
      where: {
        // SQLite uses strftime('%Y', date_column) for year
        order_date: sequelize.where(
          sequelize.fn("strftime", "%Y", sequelize.col("order_date")),
          year
        ),
        status: {
          [Op.ne]: "cancelled",
        },
      },
      group: [sequelize.fn("strftime", "%m", sequelize.col("order_date"))],
      order: [
        [sequelize.fn("strftime", "%m", sequelize.col("order_date")), "ASC"],
      ],
      raw: true,
    });

    const fullData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      totalRevenue: 0.0,
    }));

    monthlyRevenue.forEach((item) => {
      // strftime returns '01', '02', etc., so parseInt is necessary
      const monthIndex = parseInt(item.month) - 1;
      fullData[monthIndex].totalRevenue = parseFloat(item.totalRevenue);
    });

    res.json(fullData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
