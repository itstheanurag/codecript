/**
 * The sample schema used by the SQL playground and by the "Run" buttons in
 * the SQL deep-dive articles. Keeping it in one place guarantees that every
 * example in the content can actually be executed against the same data.
 *
 * PostgreSQL dialect. Sized so joins, aggregates, window functions and
 * EXPLAIN all return interesting results (not 3 hand-written rows).
 */
export const SAMPLE_SCHEMA_SQL = `
CREATE TABLE users (
  id          integer PRIMARY KEY,
  email       text NOT NULL UNIQUE,
  full_name   text NOT NULL,
  country     text NOT NULL,
  created_at  timestamptz NOT NULL
);

CREATE TABLE products (
  id           integer PRIMARY KEY,
  name         text NOT NULL,
  category     text NOT NULL,
  price_cents  integer NOT NULL,
  in_stock     boolean NOT NULL
);

CREATE TABLE orders (
  id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id      integer NOT NULL REFERENCES users(id),
  status       text NOT NULL CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  placed_at    timestamptz NOT NULL,
  total_cents  integer NOT NULL DEFAULT 0
);

CREATE TABLE order_items (
  id                integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id          integer NOT NULL REFERENCES orders(id),
  product_id        integer NOT NULL REFERENCES products(id),
  quantity          integer NOT NULL CHECK (quantity > 0),
  unit_price_cents  integer NOT NULL
);

CREATE TABLE employees (
  id          integer PRIMARY KEY,
  full_name   text NOT NULL,
  department  text NOT NULL,
  manager_id  integer REFERENCES employees(id),
  salary_cents integer NOT NULL,
  hired_at    date NOT NULL
);

INSERT INTO users (id, email, full_name, country, created_at)
SELECT
  i,
  'user' || i || '@example.com',
  (ARRAY['Ada', 'Grace', 'Alan', 'Linus', 'Margaret', 'Dennis', 'Barbara', 'Ken', 'Radia', 'Guido'])[1 + (i % 10)]
    || ' ' ||
  (ARRAY['Lovelace', 'Hopper', 'Turing', 'Torvalds', 'Hamilton', 'Ritchie', 'Liskov', 'Thompson', 'Perlman', 'Rossum'])[1 + (i % 10)],
  (ARRAY['IN', 'US', 'DE', 'BR', 'JP', 'GB'])[1 + (i % 6)],
  now() - (i * 3 || ' days')::interval
FROM generate_series(1, 60) AS i;

INSERT INTO products (id, name, category, price_cents, in_stock)
SELECT
  i,
  'Product ' || i,
  (ARRAY['books', 'electronics', 'home', 'outdoors'])[1 + (i % 4)],
  500 + ((i * 137) % 9000),
  (i % 4) <> 0
FROM generate_series(1, 24) AS i;

INSERT INTO orders (user_id, status, placed_at)
SELECT
  1 + ((i * 7) % 50),
  (ARRAY['pending', 'paid', 'shipped', 'delivered', 'cancelled'])[1 + (i % 5)],
  now() - (i * 9 || ' hours')::interval
FROM generate_series(1, 180) AS i;

-- Two or three line items per order, priced from the product catalogue.
INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents)
SELECT
  o.id,
  p.id,
  1 + ((o.id + p.id) % 3),
  p.price_cents
FROM orders AS o
CROSS JOIN generate_series(1, 3) AS k
JOIN products AS p ON p.id = 1 + ((o.id * k * 5) % 24)
WHERE (o.id + k) % 4 <> 0;

UPDATE orders AS o
SET total_cents = COALESCE(
  (SELECT SUM(oi.quantity * oi.unit_price_cents) FROM order_items AS oi WHERE oi.order_id = o.id),
  0
);

INSERT INTO employees (id, full_name, department, manager_id, salary_cents, hired_at) VALUES
  (1,  'Priya Nair',      'Engineering', NULL, 21500000, '2015-02-09'),
  (2,  'Marcus Webb',     'Engineering', 1,    17800000, '2016-06-20'),
  (3,  'Sofia Almeida',   'Engineering', 1,    16900000, '2017-01-16'),
  (4,  'Daniel Kim',      'Engineering', 2,    14200000, '2018-03-05'),
  (5,  'Aisha Rahman',    'Engineering', 2,    13100000, '2019-08-12'),
  (6,  'Tom Okafor',      'Engineering', 3,    12600000, '2020-11-02'),
  (7,  'Lena Fischer',    'Engineering', 3,    11800000, '2021-04-19'),
  (8,  'Ravi Menon',      'Product',     1,    15500000, '2017-09-11'),
  (9,  'Emma Laurent',    'Product',     8,    11200000, '2021-07-26'),
  (10, 'Hugo Santos',     'Product',     8,    10600000, '2022-02-14'),
  (11, 'Nora Haddad',     'Design',      1,    13900000, '2018-10-08'),
  (12, 'Yuki Tanaka',     'Design',      11,   10400000, '2022-06-06'),
  (13, 'Grace Mbeki',     'Operations',  1,    12100000, '2019-05-13'),
  (14, 'Owen Clarke',     'Operations',  13,    9700000, '2023-01-23');

-- Indexes the query-plan chapter talks about.
CREATE INDEX orders_user_id_idx ON orders (user_id);
CREATE INDEX orders_placed_at_idx ON orders (placed_at);
CREATE INDEX order_items_order_id_idx ON order_items (order_id);

ANALYZE;
`;
