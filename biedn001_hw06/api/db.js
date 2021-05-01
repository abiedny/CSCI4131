const mysql = require("mysql");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",               // replace with the database user provided to you
    password: "683548A!ex",                  // replace with the database password provided to you
    database: "C4131S21U10",           // replace with the database user provided to you
    port: 3306
});

module.exports = db;