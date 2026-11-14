const h = require('./helpers/setup');
const User = require('../Database/model/user');
const Transaction = require('../Database/model/transaction');

beforeAll(h.start);
afterAll(h.stop);
afterEach(h.reset);

let admin;
beforeEach(async () => {
    admin = await h.create_admin();
});

const deposit = (u, body) =>
    h
        .api()
        .post('/transaction/deposit')
        .set(h.bearer(u.token))
        .send({ pin: u.pin, ...body });
const withdraw = (u, body) =>
    h
        .api()
        .post('/transaction/withdrawal')
        .set(h.bearer(u.token))
        .send({ pin: u.pin, ...body });
const transfer = (u, body) =>
    h
        .api()
        .post('/transaction/transfer')
        .set(h.bearer(u.token))
        .send({ pin: u.pin, narration: 'rent', ...body });

describe('deposit', () => {
    test('adds to the balance and records the entry', async () => {
        const u = await h.create_customer(admin);
        const res = await deposit(u, { amount: 250.75 }).expect(200);
        expect(res.body.details.account_balance).toBe(250.75);
        expect(res.body.details.transaction).toMatchObject({
            transaction_type: 'deposit',
            direction: 'credit',
            previous_balance: 0,
            current_balance: 250.75,
        });
    });

    test('string amounts are added as numbers, not glued together as text', async () => {
        const u = await h.create_customer(admin, { deposit: 50 });
        await deposit(u, { amount: '100' }).expect(200);
        expect(await h.balance_of(u.id)).toBe(150);
    });

    test('the account number survives a balance change (was wiped by $set)', async () => {
        const u = await h.create_customer(admin);
        await deposit(u, { amount: 10 }).expect(200);
        const doc = await User.findById(u.id);
        expect(doc.account_details.account_number).toBe(u.account_number);
    });

    test.each([[-100], [0], ['abc'], [1.234], [undefined]])('rejects bad amount %p', async (amount) => {
        const u = await h.create_customer(admin);
        await deposit(u, { amount }).expect(400);
        expect(await h.balance_of(u.id)).toBe(0);
    });

    test('decimal amounts do not drift (0.1 + 0.2)', async () => {
        const u = await h.create_customer(admin);
        await deposit(u, { amount: 0.1 }).expect(200);
        await deposit(u, { amount: 0.2 }).expect(200);
        expect(await h.balance_of(u.id)).toBe(0.3);
    });

    test('missing PIN is a 400, not a crash', async () => {
        const u = await h.create_customer(admin);
        await h.api().post('/transaction/deposit').set(h.bearer(u.token)).send({ amount: 10 }).expect(400);
    });

    test('wrong PIN is rejected', async () => {
        const u = await h.create_customer(admin);
        const res = await deposit(u, { amount: 10, pin: '0000' }).expect(400);
        expect(res.body.msg).toMatch(/pin does not match/i);
    });

    test('no PIN set yet tells the user to create one', async () => {
        const u = await h.create_customer(admin, { pin: null });
        const res = await h.api().post('/transaction/deposit').set(h.bearer(u.token)).send({ amount: 10, pin: '1234' });
        expect(res.status).toBe(400);
        expect(res.body.msg).toMatch(/setpin/);
    });
});

describe('withdrawal', () => {
    test('takes money out', async () => {
        const u = await h.create_customer(admin, { deposit: 100 });
        const res = await withdraw(u, { amount: 40 }).expect(200);
        expect(res.body.details.account_balance).toBe(60);
        expect(res.body.details.transaction.previous_balance).toBe(100);
    });

    test('cannot overdraw', async () => {
        const u = await h.create_customer(admin, { deposit: 100 });
        await withdraw(u, { amount: 100.01 }).expect(400);
        expect(await h.balance_of(u.id)).toBe(100);
    });

    test('a negative withdrawal cannot add money', async () => {
        const u = await h.create_customer(admin, { deposit: 10 });
        await withdraw(u, { amount: -1000 }).expect(400);
        expect(await h.balance_of(u.id)).toBe(10);
    });
});

