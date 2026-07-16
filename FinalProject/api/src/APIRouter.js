const express = require('express');
const cookieParser = require('cookie-parser');

const apiRouter = express.Router();

apiRouter.use(cookieParser());
apiRouter.use(express.json());

const UserDAO = require('./db/UserDAO');
const ProviderDAO = require('./db/ProviderDAO');

const { TokenMiddleware, generateToken, removeToken } = require('./middleware/TokenMiddleware');

// Consistent error responder. DAOs reject with { status, error }; anything
// else falls back to a 500.
const sendError = (res) => (err) => {
    res.status(err && err.status ? err.status : 500)
        .json({ error: (err && err.error) || 'Internal server error' });
};

////////////
//USER API//
////////////

// Get the list of users (for display upon login)
apiRouter.get('/users', (req, res) => {
    UserDAO.getUsers()
        .then(users => res.json(users))
        .catch(sendError(res));
});

// Get a user by credentials
apiRouter.get('/users/credentials', (req, res) => {
    const { username, password } = req.body;
    UserDAO.getUserByCredentials(username, password)
        .then(user => {
            if (user === null) {
                res.status(401).json({ error: 'Invalid username or password' });
            } else {
                res.status(200).json(user);
            }
        })
        .catch(sendError(res));
});

apiRouter.post('/users/signup', (req, res) => {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
        res.status(400).json({ error: 'All fields are required' });
        return;
    }

    // Reject duplicate usernames (checked by username alone, not credentials).
    UserDAO.getUserByUsername(username)
        .then(existing => {
            if (existing) {
                return res.status(400).json({ error: 'Duplicate User' });
            }
            return UserDAO.createNewUser({ email, username, password })
                .then(() => res.status(200).json({ success: true, message: 'User created successfully' }));
        })
        .catch(sendError(res));
});

apiRouter.post('/users/login', (req, res) => {
    if (!req.body.username || !req.body.password) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }

    UserDAO.getUserByCredentials(req.body.username, req.body.password)
        .then(user => {
            if (!user) {
                res.status(401).json({ error: 'Invalid username or password' });
                return;
            }
            generateToken(req, res, user);
            res.json({ user });
        })
        .catch(sendError(res));
});

apiRouter.post('/users/logout', (req, res) => {
    removeToken(req, res);
    res.json({ success: true });
});

apiRouter.get('/users/current', TokenMiddleware, (req, res) => {
    res.json(req.user);
});

// Get one of the current user's providers by id
apiRouter.get('/providers/:providerId', TokenMiddleware, (req, res) => {
    UserDAO.getUserProviderById(req.user.id, req.params.providerId)
        .then(provider => {
            if (provider) {
                res.json(provider);
            } else {
                res.status(404).json({ error: 'Provider not found' });
            }
        })
        .catch(sendError(res));
});

// List the current user's providers
apiRouter.get('/users/providers', TokenMiddleware, (req, res) => {
    UserDAO.getUserProviders(req.user.id)
        .then(userProviders => res.json(userProviders))
        .catch(sendError(res));
});

// Delete one of the current user's providers
apiRouter.delete('/users/providers/:providerId', TokenMiddleware, (req, res) => {
    UserDAO.deleteProvider(req.user.id, req.params.providerId)
        .then(removedProvider => res.json({ message: `provider with id ${req.params.providerId} has been removed.`, removedProvider }))
        .catch(sendError(res));
});

// Add a provider for the current user
apiRouter.post('/users/providers', TokenMiddleware, (req, res) => {
    UserDAO.addProvider(req.user.id, req.body)
        .then(provider => res.json(provider))
        .catch(sendError(res));
});

// Change the name of one of the current user's providers
apiRouter.put('/providers/:providerId', TokenMiddleware, (req, res) => {
    UserDAO.changeProviderName(req.user.id, req.params.providerId, req.body.name)
        .then(response => res.json(response))
        .catch(sendError(res));
});

////////////////
//PROVIDER API//
////////////////

// List every provider in the system
apiRouter.get('/providers', (req, res) => {
    ProviderDAO.getAllProviders()
        .then(providers => res.json(providers))
        .catch(sendError(res));
});

// Get all accounts under a provider the user owns
apiRouter.get('/accounts/:providerId', TokenMiddleware, (req, res) => {
    ProviderDAO.getProviderAccounts(req.user.id, req.params.providerId)
        .then(accounts => {
            if (accounts) {
                res.json(accounts);
            } else {
                res.status(404).json({ error: 'Accounts not found' });
            }
        })
        .catch(sendError(res));
});

// Get a single account by id
apiRouter.get('/accounts/:providerId/:accountId', TokenMiddleware, (req, res) => {
    ProviderDAO.getProviderAccountById(
        parseInt(req.user.id),
        parseInt(req.params.providerId),
        parseInt(req.params.accountId)
    )
        .then(account => {
            if (account) {
                res.json(account);
            } else {
                res.status(404).json({ error: 'Account not found' });
            }
        })
        .catch(sendError(res));
});

// Add an account to a provider
apiRouter.put('/providers/:providerId/accounts', TokenMiddleware, (req, res) => {
    ProviderDAO.addAccount(parseInt(req.user.id), parseInt(req.params.providerId), req.body)
        .then(provider => res.json(provider))
        .catch(sendError(res));
});

// Delete an account from a provider
apiRouter.delete('/providers/:providerId/accounts/:accountId', TokenMiddleware, (req, res) => {
    ProviderDAO.deleteAccount(
        parseInt(req.user.id),
        parseInt(req.params.providerId),
        parseInt(req.params.accountId)
    )
        .then(removedAccount => res.json({ message: `account with id ${req.params.accountId} has been removed.`, removedAccount }))
        .catch(sendError(res));
});

// Update an account
apiRouter.put('/accounts/:providerId/:accountId', TokenMiddleware, (req, res) => {
    ProviderDAO.updateAccount(
        parseInt(req.user.id),
        parseInt(req.params.providerId),
        parseInt(req.params.accountId),
        req.body
    )
        .then(account => {
            if (account) {
                res.json(account);
            } else {
                res.status(404).json({ error: 'Account not found' });
            }
        })
        .catch(sendError(res));
});

module.exports = apiRouter;
