require("dotenv").config();

const Pool = require("pg").Pool;
const pool = new Pool({
  user: `${process.env.PGUSERNAME}`,
  database: `${process.env.DATABASE_URL}`,
  password: `${process.env.PGPASSWORD}`,
  port: process.env.PGPORT,
});

const getAllAddress = async function () {
  let query = {
    text: "select address_line_1, address_line_2, address_line_3, postcode, state from quatro_address",
  };

  let resultQuery = await pool.query(query);

  let getAddress = resultQuery.rows;
  return getAddress;
};

const searchAddressAPI = async (request, response) => {
  try {
    let searchAddressUser = await getAllAddress();
    response.status(200).json({ result: searchAddressUser });
  } catch (error) {
    response.status(404).json({ error: error.message });
  }
};

const createAddress = async function (
  address_line_1,
  address_line_2,
  address_line_3,
  postcode,
  state,
  user_id
) {
  let query = {
    text: "insert into quatro_address(address_line_1, address_line_2, address_line_3, postcode, state, user_id) values($1,$2,$3,$4,$5,$6) returning address_id",
    values: [
      address_line_1,
      address_line_2,
      address_line_3,
      postcode,
      state,
      user_id,
    ],
  };

  let resultQuery = await pool.query(query);
  let newAddress = resultQuery.rows;

  return newAddress;
};

const createAddressAPI = async (request, response) => {
  const {
    address_line_1,
    address_line_2,
    address_line_3,
    postcode,
    state,
    user_id,
  } = request.body;
  try {
    let newAddress = await createAddress(
      address_line_1,
      address_line_2,
      address_line_3,
      postcode,
      state,
      user_id
    );
    response
      .status(200)
      .json({ result: newAddress, message: "Address added successfully" });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const updateAddressDetails = async function (
  address_line_1,
  address_line_2,
  address_line_3,
  postcode,
  state,
  address_id
) {
  let query_1 = {
    text: "select * from quatro_address where address_id=$1",
    values: [address_id],
  };

  let resultQuery_1 = await pool.query(query_1);
  let address = resultQuery_1.rows;

  if (address.length === 0) {
    throw Error("Address doesn't exist");
  }

  let query = {
    text: `update quatro_address set address_line_1 = coalesce(nullif($1,''), address_line_1),
           address_line_2 = coalesce(nullif($2,''), address_line_2),
           address_line_3 = coalesce(nullif($3,''), address_line_3),
           postcode = coalesce(nullif($4,''), postcode),
           state = coalesce(nullif($5,''), state)
           where address_id = $6;`,
    values: [
      address_line_1,
      address_line_2,
      address_line_3,
      postcode,
      state,
      address_id,
    ],
  };

  let resultQuery = await pool.query(query);
  let updateAddressDetailsDB = resultQuery.rows;
  return updateAddressDetailsDB;
};

const updateAddressDetailsAPI = async (request, response) => {
  const {
    address_line_1,
    address_line_2,
    address_line_3,
    postcode,
    state,
    address_id,
  } = request.body;

  try {
    let updateAddressDetailsDB = await updateAddressDetails(
      address_line_1,
      address_line_2,
      address_line_3,
      postcode,
      state,
      address_id
    );

    response
      .status(200)
      .json({ result: updateAddressDetailsDB, message: "Address updated" });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

const deleteAddress = async function (address_id) {
  let query = {
    text: "delete from quatro_address where address_id = $1",
    values: [address_id],
  };

  let resultQuery = await pool.query(query);
  let addressDelete = resultQuery.rows;
  return addressDelete;
};

const deleteAddressAPI = async (request, response) => {
  const { address_id } = request.body;
  try {
    let addressDelete = await deleteAddress(address_id);
    response
      .status(200)
      .json({ result: addressDelete, message: "Address deleted" });
  } catch (error) {
    console.log("error:", error);
    response.status(404).json({ error: error.message });
  }
};

module.exports = {
  searchAddressAPI,
  createAddressAPI,
  updateAddressDetailsAPI,
  deleteAddressAPI,
};
