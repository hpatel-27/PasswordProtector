const crypto = require('crypto');
const db = require('./DBConnection');
const User = require('./models/User');
const ProviderDAO = require('./ProviderDAO');
const { checkUserProviderConnection } = require('./ownership');

// NOTE: `user` is a reserved word in Postgres, so the table is quoted as
// "user" in every query below.

const UserDAO = {

    // Retrieve all users from the user table
    getUsers: () => {
        return db.query('SELECT * FROM "user"')
            .then(({ results }) => results
                .map(row => new User(row))
                .map(user => getFilteredUser(user)));
    },

    // Look up a user by username only (used for login and duplicate checks).
    getUserByUsername: (username) => {
        return db.query('SELECT * FROM "user" WHERE usr_username = $1', [username])
            .then(({ results }) => (results.length === 0 ? null : new User(results[0])));
    },

    // Validate a username/password pair, returning the filtered user or null.
    getUserByCredentials: (username, password) => {
        return UserDAO.getUserByUsername(username)
            .then(user => {
                if (!user) {
                    return null;
                }
                return user.validatePassword(password)
                    .then(() => getFilteredUser(user))
                    .catch(() => null);
            });
    },

    createNewUser: (newUser) => {
        return new Promise((resolve, reject) => {
            const { username, password, email } = newUser;

            // Generate a random salt and hash the password with it
            const salt = crypto.randomBytes(32).toString('hex');
            crypto.pbkdf2(password, salt, 10000, 32, 'sha256', (err, derivedKey) => {
                if (err) {
                    reject({ status: 500, error: 'Error hashing password' });
                    return;
                }
                const hashedPassword = derivedKey.toString('hex');
                db.query(
                    'INSERT INTO "user" (usr_username, usr_password, usr_salt, usr_email) VALUES ($1, $2, $3, $4) RETURNING usr_id',
                    [username, hashedPassword, salt, email]
                )
                    .then(({ results }) => {
                        resolve(new User({
                            usr_id: results[0].usr_id,
                            usr_username: username,
                            usr_email: email
                        }));
                    })
                    .catch(reject);
            });
        });
    },

    // Get every provider owned by this user, resolved through the ProviderDAO.
    getUserProviders: (userId) => {
        userId = parseInt(userId);
        return db.query('SELECT * FROM user_provider WHERE upr_usr_id = $1', [userId])
            .then(({ results }) => {
                const providerPromises = results.map(row => ProviderDAO.getProviderById(row.upr_prv_id));
                return Promise.all(providerPromises);
            });
    },

    getUserProviderById: (userId, providerId) => {
        userId = parseInt(userId);
        providerId = parseInt(providerId);
        return checkUserProviderConnection(userId, providerId)
            .then(exists => {
                if (!exists) {
                    return Promise.reject({ status: 404, error: `User-provider connection not found for user ${userId} and provider ${providerId}` });
                }
                return ProviderDAO.getProviderById(providerId);
            });
    },

    // Create the provider, then link it to the user in user_provider.
    addProvider: (userId, newProvider) => {
        userId = parseInt(userId);
        return ProviderDAO.createProvider(newProvider)
            .then(createdProvider => {
                return db.query(
                    'INSERT INTO user_provider (upr_usr_id, upr_prv_id) VALUES ($1, $2)',
                    [userId, createdProvider.id]
                ).then(({ rowCount }) => {
                    if (rowCount > 0) {
                        return createdProvider;
                    }
                    return Promise.reject({ status: 500, error: 'Could not link provider to user' });
                });
            });
    },

    // Delete a provider the user owns (accounts + join rows cascade in the DB).
    deleteProvider: (userId, providerId) => {
        userId = parseInt(userId);
        providerId = parseInt(providerId);
        return checkUserProviderConnection(userId, providerId)
            .then(exists => {
                if (!exists) {
                    return Promise.reject({ status: 404, error: `User-provider connection not found for user ${userId} and provider ${providerId}` });
                }
                return ProviderDAO.deleteProvider(providerId)
                    .then(() => ({ message: 'Provider deleted successfully' }));
            });
    },

    changeProviderName: (userId, providerId, newName) => {
        userId = parseInt(userId);
        providerId = parseInt(providerId);
        return checkUserProviderConnection(userId, providerId)
            .then(exists => {
                if (!exists) {
                    return Promise.reject({ status: 404, error: `User-provider connection not found for user ${userId} and provider ${providerId}` });
                }
                return ProviderDAO.changeProviderName(providerId, newName);
            });
    }

};

module.exports = UserDAO;

// Strip credentials before a user object is ever returned to a client.
function getFilteredUser(user) {
    return {
        id: user.id,
        username: user.username,
        email: user.email
    };
}
