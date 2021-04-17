const express = require('express');
const db = require('./db');
const router = express.Router();

router.get('/contacts', function (req, res) {
    //Return contacts.json like last time to make it ez
    db.connect(function (err) {
        if (err) {
            throw err;
        }
        db.query('SELECT * FROM tbl_contacts', function (err, result) {
            if (err) {
                throw err;
            }

            res.json(result);
        });

        db.end();
    });
});

router.post('/login', function (req, res) {
    console.log("Login API");

    db.connect(function (err) {
        if (err) {
            throw err;
        }
        db.query('SELECT * FROM tbl_accounts WHERE acc_login = ? AND acc_password = ?', req.body.login, bcrypt.hashSync(req.body.password, 10), function (err, result) {
            if (err) {
                throw err;
            }

            if (result.length >= 1) {
                req.session.user = req.body.login;
                res.json({ status: 'success' });
            }
            else {
                res.json({ status: 'fail' });
            }
        });

        db.end();
    });
});

router.get('/logout', function (req, res) {
    delete req.session;
    res.sendFile(path.join(__dirname, 'public/welcome.html'));
});

// TODO: Add implementation for other necessary end-points

module.exports = router;