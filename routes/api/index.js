const router = require('express').Router();

router.use('/users', require('./users'));
router.use('/sql', require('./sql'));

module.exports = router;
