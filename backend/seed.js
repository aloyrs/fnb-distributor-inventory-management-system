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

const PRODUCT_SELLING_PRICES = [
  12.5, 18.9, 3.5, 4.2, 5.8, 22.0, 2.5, 6.5, 8.5, 10.0, 35.0, 15.0, 4.0, 7.5,
  80.0,
];

const getPurchaseCost = (productIndex) => {
  const sellingPrice = PRODUCT_SELLING_PRICES[productIndex];
  return parseFloat((sellingPrice * 0.8).toFixed(2));
};

const createMany = async (Model, items) => {
  const created = [];
  for (const it of items) {
    const rec = await Model.create(it);
    created.push(rec);
  }
  return created;
};

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log("Database synced (force: true)");

    // --- Suppliers ---
    const supplierSpecs = [
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
    ];
    const suppliers = await createMany(Supplier, supplierSpecs);
    console.log(`Created ${suppliers.length} suppliers`);

    // --- Products
    const productSpecs = [
      {
        name: "Organic Rice 5kg",
        description: "Premium organic white rice",
        category: "Grains",
        unit: "kg",
        unit_price: 12.5,
        stock_quantity: 450,
        reorder_level: 100,
        supplierIndex: 0,
      },
      {
        name: "Olive Oil 1L",
        description: "Extra virgin olive oil",
        category: "Oils",
        unit: "L",
        unit_price: 18.9,
        stock_quantity: 80,
        reorder_level: 100,
        supplierIndex: 1,
      },
      {
        name: "Fresh Milk 1L",
        description: "Full cream fresh milk",
        category: "Dairy",
        unit: "L",
        unit_price: 3.5,
        stock_quantity: 250,
        reorder_level: 150,
        supplierIndex: 0,
      },
      {
        name: "Pasta 500g",
        description: "Italian pasta",
        category: "Grains",
        unit: "g",
        unit_price: 4.2,
        stock_quantity: 350,
        reorder_level: 100,
        supplierIndex: 1,
      },
      {
        name: "Orange Juice 1L",
        description: "Freshly squeezed orange juice",
        category: "Beverages",
        unit: "L",
        unit_price: 5.8,
        stock_quantity: 60,
        reorder_level: 100,
        supplierIndex: 2,
      },
      {
        name: "Coffee Beans 500g",
        description: "Premium Arabica coffee beans",
        category: "Beverages",
        unit: "g",
        unit_price: 22.0,
        stock_quantity: 120,
        reorder_level: 50,
        supplierIndex: 2,
      },
      {
        name: "Canned Tomatoes 400g",
        description: "Whole peeled tomatoes",
        category: "Canned Goods",
        unit: "g",
        unit_price: 2.5,
        stock_quantity: 500,
        reorder_level: 200,
        supplierIndex: 0,
      },
      {
        name: "Soy Sauce 1L",
        description: "Premium dark soy sauce",
        category: "Condiments",
        unit: "L",
        unit_price: 6.5,
        stock_quantity: 180,
        reorder_level: 100,
        supplierIndex: 1,
      },
      {
        name: "Chicken Breast 1kg",
        description: "Frozen chicken breast",
        category: "Meat",
        unit: "kg",
        unit_price: 8.5,
        stock_quantity: 150,
        reorder_level: 50,
        supplierIndex: 4,
      },
      {
        name: "Mixed Salad Greens 1kg",
        description: "Pre-washed salad mix",
        category: "Produce",
        unit: "kg",
        unit_price: 10.0,
        stock_quantity: 50,
        reorder_level: 80,
        supplierIndex: 3,
      },
      {
        name: "Sugar 25kg Bag",
        description: "Industrial white sugar",
        category: "Grains",
        unit: "kg",
        unit_price: 35.0,
        stock_quantity: 300,
        reorder_level: 150,
        supplierIndex: 6,
      },
      {
        name: "Sparkling Water 500ml",
        description: "Case of 24 mineral water bottles",
        category: "Beverages",
        unit: "case",
        unit_price: 15.0,
        stock_quantity: 800,
        reorder_level: 200,
        supplierIndex: 2,
      },
      {
        name: "Sea Salt 1kg",
        description: "Fine Mediterranean sea salt",
        category: "Condiments",
        unit: "kg",
        unit_price: 4.0,
        stock_quantity: 120,
        reorder_level: 50,
        supplierIndex: 7,
      },
      {
        name: "Frozen French Fries 2kg",
        description: "Shoestring cut, 2kg bag",
        category: "Frozen",
        unit: "bag",
        unit_price: 7.5,
        stock_quantity: 400,
        reorder_level: 100,
        supplierIndex: 1,
      },
      {
        name: "Beef Tenderloin 5kg",
        description: "Vacuum sealed prime cut",
        category: "Meat",
        unit: "kg",
        unit_price: 80.0,
        stock_quantity: 70,
        reorder_level: 100,
        supplierIndex: 4,
      },
    ];

    const productCreateSpecs = productSpecs.map((p) => ({
      name: p.name,
      description: p.description,
      category: p.category,
      unit: p.unit,
      unit_price: p.unit_price,
      stock_quantity: p.stock_quantity,
      reorder_level: p.reorder_level,
      supplier_id: suppliers[p.supplierIndex].supplier_id,
    }));

    const products = await createMany(Product, productCreateSpecs);
    console.log(`Created ${products.length} products`);

    // --- Customers ---
    const customerSpecs = [
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
    ];
    const customers = await createMany(Customer, customerSpecs);
    console.log(`Created ${customers.length} customers`);

    // --- Supplier Purchases specs
    const supplierPurchaseSpecs = [
      // 2023
      {
        supplierIndex: 5,
        purchase_date: "2023-01-09",
        status: "completed",
        initialNotes: "Stock replenishment",
      },
      {
        supplierIndex: 1,
        purchase_date: "2023-02-14",
        status: "ordered",
        initialNotes: "Upcoming large order",
      },
      {
        supplierIndex: 3,
        purchase_date: "2023-03-24",
        status: "completed",
        initialNotes: "Stock replenishment",
      },
      {
        supplierIndex: 2,
        purchase_date: "2023-05-18",
        status: "completed",
        initialNotes: "Stock replenishment",
      },
      {
        supplierIndex: 0,
        purchase_date: "2023-06-03",
        status: "completed",
        initialNotes: "Stock replenishment",
      },
      {
        supplierIndex: 4,
        purchase_date: "2023-07-11",
        status: "ordered",
        initialNotes: "Upcoming order",
      },
      {
        supplierIndex: 1,
        purchase_date: "2023-08-27",
        status: "completed",
        initialNotes: "Stock replenishment",
      },
      {
        supplierIndex: 5,
        purchase_date: "2023-10-18",
        status: "completed",
        initialNotes: "Stock replenishment",
      },
      {
        supplierIndex: 7,
        purchase_date: "2023-11-20",
        status: "completed",
        initialNotes: "Stock replenishment",
      },
      // 2024
      {
        supplierIndex: 0,
        purchase_date: "2024-01-05",
        status: "completed",
        initialNotes: "Stock replenishment",
      },
      {
        supplierIndex: 4,
        purchase_date: "2024-03-12",
        status: "completed",
        initialNotes: "Stock replenishment",
      },
      {
        supplierIndex: 2,
        purchase_date: "2024-05-01",
        status: "completed",
        initialNotes: "Stock replenishment",
      },
      {
        supplierIndex: 6,
        purchase_date: "2024-07-29",
        status: "ordered",
        initialNotes: "Small order",
      },
      {
        supplierIndex: 3,
        purchase_date: "2024-09-09",
        status: "completed",
        initialNotes: "Stock replenishment",
      },
      {
        supplierIndex: 0,
        purchase_date: "2024-11-28",
        status: "completed",
        initialNotes: "Stock replenishment",
      },
      // 2025
      {
        supplierIndex: 1,
        purchase_date: "2025-01-10",
        status: "completed",
        initialNotes: "Stock replenishment",
      },
      {
        supplierIndex: 3,
        purchase_date: "2025-02-18",
        status: "ordered",
        initialNotes: "Upcoming bulk order",
      },
      {
        supplierIndex: 0,
        purchase_date: "2025-03-12",
        status: "completed",
        initialNotes: "Stock replenishment",
      },
      {
        supplierIndex: 4,
        purchase_date: "2025-06-20",
        status: "completed",
        initialNotes: "Stock replenishment",
      },
      {
        supplierIndex: 2,
        purchase_date: "2025-09-15",
        status: "ordered",
        initialNotes: "Seasonal restock",
      },
      {
        supplierIndex: 6,
        purchase_date: "2025-11-02",
        status: "completed",
        initialNotes: "Stock replenishment",
      },
    ];

    // create purchases and collect instances in same order
    const purchases = [];
    for (const s of supplierPurchaseSpecs) {
      const purchase = await SupplierPurchase.create({
        supplier_id: suppliers[s.supplierIndex].supplier_id,
        purchase_date: new Date(s.purchase_date),
        total_amount: 0, // will compute after adding items
        status: s.status,
        notes: s.initialNotes,
      });
      purchases.push(purchase);
    }
    console.log(
      `Created ${purchases.length} supplier purchases (placeholders for totals)`
    );

    // --- Supplier Purchase Items specs
    const purchaseItemSpecs = [
      // purchase 0 (2023-01-09)
      { purchaseIndex: 0, productIndex: 9, quantity: 130 },
      { purchaseIndex: 0, productIndex: 10, quantity: 15 },
      // purchase 1 (2023-02-14)
      { purchaseIndex: 1, productIndex: 14, quantity: 100 },
      { purchaseIndex: 1, productIndex: 0, quantity: 80 },
      // purchase 2 (2023-03-24)
      { purchaseIndex: 2, productIndex: 9, quantity: 50 },
      { purchaseIndex: 2, productIndex: 3, quantity: 20 },
      // purchase 3 (2023-05-18)
      { purchaseIndex: 3, productIndex: 5, quantity: 40 },
      { purchaseIndex: 3, productIndex: 2, quantity: 120 },
      // purchase 4 (2023-06-03)
      { purchaseIndex: 4, productIndex: 0, quantity: 250 },
      { purchaseIndex: 4, productIndex: 6, quantity: 150 },
      // purchase 5 (2023-07-11)
      { purchaseIndex: 5, productIndex: 3, quantity: 65 },
      // purchase 6 (2023-08-27)
      { purchaseIndex: 6, productIndex: 1, quantity: 40 },
      { purchaseIndex: 6, productIndex: 12, quantity: 20 },
      // purchase 7 (2023-10-18)
      { purchaseIndex: 7, productIndex: 10, quantity: 60 },
      // purchase 8 (2023-11-20)
      { purchaseIndex: 8, productIndex: 9, quantity: 100 },
      { purchaseIndex: 8, productIndex: 14, quantity: 80 },
      { purchaseIndex: 8, productIndex: 0, quantity: 10 },
      // purchase 9 (2024-01-05)
      { purchaseIndex: 9, productIndex: 4, quantity: 100 },
      // purchase 10 (2024-03-12)
      { purchaseIndex: 10, productIndex: 8, quantity: 200 },
      { purchaseIndex: 10, productIndex: 14, quantity: 40 },
      // purchase 11 (2024-05-01)
      { purchaseIndex: 11, productIndex: 11, quantity: 100 },
      // purchase 12 (2024-07-29)
      { purchaseIndex: 12, productIndex: 14, quantity: 2 },
      // purchase 13 (2024-09-09)
      { purchaseIndex: 13, productIndex: 9, quantity: 90 },
      { purchaseIndex: 13, productIndex: 14, quantity: 30 },
      // purchase 14 (2024-11-28)
      { purchaseIndex: 14, productIndex: 0, quantity: 100 },
      { purchaseIndex: 14, productIndex: 6, quantity: 120 },
      // purchase 15 (2025-01-10)
      { purchaseIndex: 15, productIndex: 0, quantity: 150 },
      { purchaseIndex: 15, productIndex: 12, quantity: 70 },
      // purchase 16 (2025-02-18)
      { purchaseIndex: 16, productIndex: 3, quantity: 120 },
      { purchaseIndex: 16, productIndex: 9, quantity: 60 },
      // purchase 17 (2025-03-12)
      { purchaseIndex: 17, productIndex: 6, quantity: 300 },
      { purchaseIndex: 17, productIndex: 4, quantity: 150 },
      // purchase 18 (2025-06-20)
      { purchaseIndex: 18, productIndex: 8, quantity: 80 },
      { purchaseIndex: 18, productIndex: 11, quantity: 40 },
      // purchase 19 (2025-09-15)
      { purchaseIndex: 19, productIndex: 10, quantity: 150 },
      // purchase 20 (2025-11-02)
      { purchaseIndex: 20, productIndex: 1, quantity: 50 },
    ];

    // create purchase items, compute subtotal and accumulate totals per purchase
    const purchaseTotals = new Array(purchases.length).fill(0);
    for (const spec of purchaseItemSpecs) {
      const purchase = purchases[spec.purchaseIndex];
      const pIndex = spec.productIndex;
      const unit_cost = getPurchaseCost(pIndex);
      const subtotal = parseFloat((unit_cost * spec.quantity).toFixed(2));
      await SupplierPurchaseItem.create({
        purchase_id: purchase.purchase_id,
        product_id: products[pIndex].product_id,
        quantity: spec.quantity,
        unit_cost,
        subtotal,
      });
      purchaseTotals[spec.purchaseIndex] += subtotal;
    }

    // update each purchase with computed total_amount
    for (let i = 0; i < purchases.length; i++) {
      const total = parseFloat(purchaseTotals[i].toFixed(2));
      await purchases[i].update({ total_amount: total });
    }
    console.log("Created supplier purchase items and updated totals");

    // --- Customer Orders specs (one of each status + more) ---
    // statuses used: completed, processing, shipped, pending, cancelled, delivered
    const orderSpecs = [
      // 2023 orders
      {
        customerIndex: 1,
        order_date: "2023-01-08",
        status: "completed",
        note: "Standard monthly order",
        items: [
          { p: 1, q: 50 },
          { p: 0, q: 15 },
          { p: 6, q: 22 },
        ],
      },
      {
        customerIndex: 5,
        order_date: "2023-01-20",
        status: "completed",
        note: "Standard monthly order",
        items: [
          { p: 10, q: 80 },
          { p: 4, q: 7 },
          { p: 12, q: 50 },
        ],
      },
      {
        customerIndex: 5,
        order_date: "2023-02-04",
        status: "completed",
        note: "Standard monthly order",
        items: [
          { p: 10, q: 40 },
          { p: 11, q: 10 },
          { p: 2, q: 3 },
        ],
      },
      {
        customerIndex: 0,
        order_date: "2023-02-17",
        status: "completed",
        note: "Small order",
        items: [
          { p: 4, q: 15 },
          { p: 12, q: 5 },
        ],
      },
      {
        customerIndex: 2,
        order_date: "2023-03-08",
        status: "completed",
        note: "Small order",
        items: [
          { p: 0, q: 10 },
          { p: 3, q: 10 },
        ],
      },
      {
        customerIndex: 4,
        order_date: "2023-03-24",
        status: "completed",
        note: "Cafe restock",
        items: [
          { p: 5, q: 10 },
          { p: 6, q: 22 },
        ],
      },
      {
        customerIndex: 6,
        order_date: "2023-04-03",
        status: "shipped",
        note: "Event order",
        items: [
          { p: 8, q: 50 },
          { p: 14, q: 50 },
          { p: 12, q: 4 },
        ],
      },
      {
        customerIndex: 4,
        order_date: "2023-04-18",
        status: "completed",
        note: "Restock",
        items: [
          { p: 3, q: 30 },
          { p: 7, q: 5 },
          { p: 2, q: 5 },
        ],
      },
      {
        customerIndex: 3,
        order_date: "2023-05-29",
        status: "completed",
        note: "Wholesale order",
        items: [
          { p: 0, q: 20 },
          { p: 9, q: 10 },
          { p: 3, q: 13 },
        ],
      },
      {
        customerIndex: 7,
        order_date: "2023-06-15",
        status: "completed",
        note: "Small order",
        items: [{ p: 7, q: 50 }],
      },
      {
        customerIndex: 0,
        order_date: "2023-07-07",
        status: "completed",
        note: "Monthly",
        items: [
          { p: 14, q: 4 },
          { p: 12, q: 5 },
        ],
      },
      {
        customerIndex: 2,
        order_date: "2023-07-28",
        status: "shipped",
        note: "Shipped",
        items: [
          { p: 0, q: 80 },
          { p: 1, q: 10 },
          { p: 14, q: 23 },
        ],
      },
      {
        customerIndex: 5,
        order_date: "2023-08-16",
        status: "completed",
        note: "Large restock",
        items: [{ p: 10, q: 40 }],
      },
      {
        customerIndex: 1,
        order_date: "2023-09-02",
        status: "pending",
        note: "Pending approval",
        items: [
          { p: 5, q: 20 },
          { p: 11, q: 5 },
        ],
      },
      {
        customerIndex: 4,
        order_date: "2023-09-20",
        status: "completed",
        note: "Small",
        items: [
          { p: 4, q: 15 },
          { p: 6, q: 26 },
        ],
      },
      {
        customerIndex: 6,
        order_date: "2023-10-10",
        status: "completed",
        note: "Catering",
        items: [
          { p: 8, q: 80 },
          { p: 14, q: 35 },
          { p: 0, q: 20 },
        ],
      },
      {
        customerIndex: 7,
        order_date: "2023-11-04",
        status: "shipped",
        note: "Shipped",
        items: [
          { p: 0, q: 20 },
          { p: 14, q: 15 },
          { p: 9, q: 15 },
        ],
      },
      {
        customerIndex: 1,
        order_date: "2023-11-29",
        status: "completed",
        note: "Monthly",
        items: [
          { p: 14, q: 9 },
          { p: 10, q: 9 },
        ],
      },
      {
        customerIndex: 2,
        order_date: "2023-12-16",
        status: "completed",
        note: "Monthly",
        items: [
          { p: 8, q: 45 },
          { p: 11, q: 50 },
          { p: 14, q: 31 },
        ],
      },
      // 2024 some orders
      {
        customerIndex: 0,
        order_date: "2024-01-26",
        status: "completed",
        note: "Monthly",
        items: [{ p: 9, q: 60 }],
      },
      {
        customerIndex: 3,
        order_date: "2024-02-11",
        status: "completed",
        note: "Wholesale",
        items: [
          { p: 1, q: 50 },
          { p: 6, q: 97 },
        ],
      },
      {
        customerIndex: 6,
        order_date: "2024-03-29",
        status: "completed",
        note: "Large order",
        items: [
          { p: 10, q: 50 },
          { p: 4, q: 10 },
        ],
      },
      {
        customerIndex: 4,
        order_date: "2024-05-15",
        status: "cancelled",
        note: "Customer cancel",
        items: [
          { p: 4, q: 25 },
          { p: 2, q: 5 },
        ],
      },
      {
        customerIndex: 5,
        order_date: "2024-06-05",
        status: "shipped",
        note: "Shipped",
        items: [
          { p: 9, q: 35 },
          { p: 6, q: 10 },
        ],
      },
      {
        customerIndex: 0,
        order_date: "2024-07-02",
        status: "completed",
        note: "Monthly",
        items: [
          { p: 11, q: 50 },
          { p: 14, q: 10 },
          { p: 0, q: 3 },
        ],
      },
      {
        customerIndex: 2,
        order_date: "2024-08-14",
        status: "completed",
        note: "Monthly",
        items: [
          { p: 4, q: 25 },
          { p: 6, q: 15 },
          { p: 0, q: 4 },
        ],
      },
      {
        customerIndex: 1,
        order_date: "2024-09-17",
        status: "completed",
        note: "Monthly",
        items: [
          { p: 9, q: 30 },
          { p: 12, q: 5 },
        ],
      },
      {
        customerIndex: 6,
        order_date: "2024-10-06",
        status: "pending",
        note: "Pending",
        items: [
          { p: 8, q: 50 },
          { p: 6, q: 20 },
        ],
      },
      {
        customerIndex: 5,
        order_date: "2024-11-13",
        status: "completed",
        note: "Monthly",
        items: [{ p: 9, q: 60 }],
      },
      {
        customerIndex: 4,
        order_date: "2024-12-25",
        status: "completed",
        note: "Holiday order",
        items: [
          { p: 10, q: 25 },
          { p: 14, q: 20 },
          { p: 6, q: 8 },
        ],
      },
      // 2025 example orders (one of each important status included)
      {
        customerIndex: 0,
        order_date: "2025-01-07",
        status: "completed",
        note: "Monthly 2025",
        items: [
          { p: 0, q: 20 },
          { p: 11, q: 10 },
        ],
      },
      {
        customerIndex: 3,
        order_date: "2025-02-22",
        status: "processing",
        note: "Processing",
        items: [
          { p: 3, q: 30 },
          { p: 12, q: 5 },
        ],
      },
      {
        customerIndex: 5,
        order_date: "2025-04-10",
        status: "completed",
        note: "Large restock 2025",
        items: [
          { p: 10, q: 60 },
          { p: 4, q: 10 },
        ],
      },
      {
        customerIndex: 2,
        order_date: "2025-06-03",
        status: "shipped",
        note: "Shipped 2025",
        items: [
          { p: 8, q: 45 },
          { p: 14, q: 10 },
        ],
      },
      {
        customerIndex: 6,
        order_date: "2025-08-29",
        status: "delivered",
        note: "Delivered 2025",
        items: [
          { p: 9, q: 40 },
          { p: 1, q: 10 },
        ],
      },
      {
        customerIndex: 1,
        order_date: "2025-10-15",
        status: "cancelled",
        note: "Cancelled 2025",
        items: [{ p: 10, q: 20 }],
      },
    ];

    // Create orders first with total_amount: 0, then create items, compute totals and update order totals
    const orders = [];
    for (const o of orderSpecs) {
      const ord = await CustomerOrder.create({
        customer_id: customers[o.customerIndex].customer_id,
        order_date: new Date(o.order_date),
        total_amount: 0,
        status: o.status,
        shipping_address: `${customers[o.customerIndex].address}`,
        notes: o.note,
      });
      orders.push({ instance: ord, itemsSpec: o.items });
    }

    // Create order items and update totals
    for (const o of orders) {
      let orderTotal = 0;
      for (const it of o.itemsSpec) {
        const unit_price = PRODUCT_SELLING_PRICES[it.p];
        const subtotal = parseFloat((unit_price * it.q).toFixed(2));
        await CustomerOrderItem.create({
          order_id: o.instance.order_id,
          product_id: products[it.p].product_id,
          quantity: it.q,
          unit_price,
          subtotal,
        });
        orderTotal += subtotal;
      }
      await o.instance.update({
        total_amount: parseFloat(orderTotal.toFixed(2)),
      });
    }
    console.log("Created customer orders & order items and updated totals");

    // --- Summary Log ---
    const supplierCount = suppliers.length;
    const productCount = products.length;
    const customerCount = customers.length;
    const purchaseCount = purchases.length;
    const orderCount = orders.length;

    console.log("=== Database seeded successfully ===");
    console.log(`Suppliers: ${supplierCount}`);
    console.log(`Products: ${productCount}`);
    console.log(`Customers: ${customerCount}`);
    console.log(`Supplier Purchases: ${purchaseCount}`);
    console.log(`Customer Orders: ${orderCount}`);

    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
};

seedDatabase();
