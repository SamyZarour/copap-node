// Load env variables from .env
require('dotenv').config();

// Get Current Env
const env = process.env.NODE_ENV;

// Dev Configs
const dev = {
    port: process.env.DEV_PORT || '3000',
    db: {
        url: process.env.DEV_DB_URL || 'mongodb://admin:db8G4s23@ds113765.mlab.com:13765/copap-prod'
    },
    secret: process.env.DEV_SECRET || 'secret'
};

// Test Configs
const test = {
    port: process.env.TEST_PORT || '3001',
    db: {
        url: process.env.TEST_DB_URL || 'mongodb://localhost/auth-test'
    },
    secret: process.env.TEST_SECRET || 'secret'
};

// Prod Configs
const production = {
    port: process.env.PORT,
    db: {
        url: process.env.DB_URL
    },
    secret: process.env.SECRET
};

// Core configs
const config = {
    dev,
    test,
    production
};

// Return env specific configs
module.exports = config[env];
