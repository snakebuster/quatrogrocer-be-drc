const bcrypt = require("bcrypt");
const { Query } = require("pg");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Pool = require("pg").Pool;
const pool = new Pool({
  user: `${process.env.PGUSERNAME}`,
  database: `${process.env.DATABASE_URL}`,
  password: `${process.env.PGPASSWORD}`,
  port: process.env.PGPORT,
});

const searchUser = async function (first_name, last_name) {
  let query = {
    text: "select first_name, last_name from quatro_user where first_name=$1 and last_name=$2",
    values: [first_name, last_name],
  };

  let resultQuery = await pool.query(query);
  let fl_name = resultQuery.rows;

  if (fl_name.length === 0) {
    throw Error("User doesnt exist");
  }
  return fl_name[0];
};

const searchUserAPI = async (request, response) => {
  const { first_name, last_name } = request.body;

  try {
    let fl_name = await searchUser(first_name, last_name);
    response.status(200).json({ result: fl_name });
  } catch (error) {
    response.status(404).json({ error: error.message });
  }
};

const createToken = (user_id) => {
  return jwt.sign({ user_id: user_id }, process.env.SECRET, {
    expiresIn: "1d",
  });
};

const loginUser = async function (email, password) {
  let query = {
    text: "select email, password, user_id from quatro_user where email=$1",
    values: [email],
  };

  let resultQuery = await pool.query(query);
  let user = resultQuery.rows;

  if (user.length === 0) {
    throw Error("Email doesnt exist");
  }

  let validPassword = await bcrypt.compare(password, user[0]["password"]);

  if (!validPassword) {
    throw Error("Invalid Password");
  }
  return user[0].user_id;
};

const loginAPI = async (request, response) => {
  const { email, password } = request.body;
  try {
    let user = await loginUser(email, password);
    let userJwt = createToken(user);
    response.cookie("token", userJwt, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    response.status(200).json({ result: email, userJwt });
  } catch (error) {
    response.status(404).json({ error: error.message });
  }
};

const createUser = async function (
  email,
  password,
  first_name,
  last_name,
  date_of_birth,
  gender,
  phone_number
) {
  let query_1 = {
    text: "select email, password from quatro_user where email=$1",
    values: [email],
  };

  let resultQuery_1 = await pool.query(query_1);
  let user = resultQuery_1.rows;

  if (user.length !== 0) {
    throw Error("Email exist");
  }

  const salt = await bcrypt.genSalt(10);
  const passHash = await bcrypt.hash(password, salt);

  let query = {
    text: "insert into quatro_user(email,password,first_name,last_name,date_of_birth,gender,phone_number,user_credit) values ($1,$2,$3,$4,$5,$6,$7,100) returning user_id",
    values: [
      email,
      passHash,
      first_name,
      last_name,
      date_of_birth,
      gender,
      phone_number,
    ],
  };

  let resultQuery = await pool.query(query);
  let newUser = resultQuery.rows;

  return newUser;
};

const createUserAPI = async (request, response) => {
  const {
    email,
    password,
    first_name,
    last_name,
    date_of_birth,
    gender,
    phone_number,
  } = request.body;
  try {
    let newUser = await createUser(
      email,
      password,
      first_name,
      last_name,
      date_of_birth,
      gender,
      phone_number
    );

    response.status(200).json({ result: email, message: "User Created" });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const updateUser = async function (
  first_name,
  last_name,
  date_of_birth,
  phone_number,
  email,
  oldPassword,
  password,
  user_id
) {
  const salt = await bcrypt.genSalt(10);

  const passHash = await bcrypt.hash(password, salt);

  if (isNaN(phone_number)) {
    throw error("Invalid phone number");
  }
  let query_1 = {
    text: "select email, password from quatro_user where user_id=$1",
    values: [user_id],
  };

  let resultQuery_1 = await pool.query(query_1);
  let user = resultQuery_1.rows;

  if (user.length === 0) {
    throw Error("User doesnt exist");
  }

  let validPassword = await bcrypt.compare(oldPassword, user[0]["password"]);

  if (!validPassword) {
    throw Error("Invalid Password");
  }

  let query = {
    text: `update quatro_user set first_name = coalesce(nullif($1,''), first_name),
           last_name = coalesce(nullif($2,''), last_name),
           date_of_birth = coalesce(nullif($3,''), date_of_birth),
           phone_number = coalesce(nullif($4,''), phone_number),
           email = coalesce(nullif($5,''), email),
           password = coalesce(nullif($6,''), password)
           where user_id = $7`,
    values: [
      first_name,
      last_name,
      date_of_birth,
      phone_number,
      email,
      passHash,
      user_id,
    ],
  };

  let resultQuery = await pool.query(query);
  let userUpdate = resultQuery.rows;

  return userUpdate[0];
};

const updateUserAPI = async (request, response) => {
  const {
    first_name,
    last_name,
    date_of_birth,
    phone_number,
    email,
    oldPassword,
    password,
    user_id,
  } = request.body;

  try {
    await updateUser(
      first_name,
      last_name,
      date_of_birth,
      phone_number,
      email,
      oldPassword,
      password,
      user_id
    );

    //const updateUserJwt = createToken(updateUserDB?.user_id);

    response.status(200).json({ result: email, message: "User updated" });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const deleteUser = async function (user_id) {
  let query = {
    text: "delete from quatro_user where user_id = $1",
    values: [user_id],
  };

  let resultQuery = await pool.query(query);
  let deletedUser = resultQuery.rows;
  return deletedUser;
};

const deleteUserAPI = async (request, response) => {
  const { user_id } = request.body;
  try {
    let userDelete = await deleteUser(user_id);
    response.status(200).json({ result: userDelete, message: "User deleted" });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

module.exports = {
  searchUserAPI,
  loginAPI,
  createUserAPI,
  updateUserAPI,
  deleteUserAPI,
};
