const Hash = require('../utility/bycrpt_hashing');
const { randomly_generated_account_number, randomly_generated_transaction_id } = require('../utility/randomly_generated_string');
// Running test for the Bcrypt Hashing Function
describe('All Utitlity Funtion Test', () => {
    test('should return a hashed result', async () => {
        let hashed = await Hash('hash_test');
        expect(hashed).toMatch(/\.*/);
    });

    test('should return a 10 digits account number', () => {
        let account_number = randomly_generated_account_number();
        expect(account_number).toMatch(/^\d{10}/);
    });

    test('should return a 12 digit transaction_id', () => {
        let transaction_id = randomly_generated_transaction_id();
        expect(transaction_id).toMatch(/^.{12}/);
    })
});
