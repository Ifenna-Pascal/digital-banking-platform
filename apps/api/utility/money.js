// Balances are stored as Numbers with 2 decimal places. Round after every
// arithmetic step so floating point drift (0.1 + 0.2) never reaches the DB.
const to_money = (value) => Math.round(Number(value) * 100) / 100;

module.exports = { to_money };
