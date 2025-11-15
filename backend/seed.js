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
    await sequelize.sync({ force: true });
    console.log("Database synced");

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

      {
        name: "Asian Produce Co",
        contact_person: "Sam Wong",
        email: "sam@asianproduce.com",
        phone: "+65 6456 7890",
        address: "30 Produce Market, Singapore",
        region: "North",
        status: "active",
      },
      {
        name: "Quality Meat Distributors",
        contact_person: "Rachel Chen",
        email: "rachel@qualitymeat.com",
        phone: "+65 6567 8901",
        address: "55 Meat Processing Park, Singapore",
        region: "Central",
        status: "active",
      },
      {
        name: "Eco-Packaging Solutions",
        contact_person: "Alex Nair",
        email: "alex@ecopack.com",
        phone: "+65 6678 9012",
        address: "100 Industry Road, Singapore",
        region: "South",
        status: "inactive",
      },
      {
        name: "Local Bakery Supplies",
        contact_person: "Susan Goh",
        email: "susan@bakerysupply.com",
        phone: "+65 6789 0123",
        address: "15 Baker Street, Singapore",
        region: "East",
        status: "active",
      },
      {
        name: "South East Spices",
        contact_person: "Kumar Pillai",
        email: "kumar@sespices.com",
        phone: "+65 6901 2345",
        address: "5 Spice Hub, Singapore",
        region: "Central",
        status: "active",
      },
    ]);

    console.log(`Suppliers created: ${suppliers.length}`);

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

      {
        name: "Chicken Breast 1kg",
        description: "Frozen chicken breast",
        category: "Meat",
        unit: "kg",
        unit_price: 8.5,
        stock_quantity: 150,
        reorder_level: 50,
        supplier_id: suppliers[4].supplier_id,
      },
      {
        name: "Mixed Salad Greens 1kg",
        description: "Pre-washed salad mix",
        category: "Produce",
        unit: "kg",
        unit_price: 10.0,
        stock_quantity: 50,
        reorder_level: 80,
        supplier_id: suppliers[3].supplier_id,
      },
      {
        name: "Sugar 25kg Bag",
        description: "Industrial white sugar",
        category: "Grains",
        unit: "kg",
        unit_price: 35.0,
        stock_quantity: 300,
        reorder_level: 150,
        supplier_id: suppliers[6].supplier_id,
      },
      {
        name: "Sparkling Water 500ml",
        description: "Case of 24 mineral water bottles",
        category: "Beverages",
        unit: "case",
        unit_price: 15.0,
        stock_quantity: 800,
        reorder_level: 200,
        supplier_id: suppliers[2].supplier_id,
      },
      {
        name: "Sea Salt 1kg",
        description: "Fine Mediterranean sea salt",
        category: "Condiments",
        unit: "kg",
        unit_price: 4.0,
        stock_quantity: 120,
        reorder_level: 50,
        supplier_id: suppliers[7].supplier_id,
      },
      {
        name: "Frozen French Fries 2kg",
        description: "Shoestring cut, 2kg bag",
        category: "Frozen",
        unit: "bag",
        unit_price: 7.5,
        stock_quantity: 400,
        reorder_level: 100,
        supplier_id: suppliers[1].supplier_id,
      },
      {
        name: "Beef Tenderloin 5kg",
        description: "Vacuum sealed prime cut",
        category: "Meat",
        unit: "kg",
        unit_price: 80.0,
        stock_quantity: 70,
        reorder_level: 100,
        supplier_id: suppliers[4].supplier_id,
      },
    ]);

    console.log(`Products created: ${products.length}`);

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
      {
        name: "Pinnacle Events Catering",
        email: "orders@pinnacleevents.com",
        phone: "+65 6888 7777",
        address: "99 Outram Park, Singapore",
        customer_type: "wholesale",
        status: "inactive",
      },

      {
        name: "The Daily Grind",
        email: "info@dailygrind.com",
        phone: "+65 6444 5555",
        address: "88 Market Street, Singapore",
        customer_type: "retail",
        status: "active",
      },
      {
        name: "Mega Mart Supermarket",
        email: "purchasing@megamart.com",
        phone: "+65 6555 6666",
        address: "1 Retail Park, Singapore",
        customer_type: "wholesale",
        status: "active",
      },
      {
        name: "Downtown Deli",
        email: "orders@downtowndeli.com",
        phone: "+65 6666 7777",
        address: "15 CBD Square, Singapore",
        customer_type: "retail",
        status: "active",
      },
      {
        name: "Catering Hub SG",
        email: "sales@cateringhub.com",
        phone: "+65 6777 8888",
        address: "40 Event Road, Singapore",
        customer_type: "wholesale",
        status: "inactive",
      },
    ]);

    console.log(`Customers created: ${customers.length}`);

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
      total_amount: 950.0,
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

    const purchase3 = await SupplierPurchase.create({
      supplier_id: suppliers[3].supplier_id,
      purchase_date: new Date("2025-10-01"),
      total_amount: 2500.0,
      status: "completed",
      notes: "Monthly produce delivery",
    });

    await SupplierPurchaseItem.bulkCreate([
      {
        purchase_id: purchase3.purchase_id,
        product_id: products[9].product_id,
        quantity: 250,
        unit_cost: 10.0,
        subtotal: 2500.0,
      },
    ]);

    const purchase4 = await SupplierPurchase.create({
      supplier_id: suppliers[4].supplier_id,
      purchase_date: new Date("2025-11-10"),
      total_amount: 2550.0,
      status: "ordered",
      notes: "Urgent meat delivery",
    });

    await SupplierPurchaseItem.bulkCreate([
      {
        purchase_id: purchase4.purchase_id,
        product_id: products[8].product_id,
        quantity: 100,
        unit_cost: 8.5,
        subtotal: 850.0,
      },
      {
        purchase_id: purchase4.purchase_id,
        product_id: products[14].product_id,
        quantity: 20,
        unit_cost: 85.0,
        subtotal: 1700.0,
      },
    ]);

    const purchase5 = await SupplierPurchase.create({
      supplier_id: suppliers[1].supplier_id,
      purchase_date: new Date("2025-11-12"),
      total_amount: 4700.0,
      status: "completed",
      notes: "Annual bulk stock",
    });

    await SupplierPurchaseItem.bulkCreate([
      {
        purchase_id: purchase5.purchase_id,
        product_id: products[10].product_id,
        quantity: 120,
        unit_cost: 35.0,
        subtotal: 4200.0,
      },
      {
        purchase_id: purchase5.purchase_id,
        product_id: products[12].product_id,
        quantity: 100,
        unit_cost: 5.0,
        subtotal: 500.0,
      },
    ]);

    console.log(`Supplier purchases created: 5`);

    const order1 = await CustomerOrder.create({
      customer_id: customers[0].customer_id,
      order_date: new Date("2025-11-01"),
      total_amount: 1050.0,
      status: "completed",
      shipping_address: "10 Orchard Road, Singapore",
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
      order_date: new Date("2025-11-05"),
      total_amount: 1895.0,
      status: "processing",
      shipping_address: "50 Marina Bay, Singapore",
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

    const order3 = await CustomerOrder.create({
      customer_id: customers[5].customer_id,
      order_date: new Date("2025-10-25"),
      total_amount: 5125.0,
      status: "shipped",
      shipping_address: "1 Retail Park, Singapore",
      notes: "Large wholesale order",
    });

    await CustomerOrderItem.bulkCreate([
      {
        order_id: order3.order_id,
        product_id: products[0].product_id,
        quantity: 150,
        unit_price: 12.5,
        subtotal: 1875.0,
      },
      {
        order_id: order3.order_id,
        product_id: products[10].product_id,
        quantity: 80,
        unit_price: 35.0,
        subtotal: 2800.0,
      },
      {
        order_id: order3.order_id,
        product_id: products[11].product_id,
        quantity: 30,
        unit_price: 15.0,
        subtotal: 450.0,
      },
    ]);

    const order4 = await CustomerOrder.create({
      customer_id: customers[6].customer_id,
      order_date: new Date("2025-11-10"),
      total_amount: 479.0,
      status: "completed",
      shipping_address: "15 CBD Square, Singapore",
    });

    await CustomerOrderItem.bulkCreate([
      {
        order_id: order4.order_id,
        product_id: products[2].product_id,
        quantity: 40,
        unit_price: 3.5,
        subtotal: 140.0,
      },
      {
        order_id: order4.order_id,
        product_id: products[5].product_id,
        quantity: 5,
        unit_price: 22.0,
        subtotal: 110.0,
      },
      {
        order_id: order4.order_id,
        product_id: products[9].product_id,
        quantity: 15,
        unit_price: 10.0,
        subtotal: 150.0,
      },
      {
        order_id: order4.order_id,
        product_id: products[12].product_id,
        quantity: 19,
        unit_price: 4.0,
        subtotal: 76.0,
      },
    ]);

    const order5 = await CustomerOrder.create({
      customer_id: customers[2].customer_id,
      order_date: new Date("2025-11-14"),
      total_amount: 1450.0,
      status: "pending",
      shipping_address: "25 Tanjong Pagar, Singapore",
      notes: "Need delivery before 1pm",
    });

    await CustomerOrderItem.bulkCreate([
      {
        order_id: order5.order_id,
        product_id: products[3].product_id,
        quantity: 100,
        unit_price: 4.2,
        subtotal: 420.0,
      },
      {
        order_id: order5.order_id,
        product_id: products[13].product_id,
        quantity: 80,
        unit_price: 7.5,
        subtotal: 600.0,
      },
      {
        order_id: order5.order_id,
        product_id: products[8].product_id,
        quantity: 50,
        unit_price: 8.5,
        subtotal: 425.0,
      },
    ]);

    const order6 = await CustomerOrder.create({
      customer_id: customers[1].customer_id,
      order_date: new Date("2025-09-01"),
      total_amount: 720.0,
      status: "completed",
      shipping_address: "50 Marina Bay, Singapore",
    });

    await CustomerOrderItem.bulkCreate([
      {
        order_id: order6.order_id,
        product_id: products[14].product_id,
        quantity: 9,
        unit_price: 80.0,
        subtotal: 720.0,
      },
    ]);

    const order7 = await CustomerOrder.create({
      customer_id: customers[4].customer_id,
      order_date: new Date("2025-11-13"),
      total_amount: 440.0,
      status: "shipped",
      shipping_address: "88 Market Street, Singapore",
    });

    await CustomerOrderItem.bulkCreate([
      {
        order_id: order7.order_id,
        product_id: products[5].product_id,
        quantity: 20,
        unit_price: 22.0,
        subtotal: 440.0,
      },
    ]);

    const order8 = await CustomerOrder.create({
      customer_id: customers[0].customer_id,
      order_date: new Date("2025-08-01"),
      total_amount: 100.0,
      status: "cancelled",
      shipping_address: "10 Orchard Road, Singapore",
    });

    await CustomerOrderItem.bulkCreate([
      {
        order_id: order8.order_id,
        product_id: products[4].product_id,
        quantity: 15,
        unit_price: 5.8,
        subtotal: 87.0,
      },
    ]);

    console.log(`Customer orders created: 8`);

    console.log("=== Database seeded successfully! ===");
    console.log("Sample Data Summary:");
    console.log(`- ${suppliers.length} Suppliers (7 Active, 1 Inactive)`);
    console.log(`- ${products.length} Products (4 currently low stock)`);
    console.log(`- ${customers.length} Customers (6 Active, 2 Inactive)`);
    console.log(`- 5 Supplier Purchases (4 Completed, 1 Ordered)`);
    console.log(
      `- 8 Customer Orders (4 Completed, 2 Shipped, 1 Processing, 1 Pending, 1 Cancelled)`
    );

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
