exports.mapFieldsToMessage = (fields, message) => {
    let err = { errors: {} };
    fields.forEach(tag => { err.errors[tag] = { message }; });
    err.message = `${fields.join(', ')} : ${message}`;
    return err;
};

exports.createError = (name, message) => {
    let error = new Error(JSON.stringify(message));
    error.name = name;
    return error;
};

module.exports = {
    internalError: {
        status: 500,
        getError: () => this.createError('InternalError', this.mapFieldsToMessage(['internal'], 'undefined error'))
    },
    authenticationError: {
        status: 401,
        getError: () => this.createError('CustomAuthenticationError', this.mapFieldsToMessage(['authentication'], 'not authenticated'))
    },
    authorizationError: {
        status: 403,
        getError: () => this.createError('CustomAuthorizationError', this.mapFieldsToMessage(['authorization'], 'not authorized'))
    },
    notFoundError: {
        status: 404,
        getError: fields => this.createError('NotFoundError', this.mapFieldsToMessage(fields, 'not found'))
    },
    requiredFieldError: {
        status: 422,
        getError: fields => this.createError('RequiredFieldError', this.mapFieldsToMessage(fields, 'can not be blank'))
    },
    validationError: {
        status: 422,
        getError: fields => this.createError('CustomValidationError', this.mapFieldsToMessage(fields, 'not valid'))
    },
    duplicateError: {
        status: 422,
        getError: fields => this.createError('DuplicateError', this.mapFieldsToMessage(fields, 'is already taken'))
    }
};
