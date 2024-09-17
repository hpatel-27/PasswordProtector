import api from './APIClient.js';

const loginButton = document.querySelector('#loginButton');
const username = document.querySelector('#username');
const password = document.querySelector('#password');
const errorBox = document.querySelector('#errorbox');

const login = e => {
  errorBox.classList.add("hidden");
  api.logIn(username.value, password.value).then(userData => {
    document.location = "./home";
  }).catch((err) => {
    errorBox.classList.remove("hidden");
    if(err.status === 401) {
      errorBox.innerHTML = "Invalid username or password";
    }
    else {
      errorBox.innerHTML = err;
    }
  });
};

// Attempt to log in when button is clicked
loginButton.addEventListener('click', login);


// Pressing ENTER on username or password should also attempt to login
const loginOnEnter = e => {
  if(e.key === 'Enter') {
    login();
  }
};
username.addEventListener('keyup', loginOnEnter);
password.addEventListener('keyup', loginOnEnter);