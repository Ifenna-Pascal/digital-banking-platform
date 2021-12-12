const router = require('express').Router();
const { body, check } = require('express-validator');
const { create_user, delete_user, disable_user, enable_user } = require('../controller/admin');
const admin = require('../middlewares/admin');
const auth = require('../middlewares/auth');

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
    auth(),
    admin(),
    create_user,
);

router.delete('/delete_user/:id', auth(), admin(), delete_user );

router.put('/disable_user/:id', auth(), admin(), disable_user );

router.put('/enable_user/:id', auth(), admin(), enable_user );

module.exports = router;
