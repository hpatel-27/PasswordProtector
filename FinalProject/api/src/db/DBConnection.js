const { Pool } = require('pg');

let pool;

exports.getDatabaseConnection = () => {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB
    });
  }
  return pool;
};

// Promise-based query helper. Uses numbered placeholders ($1, $2, ...).
// Resolves with { results, fields } so callers can destructure `results`
// (the returned rows) the same way across every DAO.
exports.query = (query, params = []) => {
  const db = exports.getDatabaseConnection();
  return db.query(query, params).then(res => ({
    results: res.rows,
    // pg does not have mysql's insertId/affectedRows; expose rowCount so
    // DAOs can check how many rows an INSERT/UPDATE/DELETE touched.
    rowCount: res.rowCount,
    fields: res.fields
  }));
};

exports.close = () => {
  if (pool) {
    pool.end();
    pool = null;
  }
};
