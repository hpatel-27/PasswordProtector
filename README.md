# Password Protector

Final Project for App Web Development

Password storage software using JWT for auth, Express server, MariaDB for database entries, and Node.js
Users may login and create entries for websites that they have made accounts for and can store those passwords. Since users may have multiple accounts for the same site, such as multiple Gmail accounts, we also allow for multiple stored entries for the same site.

To run this program you will need to make a .env file in the Final Project folder after cloning it.

It should contain these fields:

```bash
MYSQL_ROOT_PASSWORD=
MYSQL_DATABASE=
MYSQL_USER=
MYSQL_PASSWORD=
DB_ENGINE=
DB_HOST=
DB_PORT=
DB_CHARSET=

PORT=
API_SECRET_KEY=