describe('transfer', () => {
    test('moves money and records both sides (was always "beneficiary does not exist")', async () => {
        const a = await h.create_customer(admin, { deposit: 500 });
        const b = await h.create_customer(admin, { first_name: 'Bola' });
        const res = await transfer(a, { amount: 120, account_number: b.account_number }).expect(200);

        expect(res.body.details.account_balance).toBe(380);
        expect(res.body.details.beneficiary.name).toBe('Bola Doe');
        expect(await h.balance_of(a.id)).toBe(380);
        expect(await h.balance_of(b.id)).toBe(120);

        const bHistory = await h.api().get('/user/transactions').set(h.bearer(b.token)).expect(200);
        expect(bHistory.body.user_transactions).toHaveLength(1);
        expect(bHistory.body.user_transactions[0]).toMatchObject({ direction: 'credit', amount_transacted: 120 });
        expect(bHistory.body.user_transactions[0].from.first_name).toBe('Jane');
        // populated parties must not leak secrets
        expect(bHistory.body.user_transactions[0].from.password).toBeUndefined();
    });

    test('cannot transfer to your own account (ObjectId === check never matched)', async () => {
        const a = await h.create_customer(admin, { deposit: 100 });
        await transfer(a, { amount: 10, account_number: a.account_number }).expect(400);
        expect(await h.balance_of(a.id)).toBe(100);
    });

    test('unknown account number is a 404', async () => {
        const a = await h.create_customer(admin, { deposit: 100 });
        await transfer(a, { amount: 10, account_number: '0000000000' }).expect(404);
    });

    test('insufficient funds leave both balances unchanged', async () => {
        const a = await h.create_customer(admin, { deposit: 50 });
        const b = await h.create_customer(admin);
        await transfer(a, { amount: 60, account_number: b.account_number }).expect(400);
        expect(await h.balance_of(a.id)).toBe(50);
        expect(await h.balance_of(b.id)).toBe(0);
    });

    test('cannot send to a disabled account', async () => {
        const a = await h.create_customer(admin, { deposit: 50 });
        const b = await h.create_customer(admin);
        await h.api().put(`/admin/disable_user/${b.id}`).set(h.bearer(admin.token)).expect(200);
        await transfer(a, { amount: 10, account_number: b.account_number }).expect(400);
        expect(await h.balance_of(a.id)).toBe(50);
    });

    test('narration is required', async () => {
        const a = await h.create_customer(admin, { deposit: 50 });
        const b = await h.create_customer(admin);
        await transfer(a, { amount: 10, account_number: b.account_number, narration: '' }).expect(400);
    });

    test('concurrent transfers cannot double-spend', async () => {
        const a = await h.create_customer(admin, { deposit: 100 });
        const b = await h.create_customer(admin);
        const results = await Promise.all(
            Array.from({ length: 6 }, () => transfer(a, { amount: 60, account_number: b.account_number })),
        );
        const ok = results.filter((r) => r.status === 200);
        expect(ok).toHaveLength(1);
        expect(await h.balance_of(a.id)).toBe(40);
        expect(await h.balance_of(b.id)).toBe(60);
    });

    test('lookup shows the recipient name before sending', async () => {
        const a = await h.create_customer(admin);
        const b = await h.create_customer(admin, { first_name: 'Chidi' });
        const res = await h.api().get(`/transaction/lookup/${b.account_number}`).set(h.bearer(a.token)).expect(200);
        expect(res.body.account.name).toBe('Chidi Doe');
        await h.api().get('/transaction/lookup/123').set(h.bearer(a.token)).expect(400);
    });
});

describe('history and summary', () => {
    test('transactions are paginated, newest first, and filterable by type', async () => {
        const u = await h.create_customer(admin);
        for (const amount of [1, 2, 3]) await deposit(u, { amount }).expect(200);
        await withdraw(u, { amount: 1 }).expect(200);

        const page1 = await h.api().get('/user/transactions?limit=2').set(h.bearer(u.token)).expect(200);
        expect(page1.body.user_transactions).toHaveLength(2);
        expect(page1.body.pagination).toMatchObject({ page: 1, limit: 2, total: 4, pages: 2 });
        expect(page1.body.user_transactions[0].transaction_type).toBe('withdrawal');

        const deposits = await h.api().get('/user/transactions?type=deposit').set(h.bearer(u.token)).expect(200);
        expect(deposits.body.user_transactions).toHaveLength(3);

        await h.api().get('/user/transactions?type=bogus').set(h.bearer(u.token)).expect(400);
    });

    test('summary totals credits and debits with 7 days of chart data', async () => {
        const u = await h.create_customer(admin, { deposit: 200 });
        await withdraw(u, { amount: 50 }).expect(200);
        const res = await h.api().get('/user/summary').set(h.bearer(u.token)).expect(200);
        const s = res.body.summary;
        expect(s).toMatchObject({ account_balance: 150, total_credit: 200, total_debit: 50, transaction_count: 2 });
        expect(s.by_day).toHaveLength(7);
        expect(s.by_day[6]).toMatchObject({ credit: 200, debit: 50 });
    });
});

describe('disabled accounts', () => {
    test('a disabled user cannot move money', async () => {
        const u = await h.create_customer(admin, { deposit: 100 });
        await h.api().put(`/admin/disable_user/${u.id}`).set(h.bearer(admin.token)).expect(200);
        await withdraw(u, { amount: 10 }).expect(403);
        await h.api().put(`/admin/enable_user/${u.id}`).set(h.bearer(admin.token)).expect(200);
        await withdraw(u, { amount: 10 }).expect(200);
    });
});

describe('records', () => {
    test('every entry has a unique transaction_id and a reference', async () => {
        const a = await h.create_customer(admin, { deposit: 100 });
        const b = await h.create_customer(admin);
        await transfer(a, { amount: 10, account_number: b.account_number }).expect(200);
        const all = await Transaction.find();
        expect(new Set(all.map((t) => t.transaction_id)).size).toBe(all.length);
        expect(all.every((t) => t.reference)).toBe(true);
    });
});
