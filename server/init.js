require('dotenv').config();
const Maria = require("./utils/Maria");


global.mariadb = new Maria({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT)
});