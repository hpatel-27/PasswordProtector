const db = require('./DBConnection');

// Shared ownership check: does this user actually own this provider?
// Every provider/account operation gates on this against the user_provider
// join table. Previously duplicated in both UserDAO and ProviderDAO.
const checkUserProviderConnection = (userId, providerId) => {
  return db.query(
    'SELECT COUNT(*) AS count FROM user_provider WHERE upr_usr_id = $1 AND upr_prv_id = $2',
    [userId, providerId]
  ).then(({ results }) => Number(results[0].count) > 0);
};

module.exports = { checkUserProviderConnection };
