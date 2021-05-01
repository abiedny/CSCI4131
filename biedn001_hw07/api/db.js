const mysql = require("mysql");
const xml2js = require('xml2js');
var fs = require("fs");

function makeDB() {
    const parser = new xml2js.Parser();

    var data = fs.readFileSync(__dirname + '/dbconfig.xml', { encoding: 'utf8', flag: 'r' });

    var result;
    parser.parseString(data, (err, thedata) => {
        result = thedata;
    })

    const db = mysql.createConnection({
        host: result.dbconfig.host[0],
        user: result.dbconfig.user[0],
        password: result.dbconfig.password[0],
        database: result.dbconfig.database[0],
        port: result.dbconfig.port[0],
    });

    return db;
}
module.exports = makeDB();