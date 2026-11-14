const user_service = require('../services/user_service');
const wrap = require('../utility/wrap');

// Input is validated in routes/user.js; services throw AppError for the
// error handler in app.js to turn into the right status code.
const user_controller = {};

user_controller.login = wrap(async (req, res) => {
    const user_data = await user_service.user_login(req.body);
    res.status(200).json({ msg: 'user logged in', data: user_data });
});

user_controller.setup_password = wrap(async (req, res) => {
    await user_service.setup_password(req.body);
    res.status(200).json({ msg: 'Password set. You can now log in.' });
});

user_controller.change_password = wrap(async (req, res) => {
    await user_service.change_password(req.USER_ID, req.body);
    res.status(200).json({ msg: 'Password changed' });
});

user_controller.setPin = wrap(async (req, res) => {
    await user_service.update_pin(req.USER_ID, req.body);
    res.status(200).json({ msg: 'Your transaction PIN has been set successfully' });
});

user_controller.update_profile = wrap(async (req, res) => {
    const updated_profile = await user_service.update_profile(req.USER_ID, req.body);
    res.status(200).json({ msg: 'Profile updated', data: updated_profile });
});

user_controller.view_transactions = wrap(async (req, res) => {
    const { items, pagination } = await user_service.view_all_user_transactions(req.USER_ID, {
        page: req.query.page || 1,
        limit: req.query.limit || 20,
        type: req.query.type,
    });
    res.status(200).json({ msg: 'All your transactions', user_transactions: items, pagination });
});

user_controller.get_user_details = wrap(async (req, res) => {
    const user_details = await user_service.get_user_details(req.USER_ID);
    res.status(200).json({ msg: 'user_details', user_profile_details: user_details });
});

user_controller.summary = wrap(async (req, res) => {
    const summary = await user_service.get_summary(req.USER_ID);
    res.status(200).json({ msg: 'summary', summary });
});

module.exports = user_controller;
