const User = require('../model/user');
const jwt = require('jsonwebtoken');
module.exports = () => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization;
            if (!token) return res.status(400).json({ msg: 'Token not found' });
            const decoded = jwt.decode(token);

            const user = await User.findById(decoded.user_id);
            if (!user) res.status(401).json({ msg: 'Unauthorized user' });

            req.USER_ID = user._id;

            next();
        } catch (error) {
            next(error);
        }
    };
};
