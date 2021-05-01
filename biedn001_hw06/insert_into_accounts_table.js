/*
TO DO:
-----
READ ALL COMMENTS AND REPLACE VALUES ACCORDINGLY
*/

const mysql = require("mysql");
const bcrypt = require('bcrypt');

const dbCon = mysql.createConnection({
    host: "localhost",
    user: "root",               // replace with the database user provided to you
    password: "683548A!ex",                  // replace with the database password provided to you
    database: "C4131S21U10",           // replace with the database user provided to you
    port: 3306
});

console.log("Attempting database connection");
dbCon.connect(function (err) {
    if (err) {
        throw err;
    }

    console.log("Connected to database!");

    const saltRounds = 10;
    const myPlaintextPassword = 'password'; // replace with password chosen by you OR retain the same value
    const passwordHash = bcrypt.hashSync(myPlaintextPassword, saltRounds);

    const rowsToBeInserted = [
        {
            "name": "President Joan T.A. Gabel",
            "category": "Academic",
            "location": "202 Morrill Hall\r\n100 Church Street SE\r\nMinneapolis, MN 55455",
            "contact_info": "President of the University of Minnesota System",
            "email": "upres@umn.edu",
            "website": "Home Page",
            "website_url": "https://president.umn.edu/"
        },
        {
            "name": "Professor Dan Challou",
            "category": "Academic",
            "location": "383 Shepherd Laboratory\r\n100 Union Street SE\r\nMinneapolis, MN 55455",
            "contact_info": "Professor of CSCI 4131 - Internet Programming",
            "email": "chal0006@umn.edu",
            "website": "Course Home Page",
            "website_url": "https://canvas.umn.edu/courses/217376"
        }
    ];

    dbCon.query('INSERT tbl_contacts SET ?', rowsToBeInserted[0], function (err, result) {
        if (err) {
            throw err;
        }
        console.log("Table record inserted!");
    });
    dbCon.query('INSERT tbl_contacts SET ?', rowsToBeInserted[1], function (err, result) {
        if (err) {
            throw err;
        }
        console.log("Table record inserted!");
    });

    dbCon.end();
});
