const express = require("express");
const router = express.Router();
const { Product, CustomerOrderItem, sequelize } = require("../models");
const { Op } = require("sequelize");

// Get critically low stock products (stock < 100)
router.get("/low-stock-alerts", async (req, res) => {
  try {
    const lowStockProducts = await Product.findAll({
      where: {
        stock_quantity: {
          [Op.lt]: 100,
        },
      },
      attributes: [
        "product_id",
        "name",
        "stock_quantity",
        "reorder_level",
        "unit_price",
        "category",
      ],
      order: [["stock_quantity", "ASC"]],
      limit: 20,
    });

    res.json(lowStockProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top 10 selling products
router.get("/top-selling-products", async (req, res) => {
  try {
    const topProducts = await CustomerOrderItem.findAll({
      attributes: [
        [sequelize.col("CustomerOrderItem.product_id"), "product_id"],
        [
          sequelize.fn("SUM", sequelize.col("CustomerOrderItem.quantity")),
          "total_sold",
        ],
        [
          sequelize.fn("SUM", sequelize.col("CustomerOrderItem.subtotal")),
          "total_revenue",
        ],
        [sequelize.col("product.name"), "product_name"],
        [sequelize.col("product.category"), "product_category"],
        [sequelize.col("product.unit_price"), "product_unit_price"],
      ],
      include: [
        {
          model: Product,
          as: "product",
          attributes: [],
        },
      ],
      group: [
        sequelize.col("CustomerOrderItem.product_id"),
        "product.name",
        "product.category",
        "product.unit_price",
      ],
      order: [[sequelize.literal("total_sold"), "DESC"]],
      limit: 10,
      raw: true,
    });

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard summary statistics
router.get("/summary", async (req, res) => {
  try {
    // Total products
    const totalProducts = await Product.count();

    // Low stock products count
    const lowStockCount = await Product.count({
      where: {
        stock_quantity: {
          [Op.lt]: sequelize.col("reorder_level"),
        },
      },
    });

    // Total inventory value
    const inventoryValue = await Product.findAll({
      attributes: [
        [
          sequelize.fn("SUM", sequelize.literal("stock_quantity * unit_price")),
          "total_value",
        ],
      ],
      raw: true,
    });

    // Recent orders count (YTD)
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    const { CustomerOrder } = require("../models");
    const ytdOrdersCount = await CustomerOrder.count({
      where: {
        order_date: {
          [Op.gte]: startOfYear,
        },
      },
    });

    // Total revenue (YTD)
    const ytdRevenue = await CustomerOrder.findAll({
      attributes: [
        [sequelize.fn("SUM", sequelize.col("total_amount")), "total_revenue"],
      ],
      where: {
        order_date: {
          [Op.gte]: startOfYear,
        },
        status: {
          [Op.notIn]: ["cancelled"],
        },
      },
      raw: true,
    });

    res.json({
      totalProducts,
      lowStockCount,
      totalInventoryValue: inventoryValue[0]?.total_value || 0,
      ytdOrdersCount,
      ytdRevenue: ytdRevenue[0]?.total_revenue || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stock level distribution
// critical is < 100
// low is >= 100 && < 300
// sufficient is >= 300
router.get("/stock-distribution", async (req, res) => {
  try {
    const critical = await Product.count({
      where: { stock_quantity: { [Op.lt]: 100 } },
    });

    const low = await Product.count({
      where: {
        stock_quantity: {
          [Op.gte]: 100,
          [Op.lt]: 300,
        },
      },
    });

    const sufficient = await Product.count({
      where: { stock_quantity: { [Op.gte]: 300 } },
    });

    res.json({
      critical,
      low,
      sufficient,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
