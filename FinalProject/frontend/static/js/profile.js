import api from './APIClient.js';

const emailField = document.getElementById('email-field');
const userField = document.getElementById('user-field');


api.getCurrentUser().then(user => {
    let link = document.getElementById('sign-out');
    link.addEventListener("click", e => {
        e.preventDefault();
        api.logOut().then(() => {
            document.location = "./login";
        });
    })
    userField.value = user.username;
    emailField.value = user.email;

})
.catch(error => {
    if(error.status === 401) {
        console.log("We are not logged in");
        document.location = './login';
    }
    else {
        console.log(`${error.status}`, error);
    }
});


const updateProfileBtn = document.querySelector('#update-profile');

updateProfileBtn.addEventListener('click', (e) => {

    
});
