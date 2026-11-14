const bcrypt = require('bcrypt');
const Hash = require('../utility/bycrpt_hashing');
const {
    randomly_generated_account_number,
    randomly_generated_transaction_id,
    randomly_generated_setup_token,
} = require('../utility/randomly_generated_string');
const { to_money } = require('../utility/money');

describe('utility functions', () => {
    test('Hash returns a bcrypt hash that verifies', async () => {
        const hashed = await Hash('hash_test');
        expect(hashed).not.toBe('hash_test');
        expect(await bcrypt.compare('hash_test', hashed)).toBe(true);
    });

    test('account numbers are exactly 10 digits', () => {
        for (let i = 0; i < 50; i++) expect(randomly_generated_account_number()).toMatch(/^\d{10}$/);
    });

    test('transaction ids are exactly 12 alphanumeric characters', () => {
        for (let i = 0; i < 50; i++) expect(randomly_generated_transaction_id()).toMatch(/^[A-Za-z0-9]{12}$/);
    });

    test('setup codes are 8 unambiguous characters', () => {
        for (let i = 0; i < 50; i++) expect(randomly_generated_setup_token()).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
    });

    test('to_money rounds to 2 decimal places', () => {
        expect(to_money(0.1 + 0.2)).toBe(0.3);
        expect(to_money('100.505')).toBe(100.51);
        expect(to_money(5)).toBe(5);
    });
});
