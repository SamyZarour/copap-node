const express = require('express'),
    router = express.Router(),
    errorFactory = require('../factories/errorFactory'),
    swaggerUi = require('swagger-ui-express'),
    YAML = require('yamljs'),
    swaggerDocument = YAML.load('routes/swagger.yaml');

router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
router.use('/api', require('./api'));

router.use((err, req, res, next) => {
    if(err.name === 'ValidationError') { return res.status(errorFactory.validationError.status).json(err); }
    else if(err.name === 'CustomValidationError') { return res.status(errorFactory.validationError.status).json(JSON.parse(err.message)); }
    else if(err.name === 'RequiredFieldError') { return res.status(errorFactory.requiredFieldError.status).json(JSON.parse(err.message)); }
    else if(err.name === 'DuplicateError') { return res.status(errorFactory.duplicateError.status).json(JSON.parse(err.message)); }
    else if(err.name === 'NotFoundError') { return res.status(errorFactory.notFoundError.status).json(JSON.parse(err.message)); }
    else if(err.name === 'UnauthorizedError') { return res.status(errorFactory.authenticationError.status).json({ errors: { authorization: { message: err.message } } }); }
    else if(err.name === 'AuthenticationError') { return res.status(errorFactory.authenticationError.status).json({ errors: { authentication: { message: err.message } } }); }
    else if(err.name === 'CustomAuthenticationError') { return res.status(errorFactory.authenticationError.status).json(JSON.parse(err.message)); }
    else if(err.name === 'CustomAuthorizationError') { return res.status(errorFactory.authorizationError.status).json(JSON.parse(err.message)); }
    return next(err);
});

module.exports = router;
