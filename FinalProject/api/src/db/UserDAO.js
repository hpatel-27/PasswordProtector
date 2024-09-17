const crypto = require('crypto');
const db = require('./DBConnection');
const User = require('./models/User');
let ProviderDAO = require('./ProviderDAO');
const { json } = require('stream/consumers');


const UserDAO = {

    // Retrieve all users from user table
    getUsers: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM user', (error, results, fields) => {
                if (error) {
                    reject(error);
                } else {
                    const filteredUsers = results.map(row => new User(row)).map(user => getFilteredUser(user));
                    resolve(filteredUsers);
                }
            });
        });
    },  

    // YELLOW LIGHT
    getUserByCredentials(username, password) {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM user WHERE usr_username=?', [username])
                .then(({ results }) => {
                    if (results.length === 0) {
                        resolve(null);
                    } else {
                        const user = new User(results[0]);
                        user.validatePassword(password)
                        .then(() => {
                            resolve(getFilteredUser(user));
                        })
                        .catch(err => {
                            resolve(null);
                        })
                    }
                })
                .catch(error => {
                    // Catch any database query errors
                    reject({ code: 500, message: "Database query error" });
                });
        });
    },
    

    // YELLOW LIGHT
    createNewUser: (newUser) => {
        return new Promise((resolve, reject) => {
            const { username, password, email } = newUser;
    
            // Generate a random salt
            const salt = crypto.randomBytes(32).toString('hex');
            // Hash the password with the salt
            crypto.pbkdf2(password, salt, 10000, 32, 'sha256', (err, derivedKey) => {
                if (err) {
                    reject({ code: 500, message: "Error hashing password" });
                }
                const hashedPassword = derivedKey.toString('hex');
                // Insert the new user into the database
                db.query('INSERT INTO user (usr_username, usr_password, usr_salt, usr_email) VALUES (?, ?, ?, ?)',
                    [username, hashedPassword, salt, email],
                    (error, results, fields) => {
                        if (error) {
                            reject(error);
                        } else {
                            const insertedUserId = results.insertId;
                            // Create a new User instance using the provided data
                            const createdUser = new User({
                                usr_id: insertedUserId,
                                usr_username: username,
                                usr_email: email
                            });
                            resolve(createdUser);
                        }
                    });
            });
        });
    },
    

    // Remove all mappings from the user_provider table that have the userId as the upr_usr_id and then remove the user from the user table
    // removeUser: (userId) => {
    //     return new Promise((resolve, reject) => {
    //         userId = parseInt(userId);
    //         // First, remove mappings from user_provider table
    //         db.query('DELETE FROM user_provider WHERE upr_usr_id = ?', [userId], (error, results, fields) => {
    //             if (error) {
    //                 reject(error);
    //                 return;
    //             }
                
    //             // Then, remove the user from the user table
    //             db.query('DELETE FROM user WHERE usr_id = ?', [userId], (error, results, fields) => {
    //                 if (error) {
    //                     reject(error);
    //                 } else {
    //                     resolve(results.affectedRows > 0);
    //                 }
    //             });
    //         });
    //     });
    // },

    // This retrieves the salt from the user table and hashes the new pw with the salt so that it can be stored.
    // changePassword: (userId, newPassword) => {
    //     return new Promise((resolve, reject) => {
    //         userId = parseInt(userId);
    //         // Fetch the user's salt from the user table
    //         db.query('SELECT usr_salt FROM user WHERE usr_id = ?', [userId], (error, results, fields) => {
    //             if (error) {
    //                 reject(error);
    //                 return;
    //             }
    
    //             if (results.length === 0) {
    //                 reject({ message: 'User not found' });
    //                 return;
    //             }
    
    //             const userSalt = results[0].usr_salt;
    
    //             // Hash the new password with the user's salt
    //             crypto.pbkdf2(newPassword, userSalt, 100000, 64, 'sha512', (err, derivedKey) => {
    //                 if (err) {
    //                     reject({ code: 500, message: "Error hashing password" });
    //                     return;
    //                 }
    //                 const hashedPassword = derivedKey.toString('hex');
    
    //                 // Update the user's password in the user table
    //                 db.query('UPDATE user SET usr_password = ? WHERE usr_id = ?', [hashedPassword, userId], (error, results, fields) => {
    //                     if (error) {
    //                         reject(error);
    //                     } else {
    //                         resolve(results.affectedRows > 0);
    //                     }
    //                 });
    //             });
    //         });
    //     });
    // },
    
    // Get all of the provider ids from user_provider and then retrieve each provider by id
    // I want these to use the provider dao to retrieve them.
    // GREEN LIGHT
    getUserProviders: async (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                userId = parseInt(userId);
    
                const results = await new Promise((resolve, reject) => {
                    db.query('SELECT * FROM user_provider WHERE upr_usr_id = ?', [userId])
                        .then(({ results }) => {
                            resolve(results);
                        })
                        .catch(err => {
                            reject(err);
                        });
                });

                const providerIds = results.map(row => row.upr_prv_id);
                const providerPromises = providerIds.map(providerId => ProviderDAO.getProviderById(providerId));
    
                const providers = await Promise.all(providerPromises);
                resolve(providers);
            } catch (error) {
                reject(error);
            }
        });
    },

    // YELLOW LIGHT
    getUserProviderById: async (userId, providerId) => {
        return new Promise(async (resolve, reject) => {
            try {
                // Parse userId and providerId as integers
                userId = parseInt(userId);
                providerId = parseInt(providerId);

                // Check if the user-provider connection exists
                const userProviderExists = await UserDAO.checkUserProviderConnection(userId, providerId);

                // If user-provider connection exists, retrieve provider details
                if (userProviderExists) {
                    const provider = await ProviderDAO.getProviderById(providerId);
                    resolve(provider);
                } else {
                    // If user-provider connection does not exist, reject with an error
                    reject({ status: 404, error: `User-provider connection not found for user ${userId} and provider ${providerId}` });
                }

            } catch (error) {
                // Throw any encountered errors
                reject({ status: 500, error: 'Internal server error' });
            }
        });
    },

    // Add the provider first to get the id and then add the user provider mapping
    // I want this to use the provider dao to add them.
    // GREEN LIGHT
    addProvider: async (userId, newProvider) => {
        return new Promise(async (resolve, reject) => {
            userId = parseInt(userId);
            try {
                // Create the provider using the ProviderDAO
                const createdProvider = await ProviderDAO.createProvider(newProvider);
    
                // Extract the provider ID from the created provider
                const newProviderId = createdProvider.id;
    
                // Insert the user-provider relationship into the user_provider table
                db.query('INSERT INTO user_provider (upr_usr_id, upr_prv_id) VALUES (?, ?)', [userId, newProviderId])
                    .then(({ results }) => {
                        if (results.affectedRows > 0) {
                            resolve(createdProvider);
                        } else {
                            reject({ status: 404, error: 'Could not add provider for some reason idk.' });
                        }
                    })
                    .catch(error => {
                        reject(error);
                    });

            } catch (error) {
                // If any error occurs during the process, reject with the error
                reject(error);
            }
        });
    },

    // delete the provider and then the user_provider mapping
    // Use the provider dao for this behavior
    // GREEN LIGHT
    deleteProvider: async (userId, providerId) => {
        return new Promise(async (resolve, reject) => {
            try {

                userId = parseInt(userId);
                providerId = parseInt(providerId);

                // Check if the user-provider connection exists
                const userProviderExists = await UserDAO.checkUserProviderConnection(userId, providerId);

                // If user-provider connection exists, retrieve provider details
                if (userProviderExists) {
                    
                    // Delete provider from the provider table
                    // Potentially not necessary if I can cascade delete with a query constraint
                    await ProviderDAO.deleteProvider(providerId);    
                    resolve({ message: 'Provider deleted successfully' });

                } else {
                    // If user-provider connection does not exist, reject with an error
                    reject({ status: 404, error: `User-provider connection not found for user ${userId} and provider ${providerId}` });
                }
    
            } catch (error) {
                reject({ status: 500, error: 'Internal server error' });
            }
        });
    },

    //GREEN LIGHT
    changeProviderName: async (userId, providerId, newName) => {
        return new Promise(async (resolve, reject) => {
            try {
                userId = parseInt(userId);
                providerId = parseInt(providerId);     
                
                const userProviderExists = await UserDAO.checkUserProviderConnection(userId, providerId);

                // If user-provider connection exists, retrieve provider details
                if (userProviderExists) {
                    const message = await ProviderDAO.changeProviderName(providerId, newName);
                    resolve( message );
                } else {
                    // If user-provider connection does not exist, reject with an error
                    reject( { status: 404, error: `User-provider connection not found for user ${userId} and provider ${providerId}` } );
                }
            } catch (error) {
                // Throw any encountered errors
                throw error;
            }
        })
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
    

};

module.exports = UserDAO;

// Helper
function getFilteredUser(user) {
    return {
      "id": user.id,
      "username": user.username,
      "email": user.email
    }
}
