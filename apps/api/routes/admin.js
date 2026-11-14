const router = require('express').Router();
const { param } = require('express-validator');
const c = require('../controller/admin');
const admin = require('../middlewares/admin');
const auth = require('../middlewares/auth');
const v = require('../middlewares/validate');

// every admin route needs a logged-in, active admin
router.use(auth(), admin());

router.post(
    '/create_user',
    v.email(),
    v.name('first_name'),
    v.name('last_name'),
    v.body('role').optional().isIn(['user', 'admin']).withMessage('role must be user or admin'),
    v.validate,
    c.create_user,
);

router.get('/users', ...v.pagination, v.validate, c.list_users);
router.get('/transactions', ...v.pagination, v.validate, c.list_transactions);

router.post('/resend_setup/:id', v.mongo_id(), v.validate, c.resend_setup);
router.delete('/delete_user/:id', v.mongo_id(), v.validate, c.delete_user);
router.put('/disable_user/:id', v.mongo_id(), v.validate, c.disable_user);
router.put('/enable_user/:id', v.mongo_id(), v.validate, c.enable_user);

// :id is the transaction_id shown on the transaction (12 characters)
router.put(
    '/reverse_transaction/:id',
    param('id').isAlphanumeric().isLength({ min: 12, max: 12 }).withMessage('Invalid transaction id'),
    v.validate,
    c.reversed_transaction,
);

module.exports = router;
