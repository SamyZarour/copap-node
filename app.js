const errorhandler = require('errorhandler'),
    express = require('express'),
    logger = require('morgan'),
    mongoose = require('mongoose');

const env = process.env.NODE_ENV;
const config = require('./config');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Allow front end platform to access this website
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin, Authorization, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Accept');
    next();
});

// Connect to database
if(env !== 'test') { app.use(logger('dev')); }
if(env !== 'production') {
    app.use(errorhandler());
    mongoose.set('debug', true);
}
mongoose.connect(config.db.url);

// Attach mongoose models
require('./models');

// Attach passport protocol
require('./auth');

// Attach routes
const routes = require('./routes');
app.use(routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use((err, req, res) => {
    res.status(err.status || 500);
    res.json( {
        message: err.message,
        error: env === 'development' ? err : {}
    });
});

module.exports = app;
