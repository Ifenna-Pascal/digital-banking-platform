const router = require('express').Router();
const { param } = require('express-validator');
const c = require('../controller/transaction');
const auth = require('../middlewares/auth');
const transaction = require('../middlewares/transaction');
const { transaction_limiter } = require('../middlewares/rate_limits');
const v = require('../middlewares/validate');

// validation runs before the PIN check, so bad input never costs a PIN attempt
router.post(
    '/deposit',
    transaction_limiter,
    auth(),
    v.amount(),
    v.pin(),
    v.narration(false),
    v.validate,
    transaction(),
    c.deposit,
);

router.post(
    '/withdrawal',
    transaction_limiter,
    auth(),
    v.amount(),
    v.pin(),
    v.narration(false),
    v.validate,
    transaction(),
    c.withdrawal,
);

router.post(
    '/transfer',
    transaction_limiter,
    auth(),
    v.amount(),
    v.pin(),
    v.account_number(),
    v.narration(true),
    v.validate,
    transaction(),
    c.transfer,
);

// name check before sending money: "you are sending to Jane Doe"
router.get('/lookup/:account_number', auth(), v.account_number(param), v.validate, c.lookup);

module.exports = router;
