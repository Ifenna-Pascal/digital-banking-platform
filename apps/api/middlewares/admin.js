const auth = require('./auth');
const user_repository_instance = require('../Database/Repository/userRepo');

module.exports = () => {
    return async (req, res, next) => {
        try {
            console.log('rll');
            const user = await user_repository_instance.find_user_by_id(req.USER_ID);
            const role = user.role;
            console.log(role);
            if (role === 'admin') next();
            else {
                res.status(401).json({ msg: 'Unauthorized user only for the Admin' });
            }
        } catch (error) {
            next(error);
        }
    };
};
