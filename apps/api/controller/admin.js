const admin_service = require('../services/admin_service');
const { validationResult } = require('express-validator');
const {
    randomly_generated_password,
    randomly_generated_account_number,
} = require('../utility/randomly_generated_string');
const admin_controller = {};

admin_controller.create_user = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const data = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        password: randomly_generated_password(),
        email: req.body.email,
        account_details: {
            account_number: randomly_generated_account_number(),
        },
    };
    try {
        const new_user = await admin_service.create_user(data);
        res.status(200).json({ msg: 'new user is created', data: new_user });
    } catch (e) {
        console.log(e);
        res.status(400).send({ message: "user wasn't created", e });
    }
};

module.exports = admin_controller;
