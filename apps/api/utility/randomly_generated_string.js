const salt_string = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`;
const salt_number = `0123456789`;
const randomly_generated_password = () => {
    let password = '';
    for (var i = 0; i < 6; i++) {
        const generator = Math.floor(Math.random() * salt_string.length);
        password += salt_string[generator];
    }
    return password;
};

const randomly_generated_account_number = () => {
    let account_number = '';
    for (var i = 0; i < 10; i++) {
        const generator = Math.floor(Math.random() * salt_number.length);
        account_number += salt_number[generator];
    }
    return account_number;
};

const randomly_generated_transaction_id = () => {
    let transaction_id = '';
    for (var i = 0; i < 12; i++) {
        const generator = Math.floor(Math.random() * salt_string.length);
        transaction_id += salt_string[generator];
    }
    return transaction_id;
};

module.exports = {
    randomly_generated_account_number,
    randomly_generated_transaction_id,
    randomly_generated_password,
};
