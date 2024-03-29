const express = require('express');
const db = require('./db');
const bcrypt = require('bcrypt');
var mysql = require('mysql');
const path = require('path');
const router = express.Router();

router.get('/contacts', function (req, res) {
    //Return contacts.json like last time to make it ez
    db.query('SELECT * FROM tbl_contacts', function (err, result) {
        if (err) {
            throw err;
        }

        res.json(result);
    });
});

router.post('/addContact', (req, res) => {
    // Insert form data into db
    db.query('INSERT tbl_contacts SET ?', req.body, (err, result) => {
        if (err) {
            throw err;
        }
        res.redirect('/contacts');
    })
});

router.post('/login', function (req, res) {
    db.query('SELECT * FROM tbl_accounts WHERE acc_login = ' + mysql.escape(req.body.login), function (err, result) {
        if (err) {
            throw err;
        }

        if (result.length >= 1) {
            // Check password
            if (bcrypt.compareSync(req.body.password, result[0].acc_password)) {
                req.session.user = req.body.login;
                res.json({ status: 'success' });
            }
            else {
                res.json({ status: 'fail' });
            }

        }
    });
});

router.get('/logout', function (req, res) {
    req.session.user = undefined;
    res.redirect('/login');
});

module.exports = router;