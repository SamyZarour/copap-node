const router = require('express').Router(),
    { submitQuery } = require('../../utils/sql');

/* GET home page. */
router.post('/', function(req, res, next) {
    const query = req.body && req.body.query;
    submitQuery(query)
        .then(result => res.json(result))
        .catch(next);
});

module.exports = router;
