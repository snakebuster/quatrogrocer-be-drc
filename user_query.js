const bcrypt = require("bcrypt");

const Pool = require("pg").Pool;
const pool = new Pool({
  user: "postgres",
  host: "postgres",
  database: "my_db",
  password: "postgres", //find how to hide/encrypt the password
  port: 5432,
});

const getUsers = (request, response) => {
  pool.query(
    "SELECT * FROM quatro_user ORDER BY user_id ASC",
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json({ result: results.rows });
    }
  );
};

const getUserById = async (request, response) => {
  const user_id = parseInt(request.params.user_id);

  pool.query(
    "SELECT * FROM quatro_user WHERE user_id = $1",
    [user_id],
    (error, results) => {
      console.log(results);
      if (error) {
        throw error;
      }

      response.status(200).json(results.rows);
    }
  );
};

const searchUser = async (request, response) => {
  const first_name = request.params.first_name;
  const last_name = request.params.last_name;

  pool.query(
    "SELECT * FROM quatro_user WHERE first_name = $1 AND last_name = $2",
    [first_name, last_name],
    (error, results) => {
      // console.log(results);
      if (error) {
        throw error;
      }

      response.status(200).json(results.rows);
    }
  );
};

const createUser = async (request, response) => {
  const { password, email, user_credit } = request.body;
  const salt = await bcrypt.genSalt(10);
  const passHash = await bcrypt.hash(password, salt);

  pool.query(
    "INSERT INTO quatro_user (password, email, user_credit) VALUES ($1, $2,100) RETURNING user_id",
    [passHash, email],
    (error, results) => {
      if (error) {
        throw error;
      }
      response
        .status(201)
        .send(`User added with ID: ${results.rows[0].user_id}`);
    }
  );
};

const updateUser = async (request, response) => {
  // const user_id = parseInt(request.params.user_id);
  const {
    user_id,
    email,
    password,
    first_name,
    last_name,
    date_of_birth,
    phone_number,
  } = request.params;
  const salt = await bcrypt.genSalt(10);
  console.log(password);
  const passHash = await bcrypt.hash(password, salt);

  pool.query(
    "UPDATE quatro_user SET email = $2, password = $3, first_name = $4, last_name = $5, date_of_birth = $6, phone_number = $7 WHERE user_id = $1",
    [
      parseInt(user_id),
      email,
      passHash,
      first_name,
      last_name,
      date_of_birth,
      phone_number,
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`User modified with ID: ${user_id}`);
    }
  );
};

const deleteUser = (request, response) => {
  const user_id = parseInt(request.params.user_id);

  pool.query(
    "DELETE FROM quatro_user WHERE user_id = $1",
    [user_id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`User deleted with ID: ${user_id}`);
    }
  );
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUser,
};
