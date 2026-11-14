const admin_service = require('../services/admin_service');
const wrap = require('../utility/wrap');

const admin_controller = {};

admin_controller.create_user = wrap(async (req, res) => {
    const { user, setup_token, setup_token_expires } = await admin_service.create_user(req.body);
    res.status(201).json({
        msg: 'new user is created. Give them the setup code so they can choose a password.',
        data: user,
        setup_token,
        setup_token_expires,
    });
});

admin_controller.resend_setup = wrap(async (req, res) => {
    const setup = await admin_service.resend_setup(req.params.id);
    res.status(200).json({ msg: 'new setup code issued', ...setup });
});

admin_controller.list_users = wrap(async (req, res) => {
    const { items, pagination } = await admin_service.list_users(req.query.page || 1, req.query.limit || 20);
    res.status(200).json({ msg: 'users', users: items, pagination });
});

admin_controller.list_transactions = wrap(async (req, res) => {
    const { items, pagination } = await admin_service.list_transactions(req.query.page || 1, req.query.limit || 20);
    res.status(200).json({ msg: 'transactions', transactions: items, pagination });
});

admin_controller.delete_user = wrap(async (req, res) => {
    const deleted = await admin_service.delete_user(req.params.id, req.USER_ID);
    res.status(200).json({ msg: 'user is deleted', data: deleted });
});

admin_controller.enable_user = wrap(async (req, res) => {
    const user = await admin_service.set_active(req.params.id, true, req.USER_ID);
    res.status(200).json({ msg: 'user account is enabled', data: user });
});

admin_controller.disable_user = wrap(async (req, res) => {
    const user = await admin_service.set_active(req.params.id, false, req.USER_ID);
    res.status(200).json({ msg: 'user account is disabled', data: user });
});

admin_controller.reversed_transaction = wrap(async (req, res) => {
    const result = await admin_service.reverse_transaction(req.params.id);
    res.status(200).json({ msg: 'transaction reversed', data: result });
});

module.exports = admin_controller;
