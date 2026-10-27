export type QuestionTopic =
  | "Filtering"
  | "Joins"
  | "Aggregation"
  | "Subqueries"
  | "Window functions"
  | "CTEs & recursion"
  | "Set operations"
  | "Functions & dates";

export type QuestionDifficulty = "easy" | "medium" | "hard";

export interface PracticeQuestion {
  id: string;
  title: string;
  topic: QuestionTopic;
  difficulty: QuestionDifficulty;
  prompt: string;
  hint: string;
  /** Reference answer. All queries are verified against the seeded dataset. */
  solution: string;
  /** Whether the question requires a specific row order. */
  ordered?: boolean;
}

export const TOPIC_ORDER: QuestionTopic[] = [
  "Filtering",
  "Joins",
  "Aggregation",
  "Subqueries",
  "Window functions",
  "CTEs & recursion",
  "Set operations",
  "Functions & dates",
];

/**
 * Practice sheet on the Northwind database (schema `northwind`).
 *
 * The question set is adapted from the MIT-licensed exercise sheet at
 * https://github.com/eirkostop/SQL-Northwind-exercises (questions only; all
 * solutions here are written for PostgreSQL and verified against the data).
 * Dataset: https://github.com/pthom/northwind_psql (Ms-PL).
 */
export const PRACTICE_QUESTIONS: PracticeQuestion[] = [
  {
    id: "de-customers",
    title: "German customers",
    topic: "Filtering",
    difficulty: "easy",
    prompt:
      "List the company name and city of every customer from Germany. Order by company_name ascending.",
    hint: "Filter with WHERE country = 'Germany', then ORDER BY company_name.",
    solution: `SELECT company_name, city
FROM northwind.customers
WHERE country = 'Germany'
ORDER BY company_name`,
    ordered: true,
  },
  {
    id: "expensive-products",
    title: "Premium products",
    topic: "Filtering",
    difficulty: "easy",
    prompt:
      "Show the name and unit price of every product priced above 50. Order by unit_price descending, then product_name ascending.",
    hint: "unit_price is a numeric column, so a plain comparison is enough.",
    solution: `SELECT product_name, unit_price
FROM northwind.products
WHERE unit_price > 50
ORDER BY unit_price DESC, product_name`,
    ordered: true,
  },
  {
    id: "orders-1997",
    title: "Count 1997 orders",
    topic: "Filtering",
    difficulty: "easy",
    prompt:
      "How many orders were placed in 1997? Return a single column named orders.",
    hint: "Use COUNT(*) and a half-open date range: >= 1997-01-01 AND < 1998-01-01.",
    solution: `SELECT COUNT(*) AS orders
FROM northwind.orders
WHERE order_date >= DATE '1997-01-01'
  AND order_date <  DATE '1998-01-01'`,
  },
  {
    id: "null-region",
    title: "No region on file",
    topic: "Filtering",
    difficulty: "easy",
    prompt:
      "Which customers have no region recorded? Return company_name and country. Order by company_name ascending.",
    hint: "NULL is not equal to anything — use IS NULL.",
    solution: `SELECT company_name, country
FROM northwind.customers
WHERE region IS NULL
ORDER BY company_name`,
    ordered: true,
  },
  {
    id: "sales-titles",
    title: "Sales employees",
    topic: "Filtering",
    difficulty: "easy",
    prompt:
      "List employees whose job title contains 'Sales' (case-insensitive): first_name, last_name, title. Order by last_name, then first_name.",
    hint: "ILIKE is PostgreSQL's case-insensitive LIKE.",
    solution: `SELECT first_name, last_name, title
FROM northwind.employees
WHERE title ILIKE '%sales%'
ORDER BY last_name, first_name`,
    ordered: true,
  },
  {
    id: "orders-1996-customers",
    title: "1996 orders with customers",
    topic: "Joins",
    difficulty: "medium",
    prompt:
      "For every order placed in 1996, return order_id, the customer's company_name, and order_date. Order by order_id.",
    hint: "JOIN northwind.orders to northwind.customers on customer_id.",
    solution: `SELECT o.order_id, c.company_name, o.order_date
FROM northwind.orders AS o
JOIN northwind.customers AS c ON c.customer_id = o.customer_id
WHERE o.order_date >= DATE '1996-01-01'
  AND o.order_date <  DATE '1997-01-01'
ORDER BY o.order_id`,
    ordered: true,
  },
  {
    id: "product-categories",
    title: "Products with categories",
    topic: "Joins",
    difficulty: "easy",
    prompt:
      "List product_name and category_name for all products that are not discontinued. Order by category_name, then product_name.",
    hint: "discontinued is an integer flag in Northwind (0 = active).",
    solution: `SELECT p.product_name, c.category_name
FROM northwind.products AS p
JOIN northwind.categories AS c ON c.category_id = p.category_id
WHERE p.discontinued = 0
ORDER BY c.category_name, p.product_name`,
    ordered: true,
  },
  {
    id: "employee-managers",
    title: "Who reports to whom",
    topic: "Joins",
    difficulty: "medium",
    prompt:
      "For every employee, return the employee's full name as employee and their manager's full name as manager (NULL for the boss). Order by the employee's last_name, then first_name.",
    hint: "Self join: employees e LEFT JOIN employees m ON m.employee_id = e.reports_to.",
    solution: `SELECT e.first_name || ' ' || e.last_name AS employee,
       m.first_name || ' ' || m.last_name AS manager
FROM northwind.employees AS e
LEFT JOIN northwind.employees AS m ON m.employee_id = e.reports_to
ORDER BY e.last_name, e.first_name`,
    ordered: true,
  },
  {
    id: "customers-without-orders",
    title: "Customers who never ordered",
    topic: "Joins",
    difficulty: "medium",
    prompt:
      "Find customers that have never placed an order. Return company_name. Order by company_name ascending.",
    hint: "NOT EXISTS is NULL-safe; a LEFT JOIN + IS NULL works too.",
    solution: `SELECT c.company_name
FROM northwind.customers AS c
WHERE NOT EXISTS (
  SELECT 1 FROM northwind.orders AS o WHERE o.customer_id = c.customer_id
)
ORDER BY c.company_name`,
    ordered: true,
  },
  {
    id: "order-10248-details",
    title: "One order's line items",
    topic: "Joins",
    difficulty: "easy",
    prompt:
      "For order 10248, return product_name, quantity and unit_price. Order by product_name.",
    hint: "Join order_details to products on product_id.",
    solution: `SELECT p.product_name, od.quantity, od.unit_price
FROM northwind.order_details AS od
JOIN northwind.products AS p ON p.product_id = od.product_id
WHERE od.order_id = 10248
ORDER BY p.product_name`,
    ordered: true,
  },
  {
    id: "top-freight-countries",
    title: "Freight by country",
    topic: "Aggregation",
    difficulty: "medium",
    prompt:
      "Show the five countries with the highest total freight, as country and total_freight (rounded to 2 decimals). Order by total_freight descending, then country.",
    hint: "Join orders to customers for the country, GROUP BY it, and SUM(freight).",
    solution: `SELECT c.country,
       ROUND(SUM(o.freight)::numeric, 2) AS total_freight
FROM northwind.orders AS o
JOIN northwind.customers AS c ON c.customer_id = o.customer_id
GROUP BY c.country
ORDER BY total_freight DESC, c.country
LIMIT 5`,
    ordered: true,
  },
  {
    id: "orders-per-customer",
    title: "Busy customers",
    topic: "Aggregation",
    difficulty: "medium",
    prompt:
      "Return company_name and the number of orders for every customer with more than 20 orders. Order by orders descending, then company_name ascending.",
    hint: "GROUP BY the customer, then HAVING COUNT(*) > 20.",
    solution: `SELECT c.company_name, COUNT(*) AS orders
FROM northwind.orders AS o
JOIN northwind.customers AS c ON c.customer_id = o.customer_id
GROUP BY c.company_name
HAVING COUNT(*) > 20
ORDER BY orders DESC, c.company_name`,
    ordered: true,
  },
  {
    id: "avg-price-by-category",
    title: "Average price per category",
    topic: "Aggregation",
    difficulty: "easy",
    prompt:
      "Show category_name and the average unit_price of its products, rounded to 2 decimals. Order by category_name ascending.",
    hint: "AVG over a real column returns double precision — cast to numeric before ROUND.",
    solution: `SELECT c.category_name,
       ROUND(AVG(p.unit_price)::numeric, 2) AS avg_price
FROM northwind.products AS p
JOIN northwind.categories AS c ON c.category_id = p.category_id
GROUP BY c.category_name
ORDER BY c.category_name`,
    ordered: true,
  },
  {
    id: "top-employees",
    title: "Top five employees",
    topic: "Aggregation",
    difficulty: "medium",
    prompt:
      "Which five employees handled the most orders? Return employee (full name) and orders, ordered by orders descending, then employee.",
    hint: "GROUP BY the employee and ORDER BY COUNT(*) DESC, then LIMIT 5.",
    solution: `SELECT e.first_name || ' ' || e.last_name AS employee,
       COUNT(*) AS orders
FROM northwind.orders AS o
JOIN northwind.employees AS e ON e.employee_id = o.employee_id
GROUP BY e.employee_id, employee
ORDER BY orders DESC, employee
LIMIT 5`,
    ordered: true,
  },
  {
    id: "orders-by-year",
    title: "Orders per year",
    topic: "Aggregation",
    difficulty: "easy",
    prompt:
      "Return the number of orders per calendar year: year (integer) and orders. Order by year ascending.",
    hint: "EXTRACT(YEAR FROM order_date) works; cast it to int for a clean column.",
    solution: `SELECT EXTRACT(YEAR FROM order_date)::int AS year,
       COUNT(*) AS orders
FROM northwind.orders
GROUP BY 1
ORDER BY 1`,
    ordered: true,
  },
  {
    id: "customers-per-country",
    title: "Concentrated markets",
    topic: "Aggregation",
    difficulty: "easy",
    prompt:
      "Show every country with more than five customers: country and customers. Order by customers descending, then country ascending.",
    hint: "GROUP BY country and filter the groups with HAVING.",
    solution: `SELECT country, COUNT(*) AS customers
FROM northwind.customers
GROUP BY country
HAVING COUNT(*) > 5
ORDER BY customers DESC, country`,
    ordered: true,
  },
  {
    id: "above-avg-price",
    title: "Above-average prices",
    topic: "Subqueries",
    difficulty: "easy",
    prompt:
      "Return product_name and unit_price for products priced above the average price of all products. Order by unit_price descending, then product_name ascending.",
    hint: "A scalar subquery can compute the average once.",
    solution: `SELECT product_name, unit_price
FROM northwind.products
WHERE unit_price > (SELECT AVG(unit_price) FROM northwind.products)
ORDER BY unit_price DESC, product_name`,
    ordered: true,
  },
  {
    id: "chai-buyers",
    title: "Who bought Chai?",
    topic: "Subqueries",
    difficulty: "medium",
    prompt:
      "Return the distinct company_name of every customer who has ordered the product named 'Chai'. Order by company_name ascending.",
    hint: "Join customers → orders → order_details → products, filter the product name, then DISTINCT.",
    solution: `SELECT DISTINCT c.company_name
FROM northwind.customers AS c
JOIN northwind.orders AS o ON o.customer_id = c.customer_id
JOIN northwind.order_details AS od ON od.order_id = o.order_id
JOIN northwind.products AS p ON p.product_id = od.product_id
WHERE p.product_name = 'Chai'
ORDER BY c.company_name`,
    ordered: true,
  },
  {
    id: "fuller-reports",
    title: "Andrew Fuller's team",
    topic: "Subqueries",
    difficulty: "easy",
    prompt:
      "Return first_name, last_name and title for every employee who reports directly to Andrew Fuller. Order by last_name, then first_name.",
    hint: "Use a subquery to look up Andrew's employee_id.",
    solution: `SELECT first_name, last_name, title
FROM northwind.employees
WHERE reports_to = (
  SELECT employee_id FROM northwind.employees
  WHERE first_name = 'Andrew' AND last_name = 'Fuller'
)
ORDER BY last_name, first_name`,
    ordered: true,
  },
  {
    id: "above-country-avg-freight",
    title: "Above-average freight per country",
    topic: "Subqueries",
    difficulty: "hard",
    prompt:
      "Return order_id, ship_country and freight for orders whose freight is above the average freight of orders shipped to the same country. Order by ship_country, then order_id.",
    hint: "Correlated subquery: WHERE o2.ship_country = o.ship_country.",
    solution: `SELECT o.order_id, o.ship_country, o.freight
FROM northwind.orders AS o
WHERE o.freight > (
  SELECT AVG(o2.freight)
  FROM northwind.orders AS o2
  WHERE o2.ship_country = o.ship_country
)
ORDER BY o.ship_country, o.order_id`,
    ordered: true,
  },
  {
    id: "customer-revenue-rank",
    title: "Revenue leaderboard",
    topic: "Window functions",
    difficulty: "hard",
    prompt:
      "Rank customers by total revenue (quantity × unit_price × (1 − discount)). Return company_name, total (rounded to 2 decimals) and rank, ordered by rank then company_name.",
    hint: "Aggregate in a CTE, then use RANK() OVER (ORDER BY total DESC).",
    solution: `WITH revenue AS (
  SELECT c.company_name,
         SUM(od.unit_price * od.quantity * (1 - od.discount)) AS total
  FROM northwind.customers AS c
  JOIN northwind.orders AS o ON o.customer_id = c.customer_id
  JOIN northwind.order_details AS od ON od.order_id = o.order_id
  GROUP BY c.company_name
)
SELECT company_name,
       ROUND(total::numeric, 2) AS total,
       RANK() OVER (ORDER BY total DESC) AS rank
FROM revenue
ORDER BY rank, company_name`,
    ordered: true,
  },
  {
    id: "alfki-order-gaps",
    title: "ALFKI's order timeline",
    topic: "Window functions",
    difficulty: "medium",
    prompt:
      "For customer 'ALFKI', return order_id, order_date and previous_order (the previous order date for the same customer). Order chronologically by order_date, then order_id.",
    hint: "LAG(order_date) OVER (ORDER BY order_date, order_id).",
    solution: `SELECT order_id,
       order_date,
       LAG(order_date) OVER (ORDER BY order_date, order_id) AS previous_order
FROM northwind.orders
WHERE customer_id = 'ALFKI'
ORDER BY order_date, order_id`,
    ordered: true,
  },
  {
    id: "freight-running-total",
    title: "Running freight total",
    topic: "Window functions",
    difficulty: "medium",
    prompt:
      "For the first 20 orders by order_date (ties by order_id), return order_id, order_date, freight and running_total (cumulative freight rounded to 2 decimals). Order by order_date ascending, then order_id ascending.",
    hint: "SUM(freight) OVER (ORDER BY order_date, order_id) with a LIMIT 20.",
    solution: `SELECT order_id,
       order_date,
       freight,
       ROUND(SUM(freight) OVER (ORDER BY order_date, order_id)::numeric, 2) AS running_total
FROM northwind.orders
ORDER BY order_date, order_id
LIMIT 20`,
    ordered: true,
  },
  {
    id: "top3-products-per-category",
    title: "Top three per category",
    topic: "Window functions",
    difficulty: "hard",
    prompt:
      "Return category_name, product_name, unit_price and rank for the three most expensive products in each category (ties broken by product_id). Order by category_name, then rank.",
    hint: "ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY unit_price DESC, product_id) in a CTE.",
    solution: `WITH ranked AS (
  SELECT c.category_name,
         p.product_name,
         p.unit_price,
         ROW_NUMBER() OVER (
           PARTITION BY p.category_id
           ORDER BY p.unit_price DESC, p.product_id
         ) AS rn
  FROM northwind.products AS p
  JOIN northwind.categories AS c ON c.category_id = p.category_id
)
SELECT category_name, product_name, unit_price, rn AS rank
FROM ranked
WHERE rn <= 3
ORDER BY category_name, rank`,
    ordered: true,
  },
  {
    id: "revenue-share-by-category",
    title: "Category revenue share",
    topic: "Window functions",
    difficulty: "hard",
    prompt:
      "For each category, return category_name, revenue (rounded to 2 decimals) and pct_of_total (rounded to 2 decimals). Order by revenue descending, then category_name.",
    hint: "SUM(total) OVER () divides each category by the grand total.",
    solution: `WITH revenue AS (
  SELECT c.category_name,
         SUM(od.unit_price * od.quantity * (1 - od.discount)) AS total
  FROM northwind.categories AS c
  JOIN northwind.products AS p ON p.category_id = c.category_id
  JOIN northwind.order_details AS od ON od.product_id = p.product_id
  GROUP BY c.category_name
)
SELECT category_name,
       ROUND(total::numeric, 2) AS revenue,
       ROUND((100 * total / SUM(total) OVER ())::numeric, 2) AS pct_of_total
FROM revenue
ORDER BY revenue DESC, category_name`,
    ordered: true,
  },
  {
    id: "employee-hierarchy",
    title: "Reporting hierarchy",
    topic: "CTEs & recursion",
    difficulty: "hard",
    prompt:
      "Return the employee hierarchy as level (1 for the boss), first_name and last_name. Order by level, then last_name, then first_name.",
    hint: "Recursive CTE: anchor on reports_to IS NULL, then join reports_to = employee_id.",
    solution: `WITH RECURSIVE org AS (
  SELECT employee_id, first_name, last_name, reports_to, 1 AS level
  FROM northwind.employees
  WHERE reports_to IS NULL

  UNION ALL

  SELECT e.employee_id, e.first_name, e.last_name, e.reports_to, o.level + 1
  FROM northwind.employees AS e
  JOIN org AS o ON e.reports_to = o.employee_id
)
SELECT level, first_name, last_name
FROM org
ORDER BY level, last_name, first_name`,
    ordered: true,
  },
  {
    id: "monthly-revenue-1997",
    title: "Monthly revenue in 1997",
    topic: "CTEs & recursion",
    difficulty: "hard",
    prompt:
      "Return month (the first day of each month) and revenue (rounded to 2 decimals) for every month of 1997. Order by month ascending.",
    hint: "date_trunc('month', order_date) plus a join to order_details, in a CTE.",
    solution: `WITH monthly AS (
  SELECT date_trunc('month', o.order_date)::date AS month,
         SUM(od.unit_price * od.quantity * (1 - od.discount)) AS revenue
  FROM northwind.orders AS o
  JOIN northwind.order_details AS od ON od.order_id = o.order_id
  WHERE o.order_date >= DATE '1997-01-01'
    AND o.order_date <  DATE '1998-01-01'
  GROUP BY 1
)
SELECT month, ROUND(revenue::numeric, 2) AS revenue
FROM monthly
ORDER BY month`,
    ordered: true,
  },
  {
    id: "customers-1996-not-1997",
    title: "1996-only customers",
    topic: "Set operations",
    difficulty: "medium",
    prompt:
      "Using a set operation, return the company_name of customers who ordered in 1996 but not in 1997. Order by company_name ascending.",
    hint: "EXCEPT between two queries that both return company_name.",
    solution: `SELECT c.company_name
FROM northwind.customers AS c
JOIN northwind.orders AS o ON o.customer_id = c.customer_id
WHERE o.order_date >= DATE '1996-01-01'
  AND o.order_date <  DATE '1997-01-01'

EXCEPT

SELECT c.company_name
FROM northwind.customers AS c
JOIN northwind.orders AS o ON o.customer_id = c.customer_id
WHERE o.order_date >= DATE '1997-01-01'
  AND o.order_date <  DATE '1998-01-01'

ORDER BY 1`,
    ordered: true,
  },
  {
    id: "countries-customers-and-suppliers",
    title: "Customers and suppliers",
    topic: "Set operations",
    difficulty: "easy",
    prompt:
      "Using INTERSECT, return each country that has both customers and suppliers. Order by country ascending.",
    hint: "SELECT country FROM northwind.customers INTERSECT SELECT country FROM northwind.suppliers.",
    solution: `SELECT country FROM northwind.customers
INTERSECT
SELECT country FROM northwind.suppliers
ORDER BY 1`,
    ordered: true,
  },
  {
    id: "between-price",
    title: "Mid-range products",
    topic: "Filtering",
    difficulty: "easy",
    prompt:
      "Return product_name and unit_price for products priced between 20 and 30 inclusive. Order by unit_price ascending, then product_name ascending.",
    hint: "BETWEEN is inclusive on both ends. Remember to add a tiebreaker to the ordering.",
    solution: `SELECT product_name, unit_price
FROM northwind.products
WHERE unit_price BETWEEN 20 AND 30
ORDER BY unit_price, product_name`,
    ordered: true,
  },
  {
    id: "contact-maria",
    title: "Contacts named Maria",
    topic: "Filtering",
    difficulty: "easy",
    prompt:
      "List contact_name and company_name for customers whose contact name starts with 'Maria'. Order by company_name.",
    hint: "A prefix pattern has no leading wildcard, so LIKE 'Maria%' can use an index.",
    solution: `SELECT contact_name, company_name
FROM northwind.customers
WHERE contact_name LIKE 'Maria%'
ORDER BY company_name`,
    ordered: true,
  },
  {
    id: "discontinued-stock",
    title: "Discontinued but in stock",
    topic: "Filtering",
    difficulty: "easy",
    prompt:
      "Return product_name and units_in_stock for discontinued products that still have stock. Order by units_in_stock descending, then product_name ascending.",
    hint: "Combine two predicates with AND: discontinued = 1 and units_in_stock > 0.",
    solution: `SELECT product_name, units_in_stock
FROM northwind.products
WHERE discontinued = 1
  AND units_in_stock > 0
ORDER BY units_in_stock DESC, product_name`,
    ordered: true,
  },
  {
    id: "hires-1994",
    title: "Hired in 1994",
    topic: "Filtering",
    difficulty: "easy",
    prompt:
      "List first_name, last_name and hire_date for employees hired during 1994. Order by hire_date ascending, then last_name ascending.",
    hint: "Use a half-open date range instead of a YEAR() function.",
    solution: `SELECT first_name, last_name, hire_date
FROM northwind.employees
WHERE hire_date >= DATE '1994-01-01'
  AND hire_date <  DATE '1995-01-01'
ORDER BY hire_date, last_name`,
    ordered: true,
  },
  {
    id: "line-total",
    title: "Order 10250 line totals",
    topic: "Filtering",
    difficulty: "easy",
    prompt:
      "For order 10250, return product_id, unit_price, quantity and line_total (unit_price × quantity, rounded to 2 decimals). Order by product_id.",
    hint: "Arithmetic works in the SELECT list; cast to numeric before ROUND.",
    solution: `SELECT product_id,
       unit_price,
       quantity,
       ROUND((unit_price * quantity)::numeric, 2) AS line_total
FROM northwind.order_details
WHERE order_id = 10250
ORDER BY product_id`,
    ordered: true,
  },
  {
    id: "distinct-ship-cities",
    title: "French shipping cities",
    topic: "Filtering",
    difficulty: "easy",
    prompt:
      "Return the distinct ship_city values used for orders shipped to France. Order by ship_city ascending.",
    hint: "DISTINCT applies to the whole SELECT list; ORDER BY sorts the final result.",
    solution: `SELECT DISTINCT ship_city
FROM northwind.orders
WHERE ship_country = 'France'
ORDER BY ship_city`,
    ordered: true,
  },
  {
    id: "order-lines-10250",
    title: "Order 10250 with product names",
    topic: "Joins",
    difficulty: "easy",
    prompt:
      "Return product_name, quantity and line_total (unit_price × quantity rounded to 2) for order 10250. Order by product_name ascending.",
    hint: "Join order_details to products on product_id.",
    solution: `SELECT p.product_name,
       od.quantity,
       ROUND((od.unit_price * od.quantity)::numeric, 2) AS line_total
FROM northwind.order_details AS od
JOIN northwind.products AS p ON p.product_id = od.product_id
WHERE od.order_id = 10250
ORDER BY p.product_name`,
    ordered: true,
  },
  {
    id: "customer-order-counts",
    title: "Top 15 customers by orders",
    topic: "Joins",
    difficulty: "medium",
    prompt:
      "Return company_name and the number of orders for the 15 customers with the most orders — including customers with zero orders. Highest count first, then company_name.",
    hint: "LEFT JOIN keeps customers without orders; COUNT(o.order_id) counts zero for them.",
    solution: `SELECT c.company_name, COUNT(o.order_id) AS orders
FROM northwind.customers AS c
LEFT JOIN northwind.orders AS o ON o.customer_id = c.customer_id
GROUP BY c.company_name
ORDER BY orders DESC, c.company_name
LIMIT 15`,
    ordered: true,
  },
  {
    id: "seafood-suppliers",
    title: "Seafood and its suppliers",
    topic: "Joins",
    difficulty: "medium",
    prompt:
      "For every product in the Seafood category, return product_name and the supplier's company_name. Order by product_name.",
    hint: "Three tables: products → categories (name) and products → suppliers (company).",
    solution: `SELECT p.product_name, s.company_name AS supplier
FROM northwind.products AS p
JOIN northwind.categories AS c ON c.category_id = p.category_id
JOIN northwind.suppliers AS s ON s.supplier_id = p.supplier_id
WHERE c.category_name = 'Seafood'
ORDER BY p.product_name`,
    ordered: true,
  },
  {
    id: "big-1997-orders",
    title: "Large 1997 orders",
    topic: "Joins",
    difficulty: "hard",
    prompt:
      "Return order_id, company_name and order_total (sum of unit_price × quantity × (1 − discount), rounded to 2 decimals) for 1997 orders whose total exceeds 5000. Order by order_total descending, then order_id ascending; limit 20.",
    hint: "Join orders → customers → order_details, aggregate per order, then HAVING on the aggregate.",
    solution: `SELECT o.order_id,
       c.company_name,
       ROUND(SUM(od.unit_price * od.quantity * (1 - od.discount))::numeric, 2) AS order_total
FROM northwind.orders AS o
JOIN northwind.customers AS c ON c.customer_id = o.customer_id
JOIN northwind.order_details AS od ON od.order_id = o.order_id
WHERE o.order_date >= DATE '1997-01-01'
  AND o.order_date <  DATE '1998-01-01'
GROUP BY o.order_id, c.company_name
HAVING SUM(od.unit_price * od.quantity * (1 - od.discount)) > 5000
ORDER BY order_total DESC, o.order_id
LIMIT 20`,
    ordered: true,
  },
  {
    id: "employee-customer-reach",
    title: "Customers per employee in 1997",
    topic: "Joins",
    difficulty: "medium",
    prompt:
      "For 1997, return each employee's full name as employee and the number of distinct customers they sold to. Order by customers descending, then employee ascending.",
    hint: "COUNT(DISTINCT o.customer_id) — one customer can place many orders.",
    solution: `SELECT e.first_name || ' ' || e.last_name AS employee,
       COUNT(DISTINCT o.customer_id) AS customers
FROM northwind.employees AS e
JOIN northwind.orders AS o ON o.employee_id = e.employee_id
WHERE o.order_date >= DATE '1997-01-01'
  AND o.order_date <  DATE '1998-01-01'
GROUP BY e.employee_id, employee
ORDER BY customers DESC, employee`,
    ordered: true,
  },
  {
    id: "employee-territories",
    title: "Employees and territories",
    topic: "Joins",
    difficulty: "medium",
    prompt:
      "Return each employee's full name as employee and their territory_description. Order by employee, then territory.",
    hint: "employees → employee_territories → territories, all inner joins.",
    solution: `SELECT e.first_name || ' ' || e.last_name AS employee,
       t.territory_description
FROM northwind.employees AS e
JOIN northwind.employee_territories AS et ON et.employee_id = e.employee_id
JOIN northwind.territories AS t ON t.territory_id = et.territory_id
ORDER BY employee, t.territory_description`,
    ordered: true,
  },
  {
    id: "freight-stats",
    title: "Freight statistics",
    topic: "Aggregation",
    difficulty: "easy",
    prompt:
      "Return min_freight, max_freight, avg_freight and total_freight across all orders, each rounded to 2 decimals.",
    hint: "One row, four aggregates. Cast freight to numeric before ROUND.",
    solution: `SELECT ROUND(MIN(freight)::numeric, 2) AS min_freight,
       ROUND(MAX(freight)::numeric, 2) AS max_freight,
       ROUND(AVG(freight)::numeric, 2) AS avg_freight,
       ROUND(SUM(freight)::numeric, 2) AS total_freight
FROM northwind.orders`,
  },
  {
    id: "busy-ship-countries",
    title: "Busy shipping countries",
    topic: "Aggregation",
    difficulty: "easy",
    prompt:
      "List ship_country and the number of orders for countries with at least 30 orders. Order by orders descending, then ship_country ascending.",
    hint: "Filter the groups with HAVING, not WHERE.",
    solution: `SELECT ship_country, COUNT(*) AS orders
FROM northwind.orders
GROUP BY ship_country
HAVING COUNT(*) >= 30
ORDER BY orders DESC, ship_country`,
    ordered: true,
  },
  {
    id: "customers-both-years",
    title: "Loyal in both years",
    topic: "Aggregation",
    difficulty: "hard",
    prompt:
      "Return company_name for customers with at least 5 orders in 1996 and at least 5 orders in 1997. Order by company_name ascending.",
    hint: "COUNT(*) FILTER (WHERE ...) counts each year inside one GROUP BY.",
    solution: `SELECT c.company_name
FROM northwind.customers AS c
JOIN northwind.orders AS o ON o.customer_id = c.customer_id
GROUP BY c.company_name
HAVING COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM o.order_date) = 1996) >= 5
   AND COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM o.order_date) = 1997) >= 5
ORDER BY c.company_name`,
    ordered: true,
  },
  {
    id: "high-freight-customers",
    title: "Customers with high freight",
    topic: "Aggregation",
    difficulty: "medium",
    prompt:
      "Return company_name and total_freight (rounded to 2 decimals) for customers whose total freight exceeds 500. Order by total_freight descending, then company_name ascending.",
    hint: "GROUP BY the customer, SUM(freight), then HAVING on the sum.",
    solution: `SELECT c.company_name,
       ROUND(SUM(o.freight)::numeric, 2) AS total_freight
FROM northwind.orders AS o
JOIN northwind.customers AS c ON c.customer_id = o.customer_id
GROUP BY c.company_name
HAVING SUM(o.freight) > 500
ORDER BY total_freight DESC, c.company_name`,
    ordered: true,
  },
  {
    id: "discontinued-pivot",
    title: "Active vs discontinued",
    topic: "Aggregation",
    difficulty: "medium",
    prompt:
      "For each category, return category_name, active (products with discontinued = 0) and discontinued (products with discontinued = 1). Order by category_name.",
    hint: "Conditional aggregation with COUNT(*) FILTER (WHERE ...).",
    solution: `SELECT c.category_name,
       COUNT(*) FILTER (WHERE p.discontinued = 0) AS active,
       COUNT(*) FILTER (WHERE p.discontinued = 1) AS discontinued
FROM northwind.products AS p
JOIN northwind.categories AS c ON c.category_id = p.category_id
GROUP BY c.category_name
ORDER BY c.category_name`,
    ordered: true,
  },
  {
    id: "country-share",
    title: "Customer country share",
    topic: "Aggregation",
    difficulty: "medium",
    prompt:
      "For each country, return country, customers and pct (the percentage of all customers, rounded to 2 decimals). Order by customers descending, then country ascending.",
    hint: "SUM(COUNT(*)) OVER () divides each group by the grand total.",
    solution: `SELECT country,
       COUNT(*) AS customers,
       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS pct
FROM northwind.customers
GROUP BY country
ORDER BY customers DESC, country`,
    ordered: true,
  },
  {
    id: "above-category-avg",
    title: "Above-average in their category",
    topic: "Subqueries",
    difficulty: "hard",
    prompt:
      "Return product_name, category_name and unit_price for products priced above the average price of their own category. Order by category_name, then unit_price descending, then product_name.",
    hint: "A correlated subquery can reference the outer product's category_id.",
    solution: `SELECT p.product_name, c.category_name, p.unit_price
FROM northwind.products AS p
JOIN northwind.categories AS c ON c.category_id = p.category_id
WHERE p.unit_price > (
  SELECT AVG(p2.unit_price)
  FROM northwind.products AS p2
  WHERE p2.category_id = p.category_id
)
ORDER BY c.category_name, p.unit_price DESC, p.product_name`,
    ordered: true,
  },
  {
    id: "never-bought-seafood",
    title: "Never bought seafood",
    topic: "Subqueries",
    difficulty: "hard",
    prompt:
      "Return company_name for customers who have never ordered any product in the Seafood category. Order by company_name ascending.",
    hint: "NOT EXISTS with a subquery that joins orders → details → products → categories.",
    solution: `SELECT c.company_name
FROM northwind.customers AS c
WHERE NOT EXISTS (
  SELECT 1
  FROM northwind.orders AS o
  JOIN northwind.order_details AS od ON od.order_id = o.order_id
  JOIN northwind.products AS p ON p.product_id = od.product_id
  JOIN northwind.categories AS cat ON cat.category_id = p.category_id
  WHERE o.customer_id = c.customer_id
    AND cat.category_name = 'Seafood'
)
ORDER BY c.company_name`,
    ordered: true,
  },
  {
    id: "customers-above-avg-freight",
    title: "Above-average freight customers",
    topic: "Subqueries",
    difficulty: "hard",
    prompt:
      "Return company_name and avg_freight (rounded to 2 decimals) for customers whose average freight per order is above the overall average freight. Order by avg_freight descending, then company_name ascending.",
    hint: "Compare AVG(o.freight) per customer with a scalar subquery for the global average.",
    solution: `SELECT c.company_name,
       ROUND(AVG(o.freight)::numeric, 2) AS avg_freight
FROM northwind.orders AS o
JOIN northwind.customers AS c ON c.customer_id = o.customer_id
GROUP BY c.company_name
HAVING AVG(o.freight) > (SELECT AVG(freight) FROM northwind.orders)
ORDER BY avg_freight DESC, c.company_name`,
    ordered: true,
  },
  {
    id: "seafood-buyers",
    title: "Seafood customers",
    topic: "Subqueries",
    difficulty: "medium",
    prompt:
      "Return the distinct company_name of every customer who has ordered at least one Seafood product. Order by company_name ascending.",
    hint: "You can solve this with joins + DISTINCT, or with EXISTS.",
    solution: `SELECT DISTINCT c.company_name
FROM northwind.customers AS c
JOIN northwind.orders AS o ON o.customer_id = c.customer_id
JOIN northwind.order_details AS od ON od.order_id = o.order_id
JOIN northwind.products AS p ON p.product_id = od.product_id
JOIN northwind.categories AS cat ON cat.category_id = p.category_id
WHERE cat.category_name = 'Seafood'
ORDER BY c.company_name`,
    ordered: true,
  },
  {
    id: "revenue-dense-rank",
    title: "Dense revenue ranking",
    topic: "Window functions",
    difficulty: "hard",
    prompt:
      "Rank customers by total revenue with DENSE_RANK(). Return company_name, total (rounded to 2 decimals) and rank, ordered by rank then company_name; limit 15.",
    hint: "Aggregate revenue in a CTE, then DENSE_RANK() OVER (ORDER BY total DESC).",
    solution: `WITH revenue AS (
  SELECT c.company_name,
         SUM(od.unit_price * od.quantity * (1 - od.discount)) AS total
  FROM northwind.customers AS c
  JOIN northwind.orders AS o ON o.customer_id = c.customer_id
  JOIN northwind.order_details AS od ON od.order_id = o.order_id
  GROUP BY c.company_name
)
SELECT company_name,
       ROUND(total::numeric, 2) AS total,
       DENSE_RANK() OVER (ORDER BY total DESC) AS rank
FROM revenue
ORDER BY rank, company_name
LIMIT 15`,
    ordered: true,
  },
  {
    id: "customer-quartiles",
    title: "Customer quartiles",
    topic: "Window functions",
    difficulty: "hard",
    prompt:
      "Split customers into four quartiles by total revenue (highest revenue in quartile 1) using NTILE(4). Return quartile, company_name and total (rounded to 2 decimals), ordered by quartile, then total descending, then company_name; limit 20.",
    hint: "NTILE(4) OVER (ORDER BY total DESC) assigns the bucket.",
    solution: `WITH revenue AS (
  SELECT c.company_name,
         SUM(od.unit_price * od.quantity * (1 - od.discount)) AS total
  FROM northwind.customers AS c
  JOIN northwind.orders AS o ON o.customer_id = c.customer_id
  JOIN northwind.order_details AS od ON od.order_id = o.order_id
  GROUP BY c.company_name
)
SELECT NTILE(4) OVER (ORDER BY total DESC) AS quartile,
       company_name,
       ROUND(total::numeric, 2) AS total
FROM revenue
ORDER BY quartile, total DESC, company_name
LIMIT 20`,
    ordered: true,
  },
  {
    id: "top-customer-per-country",
    title: "Top customer per country",
    topic: "Window functions",
    difficulty: "hard",
    prompt:
      "For each country, return the customer with the highest revenue: country, company_name and total (rounded to 2 decimals). Order by country.",
    hint: "ROW_NUMBER() OVER (PARTITION BY country ORDER BY total DESC, company_name), then filter rn = 1.",
    solution: `WITH revenue AS (
  SELECT c.country,
         c.company_name,
         SUM(od.unit_price * od.quantity * (1 - od.discount)) AS total
  FROM northwind.customers AS c
  JOIN northwind.orders AS o ON o.customer_id = c.customer_id
  JOIN northwind.order_details AS od ON od.order_id = o.order_id
  GROUP BY c.country, c.company_name
), ranked AS (
  SELECT country,
         company_name,
         total,
         ROW_NUMBER() OVER (
           PARTITION BY country
           ORDER BY total DESC, company_name
         ) AS rn
  FROM revenue
)
SELECT country, company_name, ROUND(total::numeric, 2) AS total
FROM ranked
WHERE rn = 1
ORDER BY country`,
    ordered: true,
  },
  {
    id: "yearly-growth",
    title: "Year-over-year growth",
    topic: "Window functions",
    difficulty: "hard",
    prompt:
      "Return year, revenue (rounded to 2 decimals) and growth_pct (revenue change vs the previous year, rounded to 2 decimals) for every year. Order by year.",
    hint: "LAG(revenue) OVER (ORDER BY year); the first year has no previous value.",
    solution: `WITH yearly AS (
  SELECT EXTRACT(YEAR FROM o.order_date)::int AS year,
         SUM(od.unit_price * od.quantity * (1 - od.discount)) AS revenue
  FROM northwind.orders AS o
  JOIN northwind.order_details AS od ON od.order_id = o.order_id
  GROUP BY 1
)
SELECT year,
       ROUND(revenue::numeric, 2) AS revenue,
       ROUND((100 * (revenue - LAG(revenue) OVER (ORDER BY year))
              / LAG(revenue) OVER (ORDER BY year))::numeric, 2) AS growth_pct
FROM yearly
ORDER BY year`,
    ordered: true,
  },
  {
    id: "pct-of-category",
    title: "Product share of category",
    topic: "Window functions",
    difficulty: "hard",
    prompt:
      "Return category_name, product_name, revenue (rounded to 2 decimals) and pct_of_category (rounded to 2 decimals) for products. Order by category_name ascending, then revenue descending; limit 25.",
    hint: "SUM(revenue) OVER (PARTITION BY category_id) is the category total.",
    solution: `WITH line AS (
  SELECT p.category_id,
         p.product_name,
         SUM(od.unit_price * od.quantity * (1 - od.discount)) AS total
  FROM northwind.products AS p
  JOIN northwind.order_details AS od ON od.product_id = p.product_id
  GROUP BY p.category_id, p.product_name
)
SELECT c.category_name,
       line.product_name,
       ROUND(line.total::numeric, 2) AS revenue,
       ROUND((100 * line.total / SUM(line.total) OVER (PARTITION BY line.category_id))::numeric, 2) AS pct_of_category
FROM line
JOIN northwind.categories AS c ON c.category_id = line.category_id
ORDER BY c.category_name, revenue DESC
LIMIT 25`,
    ordered: true,
  },
  {
    id: "monthly-cumulative",
    title: "Cumulative 1997 orders",
    topic: "CTEs & recursion",
    difficulty: "medium",
    prompt:
      "Return each month of 1997 (month = first day of the month), its order count as orders, and the running total as cumulative. Order by month ascending.",
    hint: "Aggregate by date_trunc('month', ...) in a CTE, then SUM(orders) OVER (ORDER BY month).",
    solution: `WITH monthly AS (
  SELECT date_trunc('month', order_date)::date AS month,
         COUNT(*) AS orders
  FROM northwind.orders
  WHERE order_date >= DATE '1997-01-01'
    AND order_date <  DATE '1998-01-01'
  GROUP BY 1
)
SELECT month,
       orders,
       SUM(orders) OVER (ORDER BY month) AS cumulative
FROM monthly
ORDER BY month`,
    ordered: true,
  },
  {
    id: "chain-paths",
    title: "Full reporting paths",
    topic: "CTEs & recursion",
    difficulty: "hard",
    prompt:
      "Using a recursive CTE, return the full reporting path for every employee except the boss, formatted as 'Andrew Fuller -> Steven Buchanan -> ...'. Order by path ascending.",
    hint: "Carry a path column forward and concatenate with ' -> ' in the recursive term.",
    solution: `WITH RECURSIVE chain AS (
  SELECT employee_id,
         first_name || ' ' || last_name AS employee,
         1 AS level,
         first_name || ' ' || last_name AS path
  FROM northwind.employees
  WHERE reports_to IS NULL

  UNION ALL

  SELECT e.employee_id,
         e.first_name || ' ' || e.last_name,
         c.level + 1,
         c.path || ' -> ' || e.first_name || ' ' || e.last_name
  FROM northwind.employees AS e
  JOIN chain AS c ON e.reports_to = c.employee_id
)
SELECT path
FROM chain
WHERE level > 1
ORDER BY path`,
    ordered: true,
  },
  {
    id: "above-avg-category-revenue",
    title: "Above-average category revenue",
    topic: "CTEs & recursion",
    difficulty: "medium",
    prompt:
      "Using a CTE, return category_name and revenue (rounded to 2 decimals) for categories whose revenue is above the average category revenue. Order by revenue descending.",
    hint: "Aggregate revenue per category in the CTE, then compare with a scalar subquery over the CTE.",
    solution: `WITH cat AS (
  SELECT c.category_name,
         SUM(od.unit_price * od.quantity * (1 - od.discount)) AS total
  FROM northwind.categories AS c
  JOIN northwind.products AS p ON p.category_id = c.category_id
  JOIN northwind.order_details AS od ON od.product_id = p.product_id
  GROUP BY c.category_name
)
SELECT category_name, ROUND(total::numeric, 2) AS revenue
FROM cat
WHERE total > (SELECT AVG(total) FROM cat)
ORDER BY revenue DESC`,
    ordered: true,
  },
  {
    id: "month-spine",
    title: "Gap-free 1997 months",
    topic: "CTEs & recursion",
    difficulty: "medium",
    prompt:
      "Using a generated month series, return every month of 1997 and its order count. Months with no orders must still appear. Order by month ascending.",
    hint: "generate_series(start, end, interval '1 month') + LEFT JOIN on a half-open range.",
    solution: `WITH months AS (
  SELECT generate_series(
           DATE '1997-01-01',
           DATE '1997-12-01',
           interval '1 month'
         )::date AS month
)
SELECT m.month, COUNT(o.order_id) AS orders
FROM months AS m
LEFT JOIN northwind.orders AS o
       ON o.order_date >= m.month
      AND o.order_date <  m.month + interval '1 month'
GROUP BY m.month
ORDER BY m.month`,
    ordered: true,
  },
  {
    id: "supplier-cities-except-customers",
    title: "Supplier-only cities",
    topic: "Set operations",
    difficulty: "medium",
    prompt:
      "Using EXCEPT, return the cities that have a supplier but no customer. Order by city ascending.",
    hint: "SELECT city FROM suppliers EXCEPT SELECT city FROM customers.",
    solution: `SELECT city FROM northwind.suppliers
EXCEPT
SELECT city FROM northwind.customers
ORDER BY city`,
    ordered: true,
  },
  {
    id: "customers-1997-not-1996",
    title: "New in 1997",
    topic: "Set operations",
    difficulty: "medium",
    prompt:
      "Using EXCEPT, return the company_name of customers who ordered in 1997 but not in 1996. Order by company_name ascending.",
    hint: "Two customer+orders queries, EXCEPT between them, ORDER BY 1 at the end.",
    solution: `SELECT c.company_name
FROM northwind.customers AS c
JOIN northwind.orders AS o ON o.customer_id = c.customer_id
WHERE o.order_date >= DATE '1997-01-01'
  AND o.order_date <  DATE '1998-01-01'

EXCEPT

SELECT c.company_name
FROM northwind.customers AS c
JOIN northwind.orders AS o ON o.customer_id = c.customer_id
WHERE o.order_date >= DATE '1996-01-01'
  AND o.order_date <  DATE '1997-01-01'

ORDER BY 1`,
    ordered: true,
  },
  {
    id: "contact-first-name",
    title: "Contact first names",
    topic: "Functions & dates",
    difficulty: "easy",
    prompt:
      "Return company_name and first_name (the first word of contact_name) for customers. Order by company_name ascending; limit 10.",
    hint: "split_part(contact_name, ' ', 1) returns the first word.",
    solution: `SELECT company_name,
       split_part(contact_name, ' ', 1) AS first_name
FROM northwind.customers
ORDER BY company_name
LIMIT 10`,
    ordered: true,
  },
  {
    id: "order-month-labels",
    title: "1997 months as labels",
    topic: "Functions & dates",
    difficulty: "easy",
    prompt:
      "Return each month of 1997 as a 'YYYY-MM' string and its order count. Order by month ascending.",
    hint: "to_char(order_date, 'YYYY-MM') formats the month.",
    solution: `SELECT to_char(order_date, 'YYYY-MM') AS month,
       COUNT(*) AS orders
FROM northwind.orders
WHERE order_date >= DATE '1997-01-01'
  AND order_date <  DATE '1998-01-01'
GROUP BY 1
ORDER BY 1`,
    ordered: true,
  },
];

