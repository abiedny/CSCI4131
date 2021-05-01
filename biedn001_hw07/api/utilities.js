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

router.get('/user', (req, res) => {
    res.json({ user: req.session.user });
})

router.post('/addContact', (req, res) => {
    // Insert form data into db
    db.query('INSERT tbl_contacts SET ?', req.body, (err, result) => {
        if (err) {
            throw err;
        }
        res.redirect('/contacts');
    });
});

router.post('/updateContact', (req, res) => {
    // Update the contact matching name with the object
    db.query(`UPDATE tbl_contacts SET ? WHERE name = '${req.body.name}'`, req.body, (err, result) => {
        if (err) {
            throw err;
        }

        res.json({ status: 'success' });
    });
});

router.post('/newContact', (req, res) => {
    // Check the name fusdafnsopdfignsdflasbn0
    db.query(`SELECT * FROM tbl_contacts WHERE name = '${req.body.name}'`, (err, result) => {
        if (err) {
            throw err;
        }

        if (result.length === 0) {
            // Update the contact matching name with the object
            db.query(`INSERT tbl_contacts SET ?`, req.body, (err, result) => {
                if (err) {
                    throw err;
                }

                res.json({ status: 'success' });
            });
        }
        else {
            res.json({ status: 'fail' });
        }
    });

});

router.post('/deleteContact', (req, res) => {
    // Update the contact matching name with the object
    db.query(`DELETE FROM tbl_contacts WHERE name='${req.body.name}'`, (err, result) => {
        if (err) {
            throw err;
        }

        res.json({ status: 'success' });
    });
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