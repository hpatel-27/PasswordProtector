const db = require('./DBConnection');
const Account = require('./models/Account');

module.exports = {

    getAllAccounts: (providerId) => {
        return db.query('SELECT * FROM account WHERE prv_id = $1', [providerId])
            .then(({ results }) => results.map(accountData => new Account(accountData)));
    },

    getAccountById: (providerId, accountId) => {
        return db.query('SELECT * FROM account WHERE act_id = $1 AND prv_id = $2', [accountId, providerId])
            .then(({ results }) => {
                if (results.length > 0) {
                    return new Account(results[0]);
                }
                return Promise.reject({ status: 404, error: `Account with id ${accountId} not found` });
            });
    },

    createAccount: (providerId, newAccount) => {
        const { username, password, notes } = newAccount;
        if (!username || !password || !notes) {
            return Promise.reject({ status: 400, error: 'Incomplete fields' });
        }
        return db.query(
            'INSERT INTO account (act_username, act_password, act_notes, prv_id) VALUES ($1, $2, $3, $4) RETURNING act_id',
            [username, password, notes, providerId]
        ).then(({ results }) => new Account({
            act_id: results[0].act_id,
            act_username: username,
            act_password: password,
            act_notes: notes
        }));
    },

    deleteAccount: (providerId, accountId) => {
        return db.query('DELETE FROM account WHERE act_id = $1 AND prv_id = $2', [accountId, providerId])
            .then(({ rowCount }) => {
                if (rowCount > 0) {
                    return { id: accountId };
                }
                return Promise.reject({ status: 404, error: `Account with id ${accountId} not found` });
            });
    },

    updateAccount: (accountId, newAccount) => {
        const { username, password, notes } = newAccount;
        return db.query(
            'UPDATE account SET act_username = $1, act_password = $2, act_notes = $3 WHERE act_id = $4',
            [username, password, notes, accountId]
        ).then(({ rowCount }) => {
            if (rowCount > 0) {
                return new Account({
                    act_id: accountId,
                    act_username: username,
                    act_password: password,
                    act_notes: notes
                });
            }
            return Promise.reject({ status: 404, error: `Account with id ${accountId} not found` });
        });
    }

};
