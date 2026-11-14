const {
    check_user_isActive,
    check_user_transactionPin_iscreated,
    check_if_userPin_equals_insertedPin,
} = require('../services/transaction_service');

// Runs before any money moves: account must be active, PIN set, and PIN correct.
module.exports = () => {
    return async (req, res, next) => {
        try {
            const isActive = await check_user_isActive(req.USER_ID);
            if (!isActive)
                return res.status(403).json({
                    msg: "Sorry your account has been disabled by admin, you can't perform this transaction",
                });
            const pin_iscreated = await check_user_transactionPin_iscreated(req.USER_ID);
            if (!pin_iscreated)
                return res.status(400).json({
                    msg: 'You have not created your transaction PIN yet. Create it at /user/setpin',
                });
            const pin_equality = await check_if_userPin_equals_insertedPin(req.body.pin, req.USER_ID);
            if (!pin_equality) return res.status(400).json({ msg: 'Transaction pin does not match' });
            next();
        } catch (error) {
            next(error);
        }
    };
};
