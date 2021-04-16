const mysql = require("mysql");

const db = mysql.createConnection({
    host: "cse-mysql-classes-01.cse.umn.edu",
    user: "C4131S21UXXX",               // replace with the database user provided to you
    password: "XXXXX",                  // replace with the database password provided to you
    database: "C4131S21UXXX",           // replace with the database user provided to you
    port: 3306
});

module.exports = db;