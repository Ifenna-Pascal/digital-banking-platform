const router = require('express').Router();
const { body, check } = require('express-validator');
const { login, setPin } = require('../controller/user');
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

router.post(
    '/setpin',
    body('pin')
        .not()
        .isEmpty()
        .withMessage('transaction pin is required')
        .isLength({ min: 4 })
        .withMessage('pin should be 4 letter'),
    auth(),
    setPin,
);

module.exports = router;
