const axios = require('axios'),
    config = require('../config');

/* GET home page. */
const submitQuery = query => axios.post(`${config.db.copap}/sql`, { query });

exports.getUser = (username, password) => submitQuery(`SELECT UserID as username, Password as password, EmailAddress as email FROM cieTrade_Sys.dbo.users WHERE UserID = '${username}' AND Password = '${password}'`);
