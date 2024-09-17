const express = require('express');
const cookieParser = require('cookie-parser');

const apiRouter = express.Router();

apiRouter.use(cookieParser());
apiRouter.use(express.json());

const UserDAO = require('./db/UserDAO');
const ProviderDAO = require('./db/ProviderDAO');
const AccountDAO = require('./db/AccountDAO');

const {TokenMiddleware, generateToken, removeToken} = require('./middleware/TokenMiddleware');
const Provider = require('./db/models/Provider');

////////////
//USER API//
////////////

// Get the list of users (for display upon login)
// GREEN LIGHT
apiRouter.get('/users', (req, res) => {
    UserDAO.getUsers()
        .then(users => {
            res.json(users);
        })
        .catch((err) => {
            res.status(err.status || 500).json({ error: err.error || 'Internal server error' });
        })
});

//HTTP Method: GET
// Get a user by id
// GREEN LIGHT
apiRouter.get('/users/credentials', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Call the getUserByCredentials function from UserDAO
    UserDAO.getUserByCredentials(username, password)
        .then(user => {
            if (user === null) {
                // Handle case where user is not found
                res.status(401).json({ error: 'Invalid username or password' });
            } else { 
                // User found, handle success case
                res.status(200).json(user);
            }
        })
        .catch((err) => {
            res.status(err.status || 500).json({ error: err.error || 'Internal server error' });
        });
});

// GREEN LIGHT
apiRouter.post('/users/signup', (req, res) => {
    // Extract user information from the request body
    const { email, username, password } = req.body;

    // Check if all required fields are provided
    if (email && username && password) {
        UserDAO.getUserByCredentials(username, password)
            .then(user => {
                if(user) {
                    res.status(404).json({error: 'Duplicate User'});
                }
                else {
                    // Call the createNewUser function from UserDAO
                    UserDAO.createNewUser({ email, username, password })
                    .then(() => {
                        res.status(200).json({ success: true, message: "User created successfully" });
                    })
                    .catch(err => {
                        console.error(err);
                        res.status(err.code).json({ error: err.message });
                    });
                }
            })
            .catch((err) => {
                res.status(err.status || 500).json({ error: err.error || 'Internal server error' });
            })
    } else {
        // If any required field is missing, respond with an error
        res.status(400).json({ error: 'All fields are required' });
    }
});

// GREEN LIGHT
apiRouter.post('/users/login', (req,  res) => {
    if(req.body.username && req.body.password) {
        UserDAO.getUserByCredentials(req.body.username, req.body.password)
            .then(user => {
                let result = {
                    user: user
                }

                generateToken(req, res, user);

                res.json(result);
            }).catch(err => {
                res.status(err.status || 500).json({ error: err.error || 'Internal server error' });
            });
    }
    else {
        res.status(401).json({error: 'Not authenticated'});
    }
});


// GREEN LIGHT
apiRouter.post('/users/logout', (req,  res) => {
    removeToken(req, res);
    res.json({success: true});
});

// GREEN LIGHT
apiRouter.get('/users/current', TokenMiddleware, (req,  res) => {
    res.json(req.user);
});

// Note: More information will be learned about this in class.
// HTTP Method: DELETE
// Consideration: Whether this account has previously existed and we are just getting it back and reclaiming its data, or always create a new one from scratch.
// Remove a user account from the interface
// apiRouter.delete('/users/:userId', (req, res) => {
//     const userId = req.params.userId;

//     UserDAO.removeUser(userId)
//         .then((removedUser) => {
//             res.json({ message: `User with id ${userId} has been removed.`, removedUser });
//         })
//         .catch((error) => {
//                 if (error.status && error.error) {
//                 res.status(error.status).json({ error: error.error });
//             } else {
//                 res.status(500).json({ error: 'Internal server error' });
//             }
//         });
// });


// Note: Unsure whether to remove from the database in case they want to log back in.
// HTTP Method: PUT
// Update a user account (change the password)
// apiRouter.put('/users/update', (req, res) => {
//     const userId = req.user.userId;
//     const newPassword = req.body.password;
//     UserDAO.changePassword(userId, newPassword)
//         .then((user) => {
//             res.json({ message: `Password changed for user with id ${userId}.`, user });
//         })
//         .catch((error) => {
//             if (error.status && error.error) {
//                 res.status(error.status).json({ error: error.error });
//             } else {
//                 res.status(500).json({ error: 'Internal server error' });
//             }
//     });
// });

//HTTP Method: GET
// Get a provider by id
// Should only be able to get if the user has this in the user_provider table.
//GREEN LIGHT
apiRouter.get('/providers/:providerId', TokenMiddleware, (req, res) => {
    const userId = req.user.id;
    const providerId = req.params.providerId;

    UserDAO.getUserProviderById(userId, providerId)
        .then(provider => {
            if(provider) {
                res.json(provider);
            }
            else {
                res.status(404).json({error: 'Provider not found'});
            }
        })
        .catch((err) => {
            res.status(err.status || 500).json({ error: err.error || 'Internal server error' });
        });  
});

