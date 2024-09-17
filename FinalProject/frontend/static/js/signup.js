import api from './APIClient.js';

const signUpButton = document.querySelector('#signUpButton');
const username = document.querySelector('#username');
const password = document.querySelector('#password');
const email = document.querySelector('#email');
const errorBox = document.querySelector('#errorbox');

const signUp = e => {
  errorBox.classList.add("hidden");
  api.createNewUser(username.value, password.value, email.value).then(userData => {
    document.location = "./home";
  }).catch((err) => {
    errorBox.classList.remove("hidden");
    if(err.status === 400) {
      errorBox.innerHTML = "User Account Already Exists";
    }
    else {
      errorBox.innerHTML = err;
    }
  });
};

// Attempt to log in when button is clicked
signUpButton.addEventListener('click', signUp);


// Pressing ENTER on username or password should also attempt to login
const signUpOnEnter = e => {
  if(e.key === 'Enter') {
    login();
  }
};
username.addEventListener('keyup', signUpOnEnter);
password.addEventListener('keyup', signUpOnEnter);
email.addEventListener('keyup', signUpOnEnter);