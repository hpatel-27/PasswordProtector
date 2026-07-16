# Password Protector

Final Project for App Web Development

Password storage software using JWT for auth, Express server, MariaDB for database entries, and Node.js, containerized with Docker.
Users may login and create entries for websites that they have made accounts for and can store those passwords. Since users may have multiple accounts for the same site, such as multiple Gmail accounts, we also allow for multiple stored entries for the same site.

Here a list of all the API routes that were created to perform efficient data access operations:

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

To run this program, copy `FinalProject/.env.example` to `FinalProject/.env` and fill in real values, then run `docker compose up --build` from the `FinalProject` folder.

The `.env` should contain these fields:

```bash
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=

DB_HOST=database
DB_PORT=5432

PORT=80
API_SECRET_KEY=
ACCOUNT_ENCRYPTION_KEY=
