import HTTPClient from "./HTTPClient.js";

const API_BASE = `./api`;

//////////////////////
//USER API ENDPOINTS//
//////////////////////

// Create a new user
const createNewUser = (username, password, email ) => {
  const newUser = {
    username: username,
    password: password,
    email: email
  }
  return HTTPClient.post(`${API_BASE}/users/signup`, newUser);
}

// Retrieve the current user that is logged in
const getCurrentUser = () => {
  return HTTPClient.get(`${API_BASE}/users/current`);
};

// Log in a user
const logIn = (username, password) => {
  const data = {
    username: username,
    password: password
  }
  return HTTPClient.post(`${API_BASE}/users/login`, data);
};

// Log out the current user
const logOut = () => {
  return HTTPClient.post(`${API_BASE}/users/logout`, {});
};

///////////////////////////
// PROVIDER API ENDPOINTS//
///////////////////////////

// Get an individual provider
const getProviderById = (providerId) => {
  return HTTPClient.get(`${API_BASE}/providers/${providerId}`);
}

// Get all of the current users providers
const getAllProviders = () => {
  return HTTPClient.get(`${API_BASE}/users/providers`);
}

// Create an individual provider
const createProvider = ( name ) => {
  const provider = {
    name: name
  }
  return HTTPClient.post(`${API_BASE}/users/providers`, provider);
}

// Remove an individual provider based on id
const deleteProvider = (providerId) => {
  return HTTPClient.delete(`${API_BASE}/users/providers/${providerId}`);
}

// change the name of an individual provider
const editProviderName = (newName, providerId) => {
  const newProvider = {
    name: newName,
  }
  return HTTPClient.put(`${API_BASE}/providers/${providerId}`, newProvider);
}

//////////////////////////
// ACCOUNT API ENDPOINTS//
//////////////////////////

const getAccounts = (providerId) => {
  return HTTPClient.get(`${API_BASE}/accounts/${providerId}`);
}

const getAccountById = (providerId, accountId) => {
  return HTTPClient.get(`${API_BASE}/accounts/${providerId}/${accountId}`);
}

const createAccount = ( providerId, username, password, notes ) => {
  const account = {
    username: username,
    password: password,
    notes: notes
  }
  return HTTPClient.put(`${API_BASE}/providers/${providerId}/accounts`, account);
}

const deleteAccount = ( providerId, accountId ) => {
  return HTTPClient.delete(`${API_BASE}/providers/${providerId}/accounts/${accountId}`);
}

const updateAccount = (providerId, accountId, username, password, notes) => {
  const account = {
    username: username,
    password: password,
    notes: notes
  }
  return HTTPClient.put(`${API_BASE}/accounts/${providerId}/${accountId}`, account);
}

export default {
  createNewUser,
  getCurrentUser,
  logIn,
  logOut,
  getProviderById,
  getAllProviders,
  createProvider,
  deleteProvider,
  editProviderName,
  getAccounts,
  getAccountById,
  createAccount,
  deleteAccount,
  updateAccount
};



