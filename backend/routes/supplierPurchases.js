const express = require("express");
const router = express.Router();
const {
  SupplierPurchase,
  SupplierPurchaseItem,
  Supplier,
  Product,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

// Get all supplier purchases with optional filters
router.get("/", async (req, res) => {
  try {
    const { search, supplier_id, status, startDate, endDate } = req.query;

    let whereClause = {};

    if (supplier_id) {
      whereClause.supplier_id = supplier_id;
    }

    if (status) {
      whereClause.status = status;
    }

    if (startDate && endDate) {
      whereClause.purchase_date = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const purchases = await SupplierPurchase.findAll({
      where: whereClause,
      include: [
        {
          model: Supplier,
          as: "supplier",
          where: search ? { name: { [Op.like]: `%${search}%` } } : undefined,
        },
        {
          model: SupplierPurchaseItem,
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
      order: [["purchase_date", "DESC"]],
    });

    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get purchase by ID
router.get("/:id", async (req, res) => {
  try {
    const purchase = await SupplierPurchase.findByPk(req.params.id, {
      include: [
        {
          model: Supplier,
          as: "supplier",
        },
        {
          model: SupplierPurchaseItem,
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

    if (!purchase) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    res.json(purchase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new purchase with items
router.post("/", async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { supplier_id, purchase_date, status, notes, items } = req.body;

    // Create purchase
    const purchase = await SupplierPurchase.create(
      {
        supplier_id,
        purchase_date,
        status,
        notes,
        total_amount: 0,
      },
      { transaction: t }
    );

    let totalAmount = 0;

    // Create purchase items and update stock
    if (items && items.length > 0) {
      for (const item of items) {
        const subtotal = item.quantity * item.unit_price;
        totalAmount += subtotal;

        await SupplierPurchaseItem.create(
          {
            purchase_id: purchase.purchase_id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal,
          },
          { transaction: t }
        );

        // Update product stock
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
    }

    // Update total amount
    await purchase.update({ total_amount: totalAmount }, { transaction: t });

    await t.commit();

    // Fetch complete purchase with items
    const completePurchase = await SupplierPurchase.findByPk(
      purchase.purchase_id,
      {
        include: [
          { model: Supplier, as: "supplier" },
          {
            model: SupplierPurchaseItem,
            as: "items",
            include: [{ model: Product, as: "product" }],
          },
        ],
      }
    );

    res.status(201).json(completePurchase);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ error: error.message });
  }
});

// Update purchase
router.put("/:id", async (req, res) => {
  try {
    const purchase = await SupplierPurchase.findByPk(req.params.id);

    if (!purchase) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    await purchase.update(req.body);
    res.json(purchase);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete purchase
router.delete("/:id", async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const purchase = await SupplierPurchase.findByPk(req.params.id, {
      include: [{ model: SupplierPurchaseItem, as: "items" }],
    });

    if (!purchase) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    // Revert stock quantities
    for (const item of purchase.items) {
      const product = await Product.findByPk(item.product_id);
      if (product) {
        await product.update(
          {
            stock_quantity: product.stock_quantity - item.quantity,
          },
          { transaction: t }
        );
      }
    }

    await purchase.destroy({ transaction: t });
    await t.commit();

    res.json({ message: "Purchase deleted successfully" });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
});

// Purchase Item Routes

// Add item to purchase
router.post("/:id/items", async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const purchase = await SupplierPurchase.findByPk(req.params.id);

    if (!purchase) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    const { product_id, quantity, unit_price } = req.body;
    const subtotal = quantity * unit_price;

    const item = await SupplierPurchaseItem.create(
      {
        purchase_id: req.params.id,
        product_id,
        quantity,
        unit_price,
        subtotal,
      },
      { transaction: t }
    );

    // Update product stock
    const product = await Product.findByPk(product_id);
    if (product) {
      await product.update(
        {
          stock_quantity: product.stock_quantity + quantity,
        },
        { transaction: t }
      );
    }

    // Update purchase total
    await purchase.update(
      {
        total_amount: parseFloat(purchase.total_amount) + subtotal,
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

// Update purchase item
router.put("/:purchaseId/items/:itemId", async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const item = await SupplierPurchaseItem.findByPk(req.params.itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    const oldQuantity = item.quantity;
    const oldSubtotal = parseFloat(item.subtotal);

    const { quantity, unit_price } = req.body;
    const newSubtotal = quantity * unit_price;

    await item.update(
      {
        quantity,
        unit_price,
        subtotal: newSubtotal,
      },
      { transaction: t }
    );

    // Update product stock
    const product = await Product.findByPk(item.product_id);
    if (product) {
      const stockDifference = quantity - oldQuantity;
      await product.update(
        {
          stock_quantity: product.stock_quantity + stockDifference,
        },
        { transaction: t }
      );
    }

    // Update purchase total
    const purchase = await SupplierPurchase.findByPk(req.params.purchaseId);
    await purchase.update(
      {
        total_amount:
          parseFloat(purchase.total_amount) - oldSubtotal + newSubtotal,
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

// Delete purchase item
router.delete("/:purchaseId/items/:itemId", async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const item = await SupplierPurchaseItem.findByPk(req.params.itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Update product stock
    const product = await Product.findByPk(item.product_id);
    if (product) {
      await product.update(
        {
          stock_quantity: product.stock_quantity - item.quantity,
        },
        { transaction: t }
      );
    }

    // Update purchase total
    const purchase = await SupplierPurchase.findByPk(req.params.purchaseId);
    await purchase.update(
      {
        total_amount:
          parseFloat(purchase.total_amount) - parseFloat(item.subtotal),
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

module.exports = router;
