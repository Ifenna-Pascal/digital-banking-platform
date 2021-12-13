const router = require('express').Router();
const { body, check } = require('express-validator');
const {
    login,
    setPin,
    setPassword,
    get_user_details,
    view_transactions,
    update_profile,
} = require('../controller/user');
const auth = require('../middlewares/auth');

router.post(
    '/signin',
    body('email')
        .not()
        .isEmpty()
        .withMessage('email feild is required')
        .isEmail()
        .withMessage('Email format should be propeerly inputed eg:>> johndoe@gmail.com')
        .normalizeEmail(),
    check('password').not().isEmpty().withMessage('password is required'),
    login,
);

router.get('/user_details', auth(), get_user_details);

router.put(
    '/update_password',
    body('email')
        .not()
        .isEmpty()
        .withMessage('email feild is required')
        .isEmail()
        .withMessage('Email format should be propeerly inputed eg:>> johndoe@gmail.com')
        .normalizeEmail(),
    check('password')
        .not()
        .isEmpty()
        .withMessage('password is required')
        .isLength({ min: 6, max: 6 })
        .withMessage('Password should be 6 characters'),
    setPassword,
);

router.put('update_profile', auth(), update_profile);

router.post(
    '/setpin',
    body('pin')
        .not()
        .isEmpty()
        .withMessage('transaction pin is required')
        .isLength({ min: 4, max: 4 })
        .withMessage('pin should be 4 letter'),
    auth(),
    setPin,
);

router.get('/transactions', auth(), view_transactions);

module.exports = router;
