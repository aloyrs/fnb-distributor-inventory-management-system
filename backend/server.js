const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// // Import routes
const productRoutes = require("./routes/products");
const supplierRoutes = require("./routes/suppliers");
const supplierPurchaseRoutes = require("./routes/supplierPurchases");
const customerRoutes = require("./routes/customers");
const customerOrderRoutes = require("./routes/customerOrders");
const dashboardRoutes = require("./routes/dashboard");

// // Use routes
app.use("/api/products", productRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/supplier-purchases", supplierPurchaseRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/customer-orders", customerOrderRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

// Database sync and server start
const startServer = async () => {
  try {
    // Sync database (creates tables if they don't exist, but doesn't alter existing ones)
    await sequelize.sync();
    console.log("Database synced successfully");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
  }
};

startServer();
