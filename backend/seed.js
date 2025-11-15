const {
  sequelize,
  Product,
  Supplier,
  Customer,
  SupplierPurchase,
  SupplierPurchaseItem,
  CustomerOrder,
  CustomerOrderItem,
} = require("./models");

const seedDatabase = async () => {
  try {
    // Sync database (recreate tables)
    await sequelize.sync({ force: true });
    console.log("Database synced");

    // Create Suppliers
    const suppliers = await Supplier.bulkCreate([
      {
        name: "Fresh Foods Supplier",
        contact_person: "John Tan",
        email: "john@freshfoods.com",
        phone: "+65 6123 4567",
        address: "123 Wholesale Ave, Singapore",
        region: "Central",
        status: "active",
      },
      {
        name: "Premium Ingredients Co",
        contact_person: "Mary Lim",
        email: "mary@premiumingredients.com",
        phone: "+65 6234 5678",
        address: "456 Supply Road, Singapore",
        region: "East",
        status: "active",
      },
      {
        name: "Global Beverage Distributors",
        contact_person: "David Lee",
        email: "david@globalbev.com",
        phone: "+65 6345 6789",
        address: "789 Distribution Lane, Singapore",
        region: "West",
        status: "active",
      },
    ]);

    console.log("Suppliers created");

    // Create Products
    const products = await Product.bulkCreate([
      {
        name: "Organic Rice 5kg",
        description: "Premium organic white rice",
        category: "Grains",
        unit: "kg",
        unit_price: 12.5,
        stock_quantity: 450,
        reorder_level: 100,
        supplier_id: suppliers[0].supplier_id,
      },
      {
        name: "Olive Oil 1L",
        description: "Extra virgin olive oil",
        category: "Oils",
        unit: "L",
        unit_price: 18.9,
        stock_quantity: 80,
        reorder_level: 100,
        supplier_id: suppliers[1].supplier_id,
      },
      {
        name: "Fresh Milk 1L",
        description: "Full cream fresh milk",
        category: "Dairy",
        unit: "L",
        unit_price: 3.5,
        stock_quantity: 250,
        reorder_level: 150,
        supplier_id: suppliers[0].supplier_id,
      },
      {
        name: "Pasta 500g",
        description: "Italian pasta",
        category: "Grains",
        unit: "g",
        unit_price: 4.2,
        stock_quantity: 350,
        reorder_level: 100,
        supplier_id: suppliers[1].supplier_id,
      },
      {
        name: "Orange Juice 1L",
        description: "Freshly squeezed orange juice",
        category: "Beverages",
        unit: "L",
        unit_price: 5.8,
        stock_quantity: 60,
        reorder_level: 100,
        supplier_id: suppliers[2].supplier_id,
      },
      {
        name: "Coffee Beans 500g",
        description: "Premium Arabica coffee beans",
        category: "Beverages",
        unit: "g",
        unit_price: 22.0,
        stock_quantity: 120,
        reorder_level: 50,
        supplier_id: suppliers[2].supplier_id,
      },
      {
        name: "Canned Tomatoes 400g",
        description: "Whole peeled tomatoes",
        category: "Canned Goods",
        unit: "g",
        unit_price: 2.5,
        stock_quantity: 500,
        reorder_level: 200,
        supplier_id: suppliers[0].supplier_id,
      },
      {
        name: "Soy Sauce 1L",
        description: "Premium dark soy sauce",
        category: "Condiments",
        unit: "L",
        unit_price: 6.5,
        stock_quantity: 180,
        reorder_level: 100,
        supplier_id: suppliers[1].supplier_id,
      },
    ]);

    console.log("Products created");

    // Create Customers
    const customers = await Customer.bulkCreate([
      {
        name: "Sunshine Cafe",
        email: "orders@sunshinecafe.com",
        phone: "+65 6111 2222",
        address: "10 Orchard Road, Singapore",
        customer_type: "retail",
        status: "active",
      },
      {
        name: "Grand Hotel Restaurant",
        email: "procurement@grandhotel.com",
        phone: "+65 6222 3333",
        address: "50 Marina Bay, Singapore",
        customer_type: "wholesale",
        status: "active",
      },
      {
        name: "Family Bistro",
        email: "info@familybistro.com",
        phone: "+65 6333 4444",
        address: "25 Tanjong Pagar, Singapore",
        customer_type: "retail",
        status: "active",
      },
    ]);

    console.log("Customers created");

    // Create Supplier Purchases
    const purchase1 = await SupplierPurchase.create({
      supplier_id: suppliers[0].supplier_id,
      purchase_date: new Date("2024-10-15"),
      total_amount: 3125.0,
      status: "completed",
      notes: "Regular monthly stock",
    });

    await SupplierPurchaseItem.bulkCreate([
      {
        purchase_id: purchase1.purchase_id,
        product_id: products[0].product_id,
        quantity: 100,
        unit_cost: 12.5,
        subtotal: 1250.0,
      },
      {
        purchase_id: purchase1.purchase_id,
        product_id: products[2].product_id,
        quantity: 200,
        unit_cost: 3.5,
        subtotal: 700.0,
      },
      {
        purchase_id: purchase1.purchase_id,
        product_id: products[6].product_id,
        quantity: 470,
        unit_cost: 2.5,
        subtotal: 1175.0,
      },
    ]);

    const purchase2 = await SupplierPurchase.create({
      supplier_id: suppliers[2].supplier_id,
      purchase_date: new Date("2024-10-20"),
      total_amount: 926.0,
      status: "completed",
      notes: "Beverage restock",
    });

    await SupplierPurchaseItem.bulkCreate([
      {
        purchase_id: purchase2.purchase_id,
        product_id: products[4].product_id,
        quantity: 50,
        unit_cost: 5.8,
        subtotal: 290.0,
      },
      {
        purchase_id: purchase2.purchase_id,
        product_id: products[5].product_id,
        quantity: 30,
        unit_cost: 22.0,
        subtotal: 660.0,
      },
    ]);

    console.log("Supplier purchases created");

    // Create Customer Orders
    const order1 = await CustomerOrder.create({
      customer_id: customers[0].customer_id,
      order_date: new Date("2024-11-01"),
      total_amount: 1050.0,
      status: "completed",
      shipping_address: "10 Orchard Road, Singapore",
      notes: "Deliver in morning",
    });

    await CustomerOrderItem.bulkCreate([
      {
        order_id: order1.order_id,
        product_id: products[0].product_id,
        quantity: 20,
        unit_price: 12.5,
        subtotal: 250.0,
      },
      {
        order_id: order1.order_id,
        product_id: products[2].product_id,
        quantity: 50,
        unit_price: 3.5,
        subtotal: 175.0,
      },
      {
        order_id: order1.order_id,
        product_id: products[5].product_id,
        quantity: 10,
        unit_price: 22.0,
        subtotal: 220.0,
      },
      {
        order_id: order1.order_id,
        product_id: products[6].product_id,
        quantity: 100,
        unit_price: 2.5,
        subtotal: 250.0,
      },
      {
        order_id: order1.order_id,
        product_id: products[7].product_id,
        quantity: 24,
        unit_price: 6.5,
        subtotal: 156.0,
      },
    ]);

    const order2 = await CustomerOrder.create({
      customer_id: customers[1].customer_id,
      order_date: new Date("2024-11-05"),
      total_amount: 1895.0,
      status: "processing",
      shipping_address: "50 Marina Bay, Singapore",
      notes: "Bulk order for hotel",
    });

    await CustomerOrderItem.bulkCreate([
      {
        order_id: order2.order_id,
        product_id: products[1].product_id,
        quantity: 50,
        unit_price: 18.9,
        subtotal: 945.0,
      },
      {
        order_id: order2.order_id,
        product_id: products[3].product_id,
        quantity: 100,
        unit_price: 4.2,
        subtotal: 420.0,
      },
      {
        order_id: order2.order_id,
        product_id: products[4].product_id,
        quantity: 30,
        unit_price: 5.8,
        subtotal: 174.0,
      },
      {
        order_id: order2.order_id,
        product_id: products[7].product_id,
        quantity: 50,
        unit_price: 6.5,
        subtotal: 325.0,
      },
    ]);

    console.log("Customer orders created");

    console.log("\n=== Database seeded successfully! ===");
    console.log("\nSample Data Created:");
    console.log(`- ${suppliers.length} Suppliers`);
    console.log(`- ${products.length} Products`);
    console.log(`- ${customers.length} Customers`);
    console.log("- 2 Supplier Purchases with items");
    console.log("- 2 Customer Orders with items");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
