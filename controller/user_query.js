const bcrypt = require("bcrypt");
const { Query } = require("pg");
const jwt = require("jsonwebtoken");
require("dotenv").config();
//validator implementation
const validator = require("validator");

const Pool = require("pg").Pool;
const pool = new Pool({
  user: `${process.env.PGUSERNAME}`,
  database: `${process.env.DATABASE_URL}`,
  password: `${process.env.PGPASSWORD}`,
  port: process.env.PGPORT,
});

const searchUser = async function (user_id) {
  let query = {
    text: "select email, first_name, last_name, date_of_birth, gender, user_credit from quatro_user where user_id = $1 ",
    values: [user_id],
  };

  let resultQuery = await pool.query(query);
  let fl_name = resultQuery.rows;

  if (fl_name.length === 0) {
    throw Error("User doesnt exist");
  }
  return fl_name[0];
};

const searchUserAPI = async (request, response) => {
  try {
    let userDeets = await searchUser(request.query.user_id);
    response.status(200).json({ result: userDeets });
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

  //validation

  if (user.length === 0) {
    throw Error("Email does not exist");
  }

  //------------------------

  let validPassword = await bcrypt.compare(password, user[0]["password"]);

  if (!validPassword) {
    throw Error("Incorrect Password");
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
  gender
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

  if (validator.isEmpty(first_name)) {
    throw Error("First name input is required");
  }
  if (validator.isEmpty(last_name)) {
    throw Error("Last name input is required");
  }

  if (!validator.isAlpha(first_name) || !validator.isAlpha(last_name)) {
    throw Error("Name should contain alphabets only");
  }

  if (!gender) {
    throw Error("Please select gender option");
  }
  if (!email && !password) {
    throw Error("Email and password field cannot be empty");
  }

  if (!email || !email.trim()) {
    throw Error("Email field cannot be empty");
  }

  if (!password || !password.trim()) {
    throw Error("Password field cannot be empty");
  }

  if (!validator.isEmail(email)) {
    throw Error("Email not valid");
  }

  if (password.length < 8) {
    throw Error("Password should consists at least 8 characters");
  }

  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    throw Error(
      "Password should consists at least 1 lowercase, 1 uppercase, 1 number and 1 symbol "
    );
  }

  const salt = await bcrypt.genSalt(10);
  const passHash = await bcrypt.hash(password, salt);

  let query = {
    text: "insert into quatro_user(email,password,first_name,last_name,date_of_birth,gender,user_credit) values ($1,$2,$3,$4,$5,$6,100) returning user_id",
    values: [email, passHash, first_name, last_name, date_of_birth, gender],
  };

  let resultQuery = await pool.query(query);
  let newUser = resultQuery.rows;

  return newUser;
};

const createUserAPI = async (request, response) => {
  const { email, password, first_name, last_name, date_of_birth, gender } =
    request.body;
  try {
    let newUser = await createUser(
      email,
      password,
      first_name,
      last_name,
      date_of_birth,
      gender
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
  email,
  oldPassword,
  user_id
) {
  let query_1 = {
    text: "select email, password from quatro_user where user_id=$1",
    values: [user_id],
  };

  let resultQuery_1 = await pool.query(query_1);
  let user = resultQuery_1.rows;

  if (user.length === 0) {
    throw Error("User doesnt exist");
  }

  let validPassword = false;

  if (oldPassword) {
    //empty
    validPassword = await bcrypt.compare(oldPassword, user[0]["password"]);
  }

  if (!validPassword) {
    throw Error("Incorrect Password");
  }

  let query = {
    text: `update quatro_user set first_name = coalesce(nullif($1,''), first_name),
           last_name = coalesce(nullif($2,''), last_name),
           date_of_birth = coalesce(nullif($3,''), date_of_birth),
           email = coalesce(nullif($4,''), email) where user_id = $5`,
    values: [first_name, last_name, date_of_birth, email, user_id],
  };

  let resultQuery = await pool.query(query);
  let userUpdate = resultQuery.rows;

  return userUpdate[0];
};

const updateUserAPI = async (request, response) => {
  const { first_name, last_name, date_of_birth, email, oldPassword, user_id } =
    request.body;

  try {
    await updateUser(
      first_name,
      last_name,
      date_of_birth,
      email,
      oldPassword,
      user_id
    );

    //const updateUserJwt = createToken(updateUserDB?.user_id);

    response.status(200).json({ result: email, message: "User updated" });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const updatePassword = async function (oldPassword, password, user_id) {
  const salt = await bcrypt.genSalt(10);

  // console.log(`passws ${salt} ${password}`);
  const passHash = await bcrypt.hash(password, salt);
  // if (isNaN(phone_number)) {
  // throw new Error("Invalid phone number");
  // }
  let query_1 = {
    text: "select email, password from quatro_user where user_id=$1",
    values: [user_id],
  };

  let resultQuery_1 = await pool.query(query_1);
  let user = resultQuery_1.rows;

  if (user.length === 0) {
    throw Error("User doesnt exist");
  }

  let validPassword = true;

  if (oldPassword) {
    //empty
    validPassword = await bcrypt.compare(oldPassword, user[0]["password"]);
  }

  if (!validPassword) {
    throw Error("Old Password is incorrect");
  }

  if (!validator.isStrongPassword(password)) {
    throw Error("New Password not strong enough");
  }

  let query = {
    text: `update quatro_user set password = coalesce(nullif($1,''), password) where user_id = $2`,
    values: [passHash, user_id],
  };

  let resultQuery = await pool.query(query);
  let passwordUpdate = resultQuery.rows;

  return passwordUpdate[0];
};

const updatePasswordAPI = async (request, response) => {
  const { oldPassword, password, user_id } = request.body;

  try {
    await updatePassword(oldPassword, password, user_id);

    //const updateUserJwt = createToken(updateUserDB?.user_id);

    response.status(200).json({ result: user_id, message: "User updated" });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const deleteUser = async function (user_id) {
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
  updatePasswordAPI,
  deleteUserAPI,
};
