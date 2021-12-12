const {create_user, delete_user, enable_user, disable_user} = require('../services/admin_service');
const { validationResult } = require('express-validator');
const admin_controller = {};

admin_controller.create_user = async (req, res) => {
    const data = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const new_user = await create_user(data);
        res.status(200).json({ msg: 'new user is created', data: new_user });
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: "user wasn't created", error: error.message });
    }
};

admin_controller.delete_user = async (req,res) => {
    const id = req.params.id;
    try {
        const deleted_user = await delete_user(id);
        res.status(200).json({ msg: 'user is deleted', data: deleted_user });
    } catch (error) {
        res.status(400).send({ message: "user wasn't delted", error: error.message });
    }
}

admin_controller.enable_user = async (req,res) => {
    const id = req.params.id;
    try {
        const enable_user = await enable_user(id);
        res.status(200).json({ msg: 'user account isenabled', data: enable_user});
    } catch (error) {
        res.status(400).send({ message: "user wasn't enabled", error: error.message });
    }
}

admin_controller.disable_user = async (req,res) => {
    const id = req.params.id;
    try {
        const disabled_user = await disable_user(id);
        res.status(200).json({ msg: 'user account is disabled', data: disabled_user});
    } catch (error) {
        res.status(400).send({ message: "user wasn't disabled", error: error.message });
    }
}

module.exports = admin_controller;
