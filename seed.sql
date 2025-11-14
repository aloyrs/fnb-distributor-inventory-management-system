INSERT INTO product_categories (name) VALUES ('Beverages'), ('Snacks');

INSERT INTO products (sku, name, category_id, unit, reorder_level)
VALUES ('BEV-001','Sparkling Water 330ml',1,'bottle',24),
       ('SNK-010','Potato Chips 150g',2,'bag',12);

-- do not need to include updated_at as it is populated automatically as CURRENT_TIMESTAMP
INSERT INTO product_inventory (product_id, quantity)
VALUES (1, 60),
       (2, 10);