export const QUESTION_BY_ID = new Map(
  PRACTICE_QUESTIONS.map((question) => [question.id, question]),
);

export interface SchemaColumn {
  name: string;
  type: string;
  /** Primary / foreign key marker. */
  key?: "PK" | "FK" | "PK, FK";
}

export interface SchemaTable {
  table: string;
  rows: number;
  columns: SchemaColumn[];
}

/** Tables in the `northwind` schema that the practice questions use. */
export const NORTHWIND_SCHEMA_REFERENCE: SchemaTable[] = [
  {
    table: "customers",
    rows: 91,
    columns: [
      { name: "customer_id", type: "varchar(5)", key: "PK" },
      { name: "company_name", type: "varchar(40)" },
      { name: "contact_name", type: "varchar(30)" },
      { name: "contact_title", type: "varchar(30)" },
      { name: "address", type: "varchar(60)" },
      { name: "city", type: "varchar(15)" },
      { name: "region", type: "varchar(15)" },
      { name: "postal_code", type: "varchar(10)" },
      { name: "country", type: "varchar(15)" },
      { name: "phone", type: "varchar(24)" },
      { name: "fax", type: "varchar(24)" },
    ],
  },
  {
    table: "orders",
    rows: 830,
    columns: [
      { name: "order_id", type: "smallint", key: "PK" },
      { name: "customer_id", type: "varchar(5)", key: "FK" },
      { name: "employee_id", type: "smallint", key: "FK" },
      { name: "order_date", type: "date" },
      { name: "required_date", type: "date" },
      { name: "shipped_date", type: "date" },
      { name: "ship_via", type: "smallint", key: "FK" },
      { name: "freight", type: "real" },
      { name: "ship_name", type: "varchar(40)" },
      { name: "ship_address", type: "varchar(60)" },
      { name: "ship_city", type: "varchar(15)" },
      { name: "ship_region", type: "varchar(15)" },
      { name: "ship_postal_code", type: "varchar(10)" },
      { name: "ship_country", type: "varchar(15)" },
    ],
  },
  {
    table: "order_details",
    rows: 2155,
    columns: [
      { name: "order_id", type: "smallint", key: "PK, FK" },
      { name: "product_id", type: "smallint", key: "PK, FK" },
      { name: "unit_price", type: "real" },
      { name: "quantity", type: "smallint" },
      { name: "discount", type: "real" },
    ],
  },
  {
    table: "products",
    rows: 77,
    columns: [
      { name: "product_id", type: "smallint", key: "PK" },
      { name: "product_name", type: "varchar(40)" },
      { name: "supplier_id", type: "smallint", key: "FK" },
      { name: "category_id", type: "smallint", key: "FK" },
      { name: "quantity_per_unit", type: "varchar(20)" },
      { name: "unit_price", type: "real" },
      { name: "units_in_stock", type: "smallint" },
      { name: "units_on_order", type: "smallint" },
      { name: "reorder_level", type: "smallint" },
      { name: "discontinued", type: "integer" },
    ],
  },
  {
    table: "categories",
    rows: 8,
    columns: [
      { name: "category_id", type: "smallint", key: "PK" },
      { name: "category_name", type: "varchar(15)" },
      { name: "description", type: "text" },
    ],
  },
  {
    table: "employees",
    rows: 9,
    columns: [
      { name: "employee_id", type: "smallint", key: "PK" },
      { name: "last_name", type: "varchar(20)" },
      { name: "first_name", type: "varchar(10)" },
      { name: "title", type: "varchar(30)" },
      { name: "title_of_courtesy", type: "varchar(25)" },
      { name: "birth_date", type: "date" },
      { name: "hire_date", type: "date" },
      { name: "address", type: "varchar(60)" },
      { name: "city", type: "varchar(15)" },
      { name: "region", type: "varchar(15)" },
      { name: "postal_code", type: "varchar(10)" },
      { name: "country", type: "varchar(15)" },
      { name: "home_phone", type: "varchar(24)" },
      { name: "extension", type: "varchar(4)" },
      { name: "notes", type: "text" },
      { name: "reports_to", type: "smallint", key: "FK" },
      { name: "photo_path", type: "varchar(255)" },
    ],
  },
  {
    table: "suppliers",
    rows: 29,
    columns: [
      { name: "supplier_id", type: "smallint", key: "PK" },
      { name: "company_name", type: "varchar(40)" },
      { name: "contact_name", type: "varchar(30)" },
      { name: "contact_title", type: "varchar(30)" },
      { name: "address", type: "varchar(60)" },
      { name: "city", type: "varchar(15)" },
      { name: "region", type: "varchar(15)" },
      { name: "postal_code", type: "varchar(10)" },
      { name: "country", type: "varchar(15)" },
      { name: "phone", type: "varchar(24)" },
      { name: "fax", type: "varchar(24)" },
      { name: "homepage", type: "text" },
    ],
  },
  {
    table: "shippers",
    rows: 6,
    columns: [
      { name: "shipper_id", type: "smallint", key: "PK" },
      { name: "company_name", type: "varchar(40)" },
      { name: "phone", type: "varchar(24)" },
    ],
  },
  {
    table: "employee_territories",
    rows: 49,
    columns: [
      { name: "employee_id", type: "smallint", key: "PK, FK" },
      { name: "territory_id", type: "varchar(20)", key: "PK, FK" },
    ],
  },
  {
    table: "territories",
    rows: 53,
    columns: [
      { name: "territory_id", type: "varchar(20)", key: "PK" },
      { name: "territory_description", type: "varchar(60)" },
      { name: "region_id", type: "smallint", key: "FK" },
    ],
  },
  {
    table: "region",
    rows: 4,
    columns: [
      { name: "region_id", type: "smallint", key: "PK" },
      { name: "region_description", type: "varchar(60)" },
    ],
  },
];

/**
 * Tables referenced by a question's reference answer. The schema panel uses
 * this to show only the tables that question actually needs.
 */
export function tablesForQuestion(question: PracticeQuestion): string[] {
  const names = Array.from(
    question.solution.matchAll(/\bnorthwind\.([a-z_]+)\b/g),
    (match) => match[1],
  );
  const unique = Array.from(new Set(names));
  return unique.length > 0
    ? unique
    : NORTHWIND_SCHEMA_REFERENCE.map((table) => table.table);
}

/**
 * The final ORDER BY clause of a reference answer (SQL text after the last
 * top-level ORDER BY, without LIMIT). Used to tell learners exactly which
 * ordering is graded.
 */
export function expectedOrderBy(solution: string): string | null {
  const matches = Array.from(solution.matchAll(/\border\s+by\b/gi));
  const last = matches[matches.length - 1];
  if (!last) return null;
  const rest = solution.slice(last.index + last[0].length);
  const limitIndex = rest.search(/\blimit\b/i);
  const clause = (limitIndex === -1 ? rest : rest.slice(0, limitIndex))
    .replace(/;+\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
  return clause || null;
}
