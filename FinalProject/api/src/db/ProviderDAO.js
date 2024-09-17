const db = require('./DBConnection');
const Provider = require('./models/Provider');
const AccountDAO = require('./AccountDAO');


const ProviderDAO = {

    // Return all of the providers in the system (this doesnt actually help our application its more for testing.)
    getAllProviders: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM provider', (error, results, fields) => {
                if (error) {
                    reject(error);
                } else {
                    const providers = results.map(providerData => new Provider(providerData));
                    resolve(providers);
                }
            });
        });
    },

    // Return the provider with the PK that is provided
    // GREEN LIGHT
    getProviderById: (prv_id) => {
        return new Promise((resolve, reject) => {
    
            db.query('SELECT * FROM provider WHERE prv_id = ?', [prv_id])
                .then(({ results }) => {
                    if (results.length > 0) {
                        const provider = new Provider(results[0]);
                        resolve(provider);
                    } else {
                        reject({ status: 404, error: `Provider with id ${prv_id} not found` });
                    }
                })
                .catch(err => {
                    reject(err);
                });
        });
    },
    

    // Adds the provider but may want to make this also add the mapping. Or I can just return the provider and use its id.
    // GREEN LIGHT
    createProvider: (newProvider) => {
        return new Promise((resolve, reject) => {
    
            const { name } = newProvider;
            if (!name) {
                reject({ status: 400, error: "A provider must be given a name" });
                return;
            }
    
            // Insert the new provider into the database
            db.query('INSERT INTO provider (prv_name) VALUES (?)', [name])
                .then(({ results }) => {
                    const providerId = results.insertId;
                    const createdProvider = new Provider({ prv_id: providerId, prv_name: name });
                    resolve(createdProvider);
                })
                .catch(err => {
                    reject(err);
                });
        });
    },
    

    // Remove the provider from the provider table and remove the mapping. But maybe the mapping should be handled at the user lvl.
    // GREEN LIGHT
    deleteProvider: (providerId) => {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM provider WHERE prv_id = ?', [providerId])
                .then(({ results }) => {
                    if (results.affectedRows > 0) {
                        resolve({ id: providerId });
                    } else {
                        reject({ status: 404, error: `Provider with id ${providerId} not found` });
                    }
                })
                .catch(err => {
                    console.log(err);
                    reject(err);
                })

        });
    },

    // Change provider directly in the provider table.
    // GREEN LIGHT
    changeProviderName: (providerId, newName) => {
        return new Promise((resolve, reject) => {
            providerId = parseInt(providerId);
            if (!newName) {
                reject({ status: 400, error: "Provider name cannot be empty" });
                return;
            }

            db.query('UPDATE provider SET prv_name = ? WHERE prv_id = ?', [newName, providerId])
                .then(({ results }) => {
                    resolve({ message: 'Provider name updated successfully' });
                })
                .catch((err) => {
                    reject(err);
                })

        });
    },

    // Will need to get a list of the provider_account mappings and then use them to get the list of accounts from the account table.
    // Alternatively I could just loop with the ids and get the accounts from the front
    // YELLOW LIGHT
    getProviderAccounts: async (userId, providerId) => {
        return new Promise(async (resolve, reject) => {            
            try {
        
                userId = parseInt(userId);
                providerId = parseInt(providerId);

                const userProviderExists = await ProviderDAO.checkUserProviderConnection(userId, providerId);

                if( userProviderExists ){
                    const accounts = await AccountDAO.getAllAccounts(providerId);
                    resolve(accounts);
                } else {
                    // If user-provider connection does not exist, reject with an error
                    reject({ status: 404, error: `user-provider connection not found for provider ${providerId}`});
                }

            } catch (error) {
                throw error;
            }
            
        });
    },

    getProviderAccountById: (userId, providerId, accountId) => {
        return new Promise(async (resolve, reject) => {
            try {
                // Check if the user-provider connection exists
                const userProviderExists = await ProviderDAO.checkUserProviderConnection(userId, providerId);

                // If user-provider connection exists, retrieve provider details
                if (userProviderExists) {
                    const account = await AccountDAO.getAccountById(providerId, accountId);
                    resolve(account);
                } else {
                    // If user-provider connection does not exist, reject with an error
                    reject({ status: 404, error: `user-to-account pathway not found for provider ${providerId} and account ${accountId}` });
                }
            } catch (error) {
                // Throw any encountered errors
                reject({ status: 500, error: 'Internal server error' });
            }
        });
    },

    // Should just add the provider_account mapping and then add the account via the account dao
    addAccount: async (userId, providerId, newAccount) => {
        return new Promise(async (resolve, reject) => {
            try {
                const userProviderExists = await ProviderDAO.checkUserProviderConnection(userId, providerId);

                if( userProviderExists ){
                    try {
                        const returnedAccount = await AccountDAO.createAccount(providerId, newAccount);
                        resolve(returnedAccount);
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    reject({ status: 404, error: `user-provider connection not found for provider ${providerId}`});
                }
            } catch (err) {
                reject(err);
            }
        });
    },

    // Should delete the provider_account mapping and then delete the actual account via the account dao
    deleteAccount: async (userId, providerId, accountId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const userProviderExists = await ProviderDAO.checkUserProviderConnection(userId, providerId);

                if(userProviderExists) {
                    const results = await AccountDAO.deleteAccount(providerId, accountId);
                    resolve(results);
                } else {
                    reject({ status: 404, error: `user-provider connection not found for provider ${providerId}`});
                }
            } catch (err) {
                reject(err)
            }
        });
    }, 

    updateAccount: (userId, providerId, accountId, newAccount) => {
        return new Promise(async (resolve, reject) => {
            try {
                // Check if the user-provider connection exists
                const userProviderConnection = await ProviderDAO.checkUserProviderConnection(userId, providerId);
    
                // If user-provider connection exists, retrieve provider details
                if (userProviderConnection) {
                    const account = await AccountDAO.updateAccount(accountId, newAccount);
                    resolve(account);
                } else {
                    // If user-provider connection does not exist, reject with an error
                    reject({ status: 404, error: `user-provider connection not found for provider ${providerId}`});
                }
            } catch (error) {
                // Throw any encountered errors
                reject({ status: 500, error: 'Internal server error' });
            }
        });
    },

    checkUserProviderConnection: async (userId, providerId) => {
        return new Promise((resolve, reject) => {
            try {
                db.query('SELECT COUNT(*) AS count FROM user_provider WHERE upr_usr_id = ? AND upr_prv_id = ?', [userId, providerId])
                    .then(({ results }) => {
                        resolve(results[0].count > 0);
                    })
                    .catch(err => {
                        reject(err);
                    });
            } catch (error) {
                reject({ status: 500, error: 'Internal server error' });
            }
        });
    },

}

module.exports = ProviderDAO;
