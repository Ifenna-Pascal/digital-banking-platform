const user_repository_instance = require('../Database/Repository/userRepo');
const jwt = require('jsonwebtoken');
module.exports = () => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(400).json({ msg: 'Token not found' });
            const decoded = jwt.decode(token);

            const user = await user_repository_instance.find_user_by_id(decoded.user_id);
            if (!user) res.status(401).json({ msg: 'Unauthorized user not yet registered by admin' });
            req.USER_ID = user._id;
            next();
        } catch (error) {
            next(error);
        }
    };
};
