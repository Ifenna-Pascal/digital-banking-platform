// Must run after auth(), which loads the user onto req.USER.
module.exports = () => {
    return (req, res, next) => {
        if (req.USER && req.USER.role === 'admin' && req.USER.isActive) return next();
        return res.status(403).json({ msg: 'Only admins can do this' });
    };
};
