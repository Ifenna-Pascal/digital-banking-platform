const { validationResult, body, param, query } = require('express-validator');

// Ends the request with 400 and the list of problems if any validator failed.
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ msg: errors.array()[0].msg, errors: errors.array() });
    next();
};

const email = (field = 'email') =>
    body(field)
        .trim()
        .notEmpty()
        .withMessage('email field is required')
        .bail()
        .isEmail()
        .withMessage('Enter a valid email, e.g. johndoe@gmail.com')
        .normalizeEmail({ gmail_remove_dots: false });

const password = (field = 'password') =>
    body(field)
        .isString()
        .withMessage('password is required')
        .bail()
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be at least 8 characters');

// positive, at most 2 decimal places, capped to stop absurd values
const amount = () =>
    body('amount')
        .exists({ values: 'falsy' })
        .withMessage('Amount is required')
        .bail()
        .isFloat({ gt: 0, max: 100000000 })
        .withMessage('Amount must be a number greater than 0')
        .bail()
        .custom((v) => /^\d+(\.\d{1,2})?$/.test(String(v).trim()))
        .withMessage('Amount can have at most 2 decimal places')
        .toFloat();

const pin = (field = 'pin') =>
    body(field)
        .exists({ values: 'falsy' })
        .withMessage('transaction pin is required')
        .bail()
        .custom((v) => /^\d{4}$/.test(String(v)))
        .withMessage('pin must be exactly 4 digits');

const account_number = (location = body) =>
    location('account_number')
        .custom((v) => /^\d{10}$/.test(String(v)))
        .withMessage('Account number must be 10 digits');

// Text is stored as typed (no HTML escaping); clients escape on display, which React does.
const narration = (required) =>
    (required
        ? body('narration')
              .isString()
              .withMessage('Narration is required')
              .bail()
              .trim()
              .notEmpty()
              .withMessage('Narration is required')
        : body('narration').optional({ values: 'falsy' }).isString().trim()
    )
        .isLength({ max: 140 })
        .withMessage('Narration can be at most 140 characters');

const mongo_id = (name = 'id') => param(name).isMongoId().withMessage('Invalid id');

const pagination = [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

const name = (field) =>
    body(field)
        .isString()
        .withMessage(`${field} is required`)
        .bail()
        .trim()
        .notEmpty()
        .withMessage(`${field} is required`)
        .isLength({ max: 60 })
        .withMessage(`${field} can be at most 60 characters`);

module.exports = {
    validate,
    email,
    password,
    amount,
    pin,
    account_number,
    narration,
    mongo_id,
    pagination,
    name,
    body,
};
