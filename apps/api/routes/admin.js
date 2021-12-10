const router = require('express').Router();
const { body, check } = require('express-validator');
const { create_user } = require('../controller/admin');

router.post(
    '/create_user',
    body('email')
        .not()
        .isEmpty()
        .withMessage('email feild is required')
        .isEmail()
        .withMessage('Email format should be propeerly inputed eg:>> johndoe@gmail.com')
        .normalizeEmail(),
    check('first_name').not().isEmpty().withMessage('First name is required').trim().escape(),
    check('last_name').not().isEmpty().withMessage('Last name is required').trim().escape(),
    create_user,
);

module.exports = router;
