const router = require('express').Router();
const { body, check } = require('express-validator');
const { deposit, withdrawal } = require('../controller/transaction');
const auth = require('../middlewares/auth');
const transaction = require('../middlewares/transaction');

router.post(
    '/deposit',
    check('amount').not().isEmpty().withMessage('Amount is required'),
    auth(),
    transaction(),
    deposit,
);

router.post(
    '/withdrawal',
    check('amount').not().isEmpty().withMessage('Amount is required'),
    auth(),
    transaction(),
    withdrawal,
);
module.exports = router;
