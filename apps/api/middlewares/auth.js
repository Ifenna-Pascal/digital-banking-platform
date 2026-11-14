const jwt = require('jsonwebtoken');
const user_repository_instance = require('../Database/Repository/userRepo');

// Accepts "Authorization: Bearer <token>" (or the bare token, for older clients).
// jwt.verify checks the signature and expiry; jwt.decode would accept forged tokens.
module.exports = () => {
    return async (req, res, next) => {
        try {
            const header = req.headers.authorization || '';
            const token = header.startsWith('Bearer ') ? header.slice(7) : header;
            if (!token) return res.status(401).json({ msg: 'Login required' });

            let decoded;
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET);
            } catch (_error) {
                return res.status(401).json({ msg: 'Your session is invalid or has expired, please log in again' });
            }

            const user = await user_repository_instance.find_user_by_id(decoded.user_id);
            if (!user) return res.status(401).json({ msg: 'Account no longer exists' });

            req.USER_ID = user._id;
            req.USER = user;
            next();
        } catch (error) {
            next(error);
        }
    };
};
