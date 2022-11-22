const express = require("express");
const bodyParser = require("body-parser");
var cors = require("cors");
const app = express();
const port = 3000;
const db_user = require("./user_query");
const db_product = require("./product_query");

app.use(
  cors({
    origin: "http://localhost:3001",
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

app.get("/quatro_user", db_user.getUsers);
app.get("/quatro_user/:first_name/:last_name", db_user.searchUser);
app.get("/quatro_user/:user_id", db_user.getUserById);
app.post("/quatro_user", db_user.createUser);
app.put(
  "/quatro_user/:user_id/:email/:password/:first_name/:last_name/:date_of_birth/:phone_number",
  db_user.updateUser
);
app.delete("/quatro_user/:user_id", db_user.deleteUser);

app.get("/quatro_product", db_product.getProducts);
app.get("/quatro_product/p_id/:product_id", db_product.getProductById);
app.get("/quatro_product/p_name/:product_name", db_product.getProductByName);
app.get(
  "/quatro_product/p_category/:category",
  db_product.getProductByCategory
);
// app.get("/quatro_product/p_/:quantity", db_product.getProductQuantity);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
