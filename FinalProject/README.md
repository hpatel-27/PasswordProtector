# Password Protector
## Group L: Final Project Report

* What works (description of your features) and what doesn't work (any known issues)
  - The user has the ability to create proviers and store multiple accounts within those providers. The user can edit the provider name or the account name and save the changes to be maintained in the database. Profile functionality is limited to the user having the ability to sign up and log in. They dont have the option to change their account username, email, or password. This data is all persisted in the database. In addition the user has the ability to utilze the application while offline. As long as they log in before they go offline the user can retrieve any information that was already in the database upon login.
* A brief description of your authentication and authorization processes. What techniques are you using? What data is being stored where and how? How are you making sure users only access what they are allowed to?
  - The authentication and authorization process has not changed. The users password is hashed with a salt and stored in the database. A jwt token is generated and stored as a cookie for authorization purposes.
* A list of all the pages in your app, how to navigate them, and the offline functionality they provide, if any
  - Landing Page (No offline functionality)
  - Login Page (No offline functionality)
  - Sign up Page (No offline functionality)
  - Home Page: Upon login the home page along with all provider information and account information is cached so that the user can go back and retrieve any   of this data. They just cannot manipulate the data. If they attempt to manipulate the data then nothing happens.
  - Profile: 
* A description of your caching strategy and why you chose it
  - Because the data in our page doesnt dynamically change in real time without user interaction, we choose to have all relevent pages immediately cache   when the service worker installs. We decided to do things this way so that if the user goes offline for any reason at any point in time then the user will still have access to important information.

- all endpoints begin with /api

Method | Route                 | Description
------ | --------------------- | ---------
`GET` | `/users`              | Retrieves the entire list of users
`GET` | `/users/credentials`           | Retreives a user by their credentials
`POST`  | `/users/signup`              | Creates a new user account
`POST`  | `/users/login`      | Validates and logs in a user account
`POST`  | `/users/logout`      | Logs a user out
`GET`  | `/users/current`      | Retrieves the current user
`GET`  | `/providers/:providerId`      | Gets a provider by their id
`GET`  | `/users/providers`      | Gets a list of the providers that a user has
`DELETE`  | `/users/providers/:providerId`      | Removes the provider with the given id
`POST`  | `/users/providers`      | Adds a provider
`PUT`  | `/providers/:providerId`      | Changes the name of the given provider
`GET`  | `/providers`      | Gets a list of all of the providers
`GET`  | `/accounts/:providerId`      | Gets all accounts listed under the provider with the given id
`GET`  | `/accounts/:providerId/:accountId`      | get an account with the given id
`PUT`  | `/providers/:providerId/accounts`      | Add an account to the provider
`DELETE`  | `/providers/:providerId/accounts/:accountId`      | Removes an account from the provider
`PUT`  | `/accounts/:providerId/:accountId`      | Changes the field of the account provided by id


ER Diagram
![Blank board (1)](https://media.github.ncsu.edu/user/24486/files/344297ed-773e-48f6-8dc5-b6bcd505008f)


### Team Member Contributions

#### Harsh Patel

* completed all of the dynamic content in the static js for the home and profile page
* debugged the home page js to find the error states (deleting the last provider for a user, clicking the deleting account button before saving the relevant account, which provider goes into the current provider input on the top left when various providers are deleted)
* updated the buttons for the home page to be cleaner and match the rest of the application's design, also provided the hover property with a darker background so the user sees that they are hovering over a button
* added the buttons for the updating and deletion of providers
* updated the style for the signup page to look cleaner and in a way that mobile users would not be disadvantaged
* updated the style for the login page to look cleaner and in a way that mobile users would not be disadvantaged
* updated the style for the landing page to look cleaner and in a way that mobile users would not be disadvantaged
* Worked with Luke to debug the serviceWorker and cache all the accounts for all the user's providers so that we would be able to update them while offline

#### Luke Thompson

* Reworked api endpoints from start to finish (front end client to the dao)
* Tested and debugged all dao endpoints
* Restructured the database to meet the needs of the project
* Restructured the er diagram to reflect database changes
* Implemented offline functionality
* Input the manifest json file
* Readme

#### Furkan Karablut

* Completed the styling of the home and profile page to be mobile first and work on all device types

#### Project Effort Contribution

Milestone   | Harsh Patel | Luke Thompson | Furkan Karablut
----------- | ------------- | ------------- | --------------
Milestone 1 | 30%           | 40%           | 30%
Milestone 2 | 40%           | 40%           | 20%
Final       | 47.5%         | 47.5%         | 5%
----------- | ------------- | ------------- | --------------
TOTAL:      | (117.5)%      | (127.5)%      | (55)%
