const express = require("express");
const router = express.Router();
const { Product, CustomerOrderItem, CustomerOrder, ProductCategory, sequelize } = require("../models");
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
        [sequelize.col("category.name"), "category"],
      ],
      include: [{
        model: ProductCategory,
        as: "category",
        attributes: []
      }],
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
        [sequelize.col("product.category.name"), "product_category"],
        [sequelize.col("product.unit_price"), "product_unit_price"],
      ],
      include: [
        {
          model: Product,
          as: "product",
          attributes: [],
          include: [{
            model: ProductCategory,
            as: "category",
            attributes: []
          }]
        },
      ],
      group: [
        sequelize.col("CustomerOrderItem.product_id"),
        "product.name",
        "product.category.name",
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

// Get supply risk report - products by number of suppliers
router.get("/supply-risk-report", async (req, res) => {
  try {
    const supplyRiskReport = await sequelize.query(
    `SELECT 
      p.product_id,
      p.name,
      pc.name as category,
      p.unit_price,
      p.stock_quantity,
      COUNT(DISTINCT sp.supplier_id) as supplier_count
    FROM Products p
    LEFT JOIN Product_Categories pc ON p.category_id = pc.category_id
    LEFT JOIN SupplierPurchaseItems spi ON p.product_id = spi.product_id
    LEFT JOIN SupplierPurchases sp ON spi.purchase_id = sp.purchase_id
    GROUP BY p.product_id, p.name, pc.name, p.unit_price, p.stock_quantity
    ORDER BY supplier_count ASC, p.name`,
    { type: sequelize.QueryTypes.SELECT }
  );

    res.json(supplyRiskReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get purchase forecast report
router.get("/purchase-forecast", async (req, res) => {
  try {
    const purchaseForecast = await sequelize.query(
    `SELECT 
      p.product_id,
      p.name,
      pc.name as category,
      p.stock_quantity,
      p.reorder_level,
      COUNT(spi.item_id) as total_purchases,
      AVG(spi.quantity) as avg_purchase_qty,
      ROUND(AVG(spi.quantity), 0) as forecasted_monthly_qty,
      MAX(sp.purchase_date) as last_purchase_date,
      ROUND((julianday('now') - julianday(MAX(sp.purchase_date)))) as days_since_purchase,
      ROUND(
        (julianday(MAX(sp.purchase_date)) - julianday(MIN(sp.purchase_date))) / 
        (COUNT(DISTINCT strftime('%Y-%m', sp.purchase_date)))
      ) as avg_days_between_purchases,
      CASE 
        WHEN p.stock_quantity < p.reorder_level THEN 'URGENT'
        WHEN p.stock_quantity < (p.reorder_level * 1.5) THEN 'SOON'
        ELSE 'PLANNED'
      END as purchase_priority,
      ROUND(p.unit_price * ROUND(AVG(spi.quantity), 0), 2) as estimated_monthly_cost
    FROM Products p
    LEFT JOIN Product_Categories pc ON p.category_id = pc.category_id
    LEFT JOIN SupplierPurchaseItems spi ON p.product_id = spi.product_id
    LEFT JOIN SupplierPurchases sp ON spi.purchase_id = sp.purchase_id AND sp.status = 'completed'
    GROUP BY p.product_id, p.name, pc.name, p.stock_quantity, p.reorder_level, p.unit_price
    ORDER BY purchase_priority DESC, last_purchase_date ASC`,
    { type: sequelize.QueryTypes.SELECT }
  );

    res.json(purchaseForecast);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
