// sets up our mysql connection pool so we can reuse connections across routes
// using mysql2/promise for async/await support
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
});
console.log({
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD_EXISTS: !!process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
});

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD exists:", !!process.env.DB_PASSWORD);
console.log("DB_NAME:", process.env.DB_NAME);

module.exports = pool;