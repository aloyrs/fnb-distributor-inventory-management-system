const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CustomerOrder = sequelize.define(
  "CustomerOrder",
  {
    order_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Customers",
        key: "customer_id",
      },
    },
    order_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0,
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "processing", "completed", "cancelled"),
      defaultValue: "pending",
    },
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "CustomerOrders",
    timestamps: true,
  }
);

module.exports = CustomerOrder;
