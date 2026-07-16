const db = require('./DBConnection');
const Provider = require('./models/Provider');
const AccountDAO = require('./AccountDAO');
const { checkUserProviderConnection } = require('./ownership');

const ProviderDAO = {

    // Return every provider in the system (mostly useful for testing).
    getAllProviders: () => {
        return db.query('SELECT * FROM provider')
            .then(({ results }) => results.map(providerData => new Provider(providerData)));
    },

    getProviderById: (providerId) => {
        return db.query('SELECT * FROM provider WHERE prv_id = $1', [providerId])
            .then(({ results }) => {
                if (results.length > 0) {
                    return new Provider(results[0]);
                }
                return Promise.reject({ status: 404, error: `Provider with id ${providerId} not found` });
            });
    },

    createProvider: (newProvider) => {
        const { name } = newProvider;
        if (!name) {
            return Promise.reject({ status: 400, error: 'A provider must be given a name' });
        }
        return db.query('INSERT INTO provider (prv_name) VALUES ($1) RETURNING prv_id', [name])
            .then(({ results }) => new Provider({ prv_id: results[0].prv_id, prv_name: name }));
    },

    deleteProvider: (providerId) => {
        return db.query('DELETE FROM provider WHERE prv_id = $1', [providerId])
            .then(({ rowCount }) => {
                if (rowCount > 0) {
                    return { id: providerId };
                }
                return Promise.reject({ status: 404, error: `Provider with id ${providerId} not found` });
            });
    },

    changeProviderName: (providerId, newName) => {
        providerId = parseInt(providerId);
        if (!newName) {
            return Promise.reject({ status: 400, error: 'Provider name cannot be empty' });
        }
        return db.query('UPDATE provider SET prv_name = $1 WHERE prv_id = $2', [newName, providerId])
            .then(() => ({ message: 'Provider name updated successfully' }));
    },

    getProviderAccounts: (userId, providerId) => {
        userId = parseInt(userId);
        providerId = parseInt(providerId);
        return checkUserProviderConnection(userId, providerId)
            .then(exists => {
                if (!exists) {
                    return Promise.reject({ status: 404, error: `user-provider connection not found for provider ${providerId}` });
                }
                return AccountDAO.getAllAccounts(providerId);
            });
    },

    getProviderAccountById: (userId, providerId, accountId) => {
        return checkUserProviderConnection(userId, providerId)
            .then(exists => {
                if (!exists) {
                    return Promise.reject({ status: 404, error: `user-to-account pathway not found for provider ${providerId} and account ${accountId}` });
                }
                return AccountDAO.getAccountById(providerId, accountId);
            });
    },

    addAccount: (userId, providerId, newAccount) => {
        return checkUserProviderConnection(userId, providerId)
            .then(exists => {
                if (!exists) {
                    return Promise.reject({ status: 404, error: `user-provider connection not found for provider ${providerId}` });
                }
                return AccountDAO.createAccount(providerId, newAccount);
            });
    },

    deleteAccount: (userId, providerId, accountId) => {
        return checkUserProviderConnection(userId, providerId)
            .then(exists => {
                if (!exists) {
                    return Promise.reject({ status: 404, error: `user-provider connection not found for provider ${providerId}` });
                }
                return AccountDAO.deleteAccount(providerId, accountId);
            });
    },

    updateAccount: (userId, providerId, accountId, newAccount) => {
        return checkUserProviderConnection(userId, providerId)
            .then(exists => {
                if (!exists) {
                    return Promise.reject({ status: 404, error: `user-provider connection not found for provider ${providerId}` });
                }
                return AccountDAO.updateAccount(accountId, newAccount);
            });
    }

};

module.exports = ProviderDAO;