// HTTP Method: GET
// Get a list of the users providers
// GREEN
apiRouter.get('/users/providers', TokenMiddleware, (req, res) => {
    const userId = req.user.id;
    UserDAO.getUserProviders(userId)
        .then((userProviders) => {
            res.json(userProviders);
        })
        .catch((err) => {
            res.status(err.status || 500).json({ error: err.error || 'Internal server error' });
        });
});

// HTTP Method: DELETE
// Delete a provider for the user
// YELLOW LIGHT
apiRouter.delete('/users/providers/:providerId', TokenMiddleware, (req, res) => {
    const userId = req.user.id;
    const providerId = req.params.providerId;

    UserDAO.deleteProvider(userId, providerId)
        .then((removedProvider) => {
            res.json({ message: `provider with id ${providerId} has been removed.`, removedProvider });
        })
        .catch((error) => {
            res.status(err.status || 500).json({ error: err.error || 'Internal server error' });
        });
});

// HTTP Method: POST
// Add a provider for the user
// YELLOW LIGHT
apiRouter.post('/users/providers', TokenMiddleware, (req, res) => {
    const userId = req.user.id;
    let newProvider = req.body;

    UserDAO.addProvider(userId, newProvider)
        .then((provider) => {
            res.json(provider);
        })
        .catch((error) => {
            res.status(err.status || 500).json({ error: err.error || 'Internal server error' });
        })
});

// Change the name of a given provider
// YELLOW LIGHT
apiRouter.put('/providers/:providerId', TokenMiddleware, (req, res) => {
    const userId = req.user.id;
    const providerId = req.params.providerId;
    const newName = req.body.name;

    UserDAO.changeProviderName(userId, providerId, newName)
        .then(response => {
            res.json(response);
        })
        .catch((error) => {
            if (error.status && error.error) {
                res.status(error.status).json({ error: error.error });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        })
});

////////////////
//PROVIDER API//
////////////////

// Retrieve a list of all of the providers
apiRouter.get('/providers', (req, res) => {
    ProviderDAO.getAllProviders()
        .then((providers) => {
            res.json(providers)
        })
        .catch((err) => {
            res.status(err.status || 500).json({ error: err.error || 'Internal server error' });
        })
})

// Get all accounts listed under that provider
apiRouter.get('/accounts/:providerId', TokenMiddleware, (req, res) => {
    const userId = req.user.id;
    const providerId = req.params.providerId;

    ProviderDAO.getProviderAccounts(userId, providerId)
        .then((accounts) => {
            if(accounts) {
                res.json(accounts);
            }
            else {
                res.status(404).json({error: 'Accounts not found'});
            }
        })
        .catch((error) => {

        })
})


// Get an account by id
// YELLOW LIGHT
apiRouter.get('/accounts/:providerId/:accountId', TokenMiddleware, (req, res) => {
    const userId = parseInt(req.user.id);
    const accountId = parseInt(req.params.accountId);
    const providerId = parseInt(req.params.providerId);

    ProviderDAO.getProviderAccountById(userId, providerId, accountId)
        .then(account => {
            if(account) {
                res.json(account);
            }
            else {
                res.status(404).json({error: 'Account not found'});
            }
        })
        .catch(err => {
            res.status(err.status || 500).json({ error: err.error || 'Internal server error' });
        })
})

// Add an account to a provider
// YELLOW LIGHT
apiRouter.put('/providers/:providerId/accounts', TokenMiddleware, (req, res) => {

    const userId = parseInt(req.user.id);
    const providerId = parseInt(req.params.providerId);
    let newAccount = req.body;

    ProviderDAO.addAccount(userId, providerId, newAccount)
        .then((provider) => {
            res.json(provider);
        })
        .catch((err) => {
            res.status(err.status || 500).json({ error: err.error || 'Internal server error' });
        })
});

// Delete an account from a provider
// YELLOW LIGHT
apiRouter.delete('/providers/:providerId/accounts/:accountId', TokenMiddleware, (req, res) => {

    const userId = parseInt(req.user.id);
    const providerId = parseInt(req.params.providerId);
    const accountId = parseInt(req.params.accountId);

    ProviderDAO.deleteAccount(userId, providerId, accountId)
        .then((removedAccount) => {
            res.json({ message: `account with id ${accountId} has been removed.`, removedAccount });
        })
        .catch((err) => {
            res.status(err.status || 500).json({ error: err.error || 'Internal server error' });
        });
})

// Update an account field
// GREEN LIGHT
apiRouter.put('/accounts/:providerId/:accountId', TokenMiddleware, (req, res) => {
    const userId = parseInt(req.user.id);
    const providerId = parseInt(req.params.providerId);
    const accountId = parseInt(req.params.accountId);
    const newAccount = req.body;

    ProviderDAO.updateAccount( userId, providerId, accountId, newAccount )
        .then(account => {
            if(account) {
                res.json(account);
            }
            else {
                res.status(404).json({error: 'Account not found'});
            }
        })
        .catch(err => {
            res.status(err.status || 500).json({ error: err.error || 'Internal server error' });
        })
})


module.exports = apiRouter;
