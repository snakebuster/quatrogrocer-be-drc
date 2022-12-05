const express = require("express");
const bodyParser = require("body-parser");
var cors = require("cors");
const app = express();
const port = 5004;
const db_user = require("./controller/user_query");
const db_product = require("./controller/product_query");
const db_product_discount = require("./controller/product_query");
const db_address = require("./controller/address_query");
const db_transac = require("./controller/transaction_query");
const db_cart = require("./controller/cart_query");
const db_credit = require("./controller/money_query");
const db_auth = require("./middleware/requireAuth");
const jwt = require("express-jwt");
const jsonwebtoken = require("jsonwebtoken");
require("dotenv").config();

app.use(
  cors({
    origin: ["*"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.get("/", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
});

//User
app.post("/quatro_user/login", db_user.loginAPI);
app.post("/quatro_user/create", db_user.createUserAPI);
app.post("/quatro_user/search", db_user.searchUserAPI);
app.post("/quatro_user/update", db_user.updateUserAPI);
app.post("/quatro_user/update_password", db_user.updatePasswordAPI);
app.delete("/quatro_user/delete", db_user.deleteUserAPI);
//Product
app.get("/quatro_product/get", db_product.searchProductAPI);
app.post("/quatro_product/create", db_product.createProductAPI);
app.post("/quatro_product/update_details", db_product.updateProductDetailsAPI);
app.post("/quatro_product/update_price", db_product.updateProductPriceAPI);
app.post(
  "/quatro_product/update_quantity",
  db_product.updateProductQuantityAPI
);
app.post("/quatro_product/minus_quantity", db_product.minusProductQuantityAPI);
app.delete("/quatro_product/delete", db_product.deleteProductAPI);
//Discount Product
app.get(
  "/quatro_product_discount/get",
  db_product_discount.getDiscountProductAPI
);
app.post(
  "/quatro_product_discount/create",
  db_product_discount.createDiscountProductAPI
);
app.post(
  "/quatro_product_discount/update",
  db_product_discount.updateDiscountProductDetailsAPI
);
app.post(
  "/quatro_product_discount/minus",
  db_product_discount.minusProductQuantityAPI
);
app.delete(
  "/quatro_product_discount/delete",
  db_product_discount.deleteDiscountProductAPI
);
//Address
app.get("/quatro_address/get", db_address.getAddressAPI);
app.post("/quatro_address/create", db_address.createAddressAPI);
app.post("/quatro_address/update_details", db_address.updateAddressDetailsAPI);
app.delete("/quatro_address/delete", db_address.deleteAddressAPI);
app.post(
  "/quatro_address/set_default_address",
  db_address.setDefaultAddressAPI
);
app.post(
  "/quatro_address/set_nondefault_address",
  db_address.undefaultAddressAPI
);
//Cart
app.post("/quatro_cart/create", db_cart.createCartAPI);
app.post("/quatro_cart/delete", db_cart.deleteCartAPI);
app.post("/quatro_cart/push", db_cart.pushCartAPI);
//Discount Cart
app.post("/quatro_cart/create_discount", db_cart.createCartDiscountAPI);
app.delete("/quatro_cart/delete_discount", db_cart.deleteCartDiscountAPI);
app.post("/quatro_cart/push_discount", db_cart.pushDiscountCartAPI);
//Transaction
app.post("/quatro_transaction/create", db_transac.createTransactionAPI);
app.post("/quatro_transaction/update", db_transac.updateTransactionAPI);
app.post("/quatro_transaction/checkout", db_transac.getCheckoutCartAPI);
//User Credit
app.post("/quatro_user/minus_credit", db_credit.minusCreditUpdateAPI);
app.post("/quatro_user/add_credit", db_credit.addCreditUpdateAPI);
//Update payment status
app.post("/quatro_transaction/update_payment", db_transac.updatePaymentAPI);
//Get from cart
app.get("/quatro_transaction/get_details/:id", db_transac.getTransactionAPI);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
