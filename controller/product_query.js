require("dotenv").config();

const Pool = require("pg").Pool;
const pool = new Pool({
  user: `${process.env.PGUSERNAME}`,
  database: `${process.env.DATABASE_URL}`,
  password: `${process.env.PGPASSWORD}`,
  port: process.env.PGPORT,
});

const getAllProduct = async function (product) {
  let query = {
    text:
      "select product_id, product_name, product_description, product_category, product_price, product_quantity, product_image from quatro_product " +
      (product ? "where lower(product_name) like $1 " : "") +
      "order by product_id asc ",
    values: product ? [`%${product}%`.toLowerCase()] : [],
  };

  let resultQuery = await pool.query(query);
  let GetProduct = resultQuery.rows;

  return GetProduct;
};

const searchProductAPI = async (request, response) => {
  try {
    let GetProduct = await getAllProduct(request.query.product);
    response.status(200).json({ result: GetProduct });
  } catch (error) {
    response.status(404).json({ error: error.message });
  }
};

const getDiscountProduct = async function (product_discount) {
  let query = {
    text:
      "select discount_product_id, discount_product_name, discount_product_description, discount_product_category, discount_product_price, discount_product_quantity, discount_product_image from quatro_product_discount " +
      (product_discount ? "where lower(discount_product_name) like $1 " : "") +
      "order by discount_product_id asc ",
    values: product_discount ? [`%${product_discount}%`.toLowerCase()] : [],
  };

  let resultQuery = await pool.query(query);

  let GetProductDiscount = resultQuery.rows;
  return GetProductDiscount;
};

const getDiscountProductAPI = async (request, response) => {
  try {
    let GetProductDiscount = await getDiscountProduct(
      request.query.product_discount
    );
    response.status(200).json({ result: GetProductDiscount });
  } catch (error) {
    response.status(404).json({ error: error.message });
  }
};

const createProduct = async function (
  product_name,
  product_description,
  product_category,
  product_price,
  product_quantity,
  product_image
) {
  let query_1 = {
    text: "select * from quatro_product where product_name=$1",
    values: [product_name],
  };

  let resultQuery_1 = await pool.query(query_1);
  let product = resultQuery_1.rows;

  if (product.length !== 0) {
    throw Error("Product exist");
  }

  let query = {
    text: "insert into quatro_product(product_name, product_description, product_category, product_price, product_quantity, product_image) values($1,$2,$3,$4,$5,$6) returning product_id",
    values: [
      product_name,
      product_description,
      product_category,
      product_price,
      product_quantity,
      product_image,
    ],
  };

  let resultQuery = await pool.query(query);
  let newProduct = resultQuery.rows;

  return newProduct;
};

