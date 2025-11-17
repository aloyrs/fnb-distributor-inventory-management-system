const { Sequelize } = require("sequelize");
// const path = require("path");

// Create SQLite database connection
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
  logging: console.log, // Set to false to disable logging
  define: {
    timestamps: true, // Adds createdAt and updatedAt
    underscored: false, // Use camelCase instead of snake_case
  },
});

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

testConnection();

module.exports = sequelize;
