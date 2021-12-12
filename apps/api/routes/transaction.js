const router = require('express').Router();
const { body, check } = require('express-validator');
const { deposit, withdrawal, transfer } = require('../controller/transaction');
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

router.post(
    '/transfer',
    check('amount').not().isEmpty().withMessage('Amount is required'),
    check('account_number').not().isEmpty().withMessage('Account Number is required'),
    check('narration').not().isEmpty().withMessage('Narration is required'),
    auth(),
    transaction(),
    transfer,
);
module.exports = router;
