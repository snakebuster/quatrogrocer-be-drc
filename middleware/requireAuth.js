const jwt = require("jsonwebtoken");
const Pool = require("pg").Pool;
const pool = new Pool({
  user: process.env.PGUSERNAME,
  host: process.env.PGHOST,
  database: process.env.DATABASE_URL,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const jwtToken = authorization.split(" ")[1];

  try {
    const { user_id } = jwt.verify(jwtToken, process.env.SECRET);

    let query = {
      text: `select email from quatro_user where user_id = $1`,
      values: [user_id],
    };

    let output = await pool.query(query);

    req.user_id = output.rows[0]["user_id"];
    next();
  } catch (error) {
    res.status(401).json({ error: "request not authorized" });
  }
};

module.exports = requireAuth;
