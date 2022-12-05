require("dotenv").config();

const Pool = require("pg").Pool;
const pool = new Pool({
  user: `${process.env.PGUSERNAME}`,
  database: `${process.env.DATABASE_URL}`,
  password: `${process.env.PGPASSWORD}`,
  port: process.env.PGPORT,
});

const createCart = async function (user_id, product_id, product_quantity) {
  let query_1 = {
    text: "select user_id from quatro_user where user_id=$1",
    values: [user_id],
  };

  let resultQuery_1 = await pool.query(query_1);
  let user = resultQuery_1.rows;

  if (user.length === 0) {
    throw Error("User doesn't exist");
  }

  let query = {
    text: "insert into quatro_cart(user_id, product_id, product_quantity) values($1,$2,$3) returning user_id",
    values: [user_id, product_id, product_quantity],
  };

  let resultQuery = await pool.query(query);
  let newCart = resultQuery.rows;

  return newCart;
};

const createCartAPI = async (request, response) => {
  const { user_id, product_id, product_quantity } = request.body;
  try {
    let newCart = await createCart(user_id, product_id, product_quantity);
    response
      .status(200)
      .json({ result: newCart, message: "Successfully added to cart" });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const deleteCart = async function (user_id) {
  console.log(user_id);
  let query_1 = {
    text: "select user_id from quatro_cart where user_id=$1",
    values: [user_id],
  };

  let resultQuery_1 = await pool.query(query_1);
  let user = resultQuery_1.rows;

  if (user.length === 0) {
    throw Error("User doesn't exist");
  }

  let query = {
    text: "delete from quatro_cart where user_id = $1",
    values: [user_id],
  };

  let resultQuery = await pool.query(query);
  let cartDelete = resultQuery.rows;

  return cartDelete;
};

const deleteCartAPI = async (request, response) => {
  console.log(request.body);
  try {
    let cartDelete = await deleteCart(request.body.user_id);
    response
      .status(200)
      .json({ result: cartDelete, message: "Successfully delete from cart" });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const pushCart = async function (user_id) {
  let query_1 = {
    text: "select user_id from quatro_user where user_id=$1",
    values: [user_id],
  };

  let resultQuery_1 = await pool.query(query_1);
  let user1 = resultQuery_1.rows;

  if (user1.length === 0) {
    throw Error("Cart doesn't exist");
  }

  let query = {
    text: "insert into quatro_transaction(user_id, product_id, discount_product_id, product_quantity) select distinct user_id, product_id, discount_product_id, SUM(product_quantity) from quatro_cart where user_id = $1 group by product_id, discount_product_id, user_id;",
    values: [user_id],
  };

  let resultQuery = await pool.query(query);
  let cartPush = resultQuery.rows;

  return cartPush;
};

const pushCartAPI = async (request, response) => {
  const { user_id } = request.body;
  try {
    let cartPush = await pushCart(user_id);
    response
      .status(200)
      .json({ result: cartPush, message: "Successfully push from cart" });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const createDiscountCart = async function (
  user_id,
  discount_product_id,
  product_quantity
) {
  let query_1 = {
    text: "select user_id from quatro_user where user_id=$1",
    values: [user_id],
  };

  let resultQuery_1 = await pool.query(query_1);
  let user = resultQuery_1.rows;

  if (user.length === 0) {
    throw Error("User doesn't exist");
  }

  let query = {
    text: "insert into quatro_cart(user_id, discount_product_id, product_quantity) values($1,$2,$3) returning user_id",
    values: [user_id, discount_product_id, product_quantity],
  };

  let resultQuery = await pool.query(query);
  let newCartDiscount = resultQuery.rows;

  return newCartDiscount;
};

const createCartDiscountAPI = async (request, response) => {
  const { user_id, discount_product_id, product_quantity } = request.body;
  try {
    let newCartDiscount = await createDiscountCart(
      user_id,
      discount_product_id,
      product_quantity
    );
    response
      .status(200)
      .json({ result: newCartDiscount, message: "Successfully added to cart" });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const deleteDiscountCart = async function (discount_product_id, user_id) {
  let query_1 = {
    text: "select user_id from quatro_cart where user_id=$1",
    values: [user_id],
  };

  let resultQuery_1 = await pool.query(query_1);
  let user = resultQuery_1.rows;

  if (user.length === 0) {
    throw Error("Cart doesn't exist");
  }

  let query = {
    text: "delete from quatro_cart where discount_product_id = $1 and user_id = $2",
    values: [discount_product_id, user_id],
  };

  let resultQuery = await pool.query(query);
  let cartDeleteDiscount = resultQuery.rows;

  return cartDeleteDiscount;
};

const deleteCartDiscountAPI = async (request, response) => {
  const { discount_product_id, user_id } = request.body;
  try {
    let cartDeleteDiscount = await deleteDiscountCart(
      discount_product_id,
      user_id
    );
    response.status(200).json({
      result: cartDeleteDiscount,
      message: "Successfully delete from cart",
    });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const pushDiscountCart = async function (user_id) {
  let query_1 = {
    text: "select user_id from quatro_user where user_id=$1",
    values: [user_id],
  };

  let resultQuery_1 = await pool.query(query_1);
  let user = resultQuery_1.rows;

  if (user.length === 0) {
    throw Error("Cart doesn't exist");
  }

  let query = {
    text: "insert into quatro_transaction(user_id, discount_product_id, product_quantity) select user_id, discount_product_id, product_quantity from quatro_cart where user_id = $1;",
    values: [user_id],
  };

  let resultQuery = await pool.query(query);
  let cartDiscountPush = resultQuery.rows;

  return cartDiscountPush;
};

const pushDiscountCartAPI = async (request, response) => {
  const { user_id } = request.body;
  try {
    let cartDiscountPush = await pushDiscountCart(user_id);
    response.status(200).json({
      result: cartDiscountPush,
      message: "Successfully push from cart",
    });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

module.exports = {
  deleteCartAPI,
  createCartAPI,
  pushCartAPI,
  deleteCartDiscountAPI,
  createCartDiscountAPI,
  pushDiscountCartAPI,
};
