const express = require("express");
const bodyParser = require("body-parser");
var cors = require("cors");
const app = express();
const port = 5004;
const db_user = require("./controller/user_query");
const db_product = require("./controller/product_query");
const db_address = require("./controller/address_query");
const db_auth = require("./middleware/requireAuth");
const jwt = require("express-jwt");
const jsonwebtoken = require("jsonwebtoken");
require("dotenv").config();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
});

//User
app.post("/quatro_user/login", db_user.loginAPI);
app.post("/quatro_user/create", db_user.createUserAPI);
app.post("/quatro_user/search", db_auth, db_user.searchUserAPI);
app.post("/quatro_user/update", db_user.updateUserAPI);
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
app.delete("/quatro_product/delete", db_product.deleteProductAPI);
//Address
app.get("/quatro_address/get", db_address.searchAddressAPI);
app.post("/quatro_address/create", db_address.createAddressAPI);
app.post("/quatro_address/update_details", db_address.updateAddressDetailsAPI);
app.delete("/quatro_address/delete", db_address.deleteAddressAPI);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
