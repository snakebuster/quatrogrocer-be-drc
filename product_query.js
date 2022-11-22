const Pool = require("pg").Pool;
const pool = new Pool({
  user: "postgres",
  host: "postgres",
  database: "my_db",
  password: "postgres", //find how to hide/encrypt the password
  port: 5432,
});

const getProducts = (request, response) => {
  pool.query(
    "SELECT * FROM quatro_product ORDER BY product_id ASC",
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getProductById = (request, response) => {
  const product_id = parseInt(request.params.product_id);

  pool.query(
    "SELECT * FROM quatro_product WHERE product_id = $1",
    [product_id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getProductByName = (request, response) => {
  var product_name = request.params.product_name;

  pool.query(
    "SELECT * FROM quatro_product WHERE product_name LIKE $1",
    ["%" + product_name + "%"],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getProductByCategory = (request, response) => {
  var category = request.params.category;

  pool.query(
    "SELECT * FROM quatro_product WHERE product_category LIKE $1",
    ["%" + category + "%"],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getProductQuantity = (request, response) => {
  const quantity = parseInt(request.params.quantity);

  pool.query(
    "SELECT * FROM quatro_product WHERE product_quantity = $1",
    [quantity],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

module.exports = {
  getProducts,
  getProductById,
  getProductByName,
  getProductByCategory,
  getProductQuantity,
};
