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

exports.getUser = (username, password) => submitQuery(`SELECT UserID as username, Password as password, EmailAddress as email FROM cieTrade_Sys.dbo.users WHERE UserID = '${username}' AND Password = '${password}'`);
