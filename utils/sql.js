const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'Sa*1150305',
    server: '207.134.66.180', // You can use 'localhost\\instance' to connect to named instance
    database: 'cietrade'
};

sql.connect(config, err => { if(err) { console.log(err); } });

/* GET home page. */
const submitQuery = exports.submitQuery = query => new Promise((resolve, reject) => new sql.Request().query(query || '', (err, result) => { return err ? reject(err) : resolve(result); }));

exports.getUser = username => submitQuery(`SELECT ReferrerNo as username FROM Referrer WHERE ReferrerNo = '${username}'`);
