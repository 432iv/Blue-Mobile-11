const AppError = require('../utils/AppError');

/**
 * Zod validation middleware factory.
 *
 *   router.post('/login', validate({ body: loginSchema }), handler)
 *   router.get('/products', validate({ query: listProductsQuery }), handler)
 *
 * Parsed values replace req.body / req.query / req.params, so
 * controllers only ever see validated, coerced data.
 */
function validate(schemas = {}) {
  return (req, res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      next();
    } catch (err) {
      if (err && err.name === 'ZodError') {
        next(
          new AppError(
            400,
            'Validation failed.',
            'VALIDATION_ERROR',
            err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }))
          )
        );
      } else {
        next(err);
      }
    }
  };
}

module.exports = validate;
