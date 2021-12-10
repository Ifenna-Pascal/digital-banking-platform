const router = require('express').Router();
const { body, check } = require('express-validator');
const { login } = require('../controller/user');

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

module.exports = router;