const createProductAPI = async (request, response) => {
  const {
    product_name,
    product_description,
    product_category,
    product_price,
    product_quantity,
    product_image,
  } = request.body;
  try {
    let newProduct = await createProduct(
      product_name,
      product_description,
      product_category,
      product_price,
      product_quantity,
      product_image
    );
    response.status(200).json({ result: newProduct });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const updateProductDetails = async function (
  product_name,
  product_description,
  product_category,
  product_image,
  product_id
) {
  let query_1 = {
    text: "select product_id from quatro_product where product_id=$1",
    values: [product_id],
  };

  let resultQuery_1 = await pool.query(query_1);
  let product = resultQuery_1.rows;

  if (product.length === 0) {
    throw Error("Product doesnt exist");
  }

  let query = {
    text: `update quatro_product set product_name = coalesce(nullif($1,''), product_name),
           product_description = coalesce(nullif($2,''), product_description),
           product_category = coalesce(nullif($3,''), product_category),
           product_image = coalesce(nullif($4,''), product_image)
           where product_id = $5;`,
    values: [
      product_name,
      product_description,
      product_category,
      product_image,
      product_id,
    ],
  };
  let resultQuery = await pool.query(query);
  let updateProductDetails = resultQuery.rows;

  return updateProductDetails;
};

const updateProductDetailsAPI = async (request, response) => {
  const {
    product_name,
    product_description,
    product_category,
    product_image,
    product_id,
  } = request.body;

  try {
    let newProductDetails = await updateProductDetails(
      product_name,
      product_description,
      product_category,
      product_image,
      product_id
    );

    response
      .status(200)
      .json({ result: newProductDetails, message: "Product updated" });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const updateProductPrice = async function (product_price, product_id) {
  let query_1 = {
    text: "select product_id from quatro_product where product_id=$1",
    values: [product_id],
  };

  let resultQuery_1 = await pool.query(query_1);
  let product1 = resultQuery_1.rows;

  if (product1.length === 0) {
    throw Error("Product doesn't exist");
  }

  let query = {
    text: `update quatro_product set product_price = $1 where product_id = $2;`,
    values: [product_price, product_id],
  };

  let resultQuery = await pool.query(query);
  let productPriceUpdate = resultQuery.rows;

  return productPriceUpdate;
};

const updateProductPriceAPI = async (request, response) => {
  const { product_price, product_id } = request.body;

  try {
    let productPriceUpdate = await updateProductPrice(
      product_price,
      product_id
    );

    response
      .status(200)
      .json({ result: productPriceUpdate, message: "Product Price updated" });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const updateProductQuantity = async function (product_quantity, product_id) {
  let query_1 = {
    text: "select product_id from quatro_product where product_id=$1",
    values: [product_id],
  };

  let resultQuery_1 = await pool.query(query_1);
  let product1 = resultQuery_1.rows;

  if (product1.length === 0) {
    throw Error("Product doesn't exist");
  }

  let query = {
    text: `update quatro_product set product_quantity = $1 where product_id = $2;`,
    values: [product_quantity, product_id],
  };

  let resultQuery = await pool.query(query);
  let productQuantityUpdate = resultQuery.rows;

  return productQuantityUpdate;
};

const updateProductQuantityAPI = async (request, response) => {
  const { product_quantity, product_id } = request.body;

  try {
    let productQuantityUpdate = await updateProductQuantity(
      product_quantity,
      product_id
    );

    response.status(200).json({
      result: productQuantityUpdate,
      message: "Product quantity updated",
    });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const minusProductQuantity = async function (product_quantity, product_id) {
  let query_1 = {
    text: "select product_id from quatro_product where product_id=$1",
    values: [product_id],
  };

  let resultQuery_1 = await pool.query(query_1);
  let product1 = resultQuery_1.rows;

  if (product1.length === 0) {
    throw Error("Product doesn't exist");
  }

  let query = {
    text: `update quatro_product set product_quantity = product_quantity - $1 where product_id = $2;`,
    values: [product_quantity, product_id],
  };

  let resultQuery = await pool.query(query);
  let minusQuantity = resultQuery.rows;

  return minusQuantity;
};

const minusProductQuantityAPI = async (request, response) => {
  const { product_quantity, product_id } = request.body;

  try {
    let minusQuantity = await minusProductQuantity(
      product_quantity,
      product_id
    );

    response.status(200).json({
      result: minusQuantity,
      message: "Product quantity updated",
    });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const deleteProduct = async function (product_id) {
  let query_1 = {
    text: "select product_id from quatro_product where product_id=$1",
    values: [product_id],
  };

  let resultQuery_1 = await pool.query(query_1);
  let product1 = resultQuery_1.rows;

  if (product1.length === 0) {
    throw Error("Product doesn't exist");
  }

  let query = {
    text: "delete from quatro_product where product_id = $1",
    values: [product_id],
  };

  let resultQuery = await pool.query(query);
  let deletedProduct = resultQuery.rows;
  return deletedProduct;
};

const deleteProductAPI = async (request, response) => {
  const { product_id } = request.body;
  try {
    let deletedProduct = await deleteProduct(product_id);
    response
      .status(200)
      .json({ result: deletedProduct, message: "Product deleted" });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const createDiscountProduct = async function (
  discount_product_name,
  discount_product_description,
  discount_product_category,
  discount_product_price,
  discount_product_quantity,
  discount_product_image
) {
  let query_1 = {
    text: "select * from quatro_product_discount where discount_product_name=$1",
    values: [discount_product_name],
  };

  let resultQuery_1 = await pool.query(query_1);
  let product = resultQuery_1.rows;

  if (product.length !== 0) {
    throw Error("Product exist");
  }

  let query = {
    text: "insert into quatro_product_discount(discount_product_name, discount_product_description, discount_product_category, discount_product_price, discount_product_quantity, discount_product_image) values($1,$2,$3,$4,$5,$6) returning discount_product_id",
    values: [
      discount_product_name,
      discount_product_description,
      discount_product_category,
      discount_product_price,
      discount_product_quantity,
      discount_product_image,
    ],
  };

  let resultQuery = await pool.query(query);
  let newProductDiscount = resultQuery.rows;

  return newProductDiscount;
};

const createDiscountProductAPI = async (request, response) => {
  const {
    discount_product_name,
    discount_product_description,
    discount_product_category,
    discount_product_price,
    discount_product_quantity,
    discount_product_image,
  } = request.body;
  try {
    let newProductDiscount = await createDiscountProduct(
      discount_product_name,
      discount_product_description,
      discount_product_category,
      discount_product_price,
      discount_product_quantity,
      discount_product_image
    );
    response.status(200).json({ result: newProductDiscount });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const updateDiscountProductDetails = async function (
  discount_product_name,
  discount_product_description,
  discount_product_category,
  discount_product_image,
  discount_product_id
) {
  let query_1 = {
    text: "select discount_product_id from quatro_product_discount where discount_product_id=$1",
    values: [discount_product_id],
  };

  let resultQuery_1 = await pool.query(query_1);
  let product1 = resultQuery_1.rows;

  if (product1.length === 0) {
    throw Error("Product doesn't exist");
  }

  let query = {
    text: `update quatro_product_discount set discount_product_name = coalesce(nullif($1,''), discount_product_name),
           discount_product_description = coalesce(nullif($2,''), discount_product_description),
           discount_product_category = coalesce(nullif($3,''), discount_product_category),
           discount_product_image = coalesce(nullif($4,''), discount_product_image)
           where discount_product_id = $5;`,
    values: [
      discount_product_name,
      discount_product_description,
      discount_product_category,
      discount_product_image,
      discount_product_id,
    ],
  };
  let resultQuery = await pool.query(query);
  let updateProductDiscount = resultQuery.rows;

  return updateProductDiscount;
};

const updateDiscountProductDetailsAPI = async (request, response) => {
  const {
    discount_product_name,
    discount_product_description,
    discount_product_category,
    discount_product_image,
    discount_product_id,
  } = request.body;

  try {
    let updateProductDiscount = await updateDiscountProductDetails(
      discount_product_name,
      discount_product_description,
      discount_product_category,
      discount_product_image,
      discount_product_id
    );

    response
      .status(200)
      .json({ result: updateProductDiscount, message: "Product updated" });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const minusDiscountProductQuantity = async function (
  discount_product_quantity,
  discount_product_id
) {
  let query_1 = {
    text: "select discount_product_id from quatro_product_discount where discount_product_id=$1",
    values: [discount_product_id],
  };

  let resultQuery_1 = await pool.query(query_1);
  let product1 = resultQuery_1.rows;

  if (product1.length === 0) {
    throw Error("Product doesn't exist");
  }

  let query = {
    text: `update quatro_product_discount set discount_product_quantity = discount_product_quantity - $1 where discount_product_id = $2;`,
    values: [discount_product_quantity, discount_product_id],
  };

  let resultQuery = await pool.query(query);
  let minusDiscountQuantity = resultQuery.rows;

  return minusDiscountQuantity;
};

const minusDiscountProductQuantityAPI = async (request, response) => {
  const { discount_product_quantity, discount_product_id } = request.body;

  try {
    let minusDiscountQuantity = await minusDiscountProductQuantity(
      discount_product_quantity,
      discount_product_id
    );

    response.status(200).json({
      result: minusDiscountQuantity,
      message: "Product quantity updated",
    });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const deleteDiscountProduct = async function (discount_product_id) {
  let query_1 = {
    text: "select discount_product_id from quatro_product_discount where discount_product_id=$1",
    values: [discount_product_id],
  };

  let resultQuery_1 = await pool.query(query_1);
  let product1 = resultQuery_1.rows;

  if (product1.length === 0) {
    throw Error("Product doesn't exist");
  }

  let query = {
    text: "delete from quatro_product_discount where discount_product_id = $1",
    values: [discount_product_id],
  };

  let resultQuery = await pool.query(query);
  let discountProductDelete = resultQuery.rows;
  return discountProductDelete;
};

const deleteDiscountProductAPI = async (request, response) => {
  const { discount_product_id } = request.body;
  try {
    let discountProductDelete = await deleteDiscountProduct(
      discount_product_id
    );
    response
      .status(200)
      .json({ result: discountProductDelete, message: "Product deleted" });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

module.exports = {
  searchProductAPI,
  createProductAPI,
  updateProductDetailsAPI,
  updateProductPriceAPI,
  updateProductQuantityAPI,
  minusProductQuantityAPI,
  deleteProductAPI,
  createDiscountProductAPI,
  updateDiscountProductDetailsAPI,
  deleteDiscountProductAPI,
  minusDiscountProductQuantityAPI,
  getDiscountProductAPI,
};
