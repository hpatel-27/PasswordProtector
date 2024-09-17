const db = require('./DBConnection');
const Account = require('./models/Account');

module.exports = {

    // Should just return all accounts in the account table
    getAllAccounts: (providerId) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM account WHERE prv_id = ?', [providerId])
                .then(({ results }) => {
                    const accounts = results.map(accountData => new Account(accountData));
                    resolve(accounts);
                })
                .catch((err) => {
                    reject(err);
                })
        });
    },

    // Return the account with the given PK in the account table
    getAccountById: (providerId, accountId) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM account WHERE act_id = ? AND prv_id = ?', [accountId, providerId])
                .then(({ results }) => {
                    if (results.length > 0) {
                        const account = new Account(results[0]);
                        resolve(account);
                    } else {
                        reject({ status: 404, error: `Account with id ${accountId} not found` });
                    }
                })
                .catch(( err ) => {
                    reject(err);
                })
            });
    },
    
    // Mapping should be created at provider lvl. Just need to add a new account to the account table.
    createAccount: (providerId, newAccount) => {
        return new Promise((resolve, reject) => {
            const { username, password, notes } = newAccount;
            if (!username || !password || !notes) {
                reject({ status: 400, error: "Incomplete fields" });
                return;
            }

            db.query('INSERT INTO account (act_username, act_password, act_notes, prv_id) VALUES (?, ?, ?, ?)', [username, password, notes, providerId])
                .then(({ results }) => {
                    const accountId = results.insertId;
                    const createdAccount = new Account({ act_id: accountId, act_username: username, act_password: password, act_notes: notes });
                    resolve(createdAccount);
                })
                .catch((err) => {
                    reject(err);
                })
        });
    },

    // Remove an account at this lvl. Should remove mapping at the provider lvl.
    deleteAccount: (providerId, accountId) => {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM account WHERE act_id = ? AND prv_id = ?', [accountId, providerId])
                .then(({ results }) => {
                    if (results.affectedRows > 0) {
                        resolve();
                    } else {
                        reject({ status: 404, error: `Account with id ${accountId} not found` });
                    }
                })
                .catch((err) => {
                    reject(err);
                })
        });
    },

    // Update the account in the table.
    updateAccount: (accountId, newAccount) => {
        return new Promise((resolve, reject) => {
            const { username, password, notes } = newAccount;
            db.query('UPDATE account SET act_username = ?, act_password = ?, act_notes = ? WHERE act_id = ?', [username, password, notes, accountId])
                .then(({ results }) => {
                    if (results.affectedRows > 0) {
                        const updatedAccount = new Account({ act_id: accountId, act_username: username, act_password: password, act_notes: notes });
                        resolve(updatedAccount);
                    } else {
                        reject({ status: 404, error: `Account with id ${accountId} not found` });
                    }
                })
                .catch((err) => {
                    reject(err);
                })
        });
    }

}