-- 1) Product_Categories
CREATE TABLE Product_Categories (
	category_id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL UNIQUE,
	description TEXT
);

-- 2) Products
CREATE TABLE Products (
	product_id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	description TEXT,
	category_id INTEGER,
	stock_quantity INTEGER NOT NULL DEFAULT 0,
	unit_price REAL NOT NULL,
	supplier_id INTEGER NOT NULL,
	reorder_level INTEGER NOT NULL DEFAULT 100,
	FOREIGN KEY (category_id) REFERENCES Product_Categories(category_id) ON DELETE SET NULL,
	FOREIGN KEY (supplier_id) REFERENCES Suppliers(supplier_id) ON DELETE SET NULL
);

-- 3) Suppliers
CREATE TABLE Suppliers (
	supplier_id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	contact_person TEXT,
	address TEXT,
	email TEXT UNIQUE,
	phone TEXT
);

-- 4) Supplier_Purchases
CREATE TABLE Supplier_Purchases (
	purchase_id INTEGER PRIMARY KEY AUTOINCREMENT,
	supplier_id INTEGER NOT NULL,
	purchase_date DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	total_amount REAL NOT NULL DEFAULT 0.00,
	status TEXT DEFAULT 'Pending',
	FOREIGN KEY (supplier_id) REFERENCES Suppliers(supplier_id) ON DELETE RESTRICT
);

-- 5) Supplier_Purchase_Items
CREATE TABLE Supplier_Purchase_Items (
	purchase_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
	purchase_id INTEGER NOT NULL,
	product_id INTEGER NOT NULL,
	quantity INTEGER NOT NULL,
	unit_price REAL NOT NULL,
	FOREIGN KEY (purchase_id) REFERENCES Supplier_Purchases(purchase_id) ON DELETE CASCADE,
	FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE RESTRICT
);

-- 6) Customers
CREATE TABLE Customers (
	customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	email TEXT UNIQUE,
	phone TEXT,
	address TEXT
);

-- 7) Customer_Orders
CREATE TABLE Customer_Orders (
	order_id INTEGER PRIMARY KEY AUTOINCREMENT,
	customer_id INTEGER NOT NULL,
	order_date DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	total_amount REAL NOT NULL DEFAULT 0.00,
	status TEXT DEFAULT 'Pending',
	FOREIGN KEY (customer_id) REFERENCES Customers(customer_id) ON DELETE RESTRICT
);

-- 8) Customer_Order_Items
CREATE TABLE Customer_Order_Items (
	order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
	order_id INTEGER NOT NULL,
	product_id INTEGER NOT NULL,
	quantity INTEGER NOT NULL,
	unit_price REAL NOT NULL,
	FOREIGN KEY (order_id) REFERENCES Customer_Orders(order_id) ON DELETE CASCADE,
	FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE RESTRICT
);