const router = require('express').Router();
const { query } = require('express-validator');
const c = require('../controller/user');
const auth = require('../middlewares/auth');
const { auth_limiter } = require('../middlewares/rate_limits');
const v = require('../middlewares/validate');

router.post(
    '/signin',
    auth_limiter,
    v.email(),
    v.body('password').notEmpty().withMessage('password is required'),
    v.validate,
    c.login,
);

// first password, with the one-time setup code an admin issued
router.post(
    '/setup_password',
    auth_limiter,
    v.email(),
    v.body('setup_token').isString().trim().notEmpty().withMessage('setup_token is required'),
    v.password(),
    v.validate,
    c.setup_password,
);

router.put(
    '/change_password',
    auth_limiter,
    auth(),
    v.body('current_password').notEmpty().withMessage('current_password is required'),
    v.password('new_password'),
    v.validate,
    c.change_password,
);

router.get('/user_details', auth(), c.get_user_details);

router.put(
    '/update_profile',
    auth(),
    v.name('first_name').optional(),
    v.name('last_name').optional(),
    v.email().optional(),
    v.validate,
    c.update_profile,
);

router.post('/setpin', auth_limiter, auth(), v.pin(), v.validate, c.setPin);

router.get(
    '/transactions',
    auth(),
    ...v.pagination,
    query('type')
        .optional()
        .isIn(['transfer', 'deposit', 'withdrawal', 'reversal'])
        .withMessage('type must be transfer, deposit, withdrawal or reversal'),
    v.validate,
    c.view_transactions,
);

router.get('/summary', auth(), c.summary);

module.exports = router;
