const express = require('express');
const db = require('./db');
const router = express.Router();

router.get('/contacts', function (req, res) {
    // TODO: Implement code to fetch contacts from the database
});

router.post('/login', function (req, res) {
    console.log("Login API");

    db.connect(function (err) {
        if (err) {
            throw err;
        }
        db.query('SELECT * FROM tbl_accounts WHERE acc_login = ?', req.body.login, function (err, result) {
            if (err) {
                throw err;
            }
            console.log(result);
        });

        db.end();
    });
});

// TODO: Add implementation for other necessary end-points

module.exports = router;