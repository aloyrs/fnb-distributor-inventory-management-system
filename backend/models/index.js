const sequelize = require("../config/database");
const Product = require("./Product");
const Supplier = require("./Supplier");
const SupplierPurchase = require("./SupplierPurchase");
const SupplierPurchaseItem = require("./SupplierPurchaseItem");
const Customer = require("./Customer");
const CustomerOrder = require("./CustomerOrder");
const CustomerOrderItem = require("./CustomerOrderItem");

// Define relationships

// Supplier - Product (One-to-Many)
Supplier.hasMany(Product, {
  foreignKey: "supplier_id",
  as: "products",
  onDelete: "SET NULL",
});
Product.belongsTo(Supplier, {
  foreignKey: "supplier_id",
  as: "supplier",
});

// Supplier - SupplierPurchase (One-to-Many)
Supplier.hasMany(SupplierPurchase, {
  foreignKey: "supplier_id",
  as: "purchases",
  onDelete: "CASCADE",
});
SupplierPurchase.belongsTo(Supplier, {
  foreignKey: "supplier_id",
  as: "supplier",
});

// SupplierPurchase - SupplierPurchaseItem (One-to-Many)
SupplierPurchase.hasMany(SupplierPurchaseItem, {
  foreignKey: "purchase_id",
  as: "items",
  onDelete: "CASCADE",
});
SupplierPurchaseItem.belongsTo(SupplierPurchase, {
  foreignKey: "purchase_id",
  as: "purchase",
});

// Product - SupplierPurchaseItem (One-to-Many)
Product.hasMany(SupplierPurchaseItem, {
  foreignKey: "product_id",
  as: "purchaseItems",
  onDelete: "CASCADE",
});
SupplierPurchaseItem.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

// Customer - CustomerOrder (One-to-Many)
Customer.hasMany(CustomerOrder, {
  foreignKey: "customer_id",
  as: "orders",
  onDelete: "CASCADE",
});
CustomerOrder.belongsTo(Customer, {
  foreignKey: "customer_id",
  as: "customer",
});

// CustomerOrder - CustomerOrderItem (One-to-Many)
CustomerOrder.hasMany(CustomerOrderItem, {
  foreignKey: "order_id",
  as: "items",
  onDelete: "CASCADE",
});
CustomerOrderItem.belongsTo(CustomerOrder, {
  foreignKey: "order_id",
  as: "order",
});

// Product - CustomerOrderItem (One-to-Many)
Product.hasMany(CustomerOrderItem, {
  foreignKey: "product_id",
  as: "orderItems",
  onDelete: "CASCADE",
});
CustomerOrderItem.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

module.exports = {
  sequelize,
  Product,
  Supplier,
  SupplierPurchase,
  SupplierPurchaseItem,
  Customer,
  CustomerOrder,
  CustomerOrderItem,
};
